import { useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Genre } from '../../types/genre';
import UserGenreNode, { type UserGenreNodeData } from './UserGenreNode';

interface UserGenreFlowMapProps {
  genres: Genre[];
  onGenreClick: (genre: Genre) => void;
}

export default function UserGenreFlowMap({
  genres,
  onGenreClick,
}: UserGenreFlowMapProps) {
  // Convert genres to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return genres.map((genre) => ({
      id: String(genre.id),
      type: 'userGenreNode',
      position: { x: genre.x_position, y: genre.y_position },
      data: { genre, onClick: onGenreClick } as UserGenreNodeData,
      draggable: false, // Users can't drag nodes
      selectable: true,
    }));
  }, [genres, onGenreClick]);

  // Convert parent-child relationships to edges
  const initialEdges: Edge[] = useMemo(() => {
    return genres
      .filter((genre) => genre.parent_id !== null)
      .map((genre) => {
        const isCompleted = genre.user_progress?.is_completed ?? false;
        const isAvailable = genre.user_progress?.is_available ?? false;

        // Edge color based on child genre state
        let strokeColor = '#6b7280'; // gray for locked
        if (isCompleted) {
          strokeColor = '#10b981'; // green for completed
        } else if (isAvailable) {
          strokeColor = '#a855f7'; // purple for available
        }

        return {
          id: `e${genre.parent_id}-${genre.id}`,
          source: String(genre.parent_id),
          target: String(genre.id),
          type: 'smoothstep',
          animated: isAvailable && !isCompleted,
          style: { stroke: strokeColor, strokeWidth: 2 },
        };
      });
  }, [genres]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      userGenreNode: UserGenreNode,
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
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnScroll
          zoomOnScroll
          zoomOnPinch
        >
          <Background color="#4b5563" gap={16} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              const genre = (node.data as UserGenreNodeData).genre;
              const isCompleted = genre.user_progress?.is_completed ?? false;
              const isAvailable = genre.user_progress?.is_available ?? false;

              if (isCompleted) return '#10b981';
              if (isAvailable) return '#a855f7';
              return '#6b7280';
            }}
            maskColor="rgba(0, 0, 0, 0.6)"
            className="bg-gray-800"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
