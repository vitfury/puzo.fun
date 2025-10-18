import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Genre } from '../../types/genre';
import GenreNode, { type GenreNodeData } from './GenreNode';

interface GenreFlowMapProps {
  genres: Genre[];
  onNodePositionChange: (id: number, x: number, y: number) => void;
  onEdit: (genre: Genre) => void;
  onDelete: (id: number) => void;
  onAddChild: (parentGenre: Genre) => void;
}

export default function GenreFlowMap({
  genres,
  onNodePositionChange,
  onEdit,
  onDelete,
  onAddChild,
}: GenreFlowMapProps) {
  // Convert genres to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return genres.map((genre) => ({
      id: String(genre.id),
      type: 'genreNode',
      position: { x: genre.x_position, y: genre.y_position },
      data: { genre, onEdit, onDelete, onAddChild } as GenreNodeData,
    }));
  }, [genres, onEdit, onDelete, onAddChild]);

  // Convert parent-child relationships to edges
  const initialEdges: Edge[] = useMemo(() => {
    return genres
      .filter((genre) => genre.parent_id !== null)
      .map((genre) => ({
        id: `e${genre.parent_id}-${genre.id}`,
        source: String(genre.parent_id),
        target: String(genre.id),
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#a855f7', strokeWidth: 2 },
      }));
  }, [genres]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node drag end
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const genreId = Number(node.id);
      const { x, y } = node.position;
      onNodePositionChange(genreId, Math.round(x), Math.round(y));
    },
    [onNodePositionChange]
  );

  // Handle node deletion via keyboard (Backspace/Delete)
  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      deletedNodes.forEach((node) => {
        const genreId = Number(node.id);
        if (confirm('Are you sure you want to delete this genre? All child genres will also be deleted.')) {
          onDelete(genreId);
        }
      });
    },
    [onDelete]
  );

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      genreNode: GenreNode,
    }),
    []
  );

  return (
    <div className="w-full h-full bg-gray-900">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#4b5563" gap={16} />
          <Controls />
          <MiniMap
            nodeColor="#a855f7"
            maskColor="rgba(0, 0, 0, 0.6)"
            className="bg-gray-800"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
