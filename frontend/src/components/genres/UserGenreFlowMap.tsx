import { useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Genre } from '../../types/genre';
import UserGenreNode, { type UserGenreNodeData } from './UserGenreNode';
import SmoothBezierEdge from './SmoothBezierEdge';

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

  // Convert parent-child relationships to edges (from both legacy parent_id and many-to-many parent_ids)
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    genres.forEach((genre) => {
      const isCompleted = genre.user_progress?.is_completed ?? false;
      const isAvailable = genre.user_progress?.is_available ?? false;

      // Edge color based on child genre state
      let strokeColor = '#6b7280'; // gray for locked
      if (isCompleted) {
        strokeColor = '#10b981'; // green for completed
      } else if (isAvailable) {
        strokeColor = '#a855f7'; // purple for available
      }

      // Legacy single parent
      if (genre.parent_id !== null) {
        edges.push({
          id: `e${genre.parent_id}-${genre.id}`,
          source: String(genre.parent_id),
          target: String(genre.id),
          type: 'smoothBezier',
          animated: isAvailable && !isCompleted,
          style: { stroke: strokeColor, strokeWidth: 2 },
        });
      }
      
      // Many-to-many parents
      const parentIds = genre.parent_ids || [];
      parentIds.forEach((parentId) => {
        // Skip if already added as legacy parent
        if (parentId !== genre.parent_id) {
          edges.push({
            id: `e${parentId}-${genre.id}`,
            source: String(parentId),
            target: String(genre.id),
            type: 'smoothBezier',
            animated: isAvailable && !isCompleted,
            style: { stroke: strokeColor, strokeWidth: 2 },
          });
        }
      });
    });
    
    return edges;
  }, [genres]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      userGenreNode: UserGenreNode,
    }),
    []
  );

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      smoothBezier: SmoothBezierEdge,
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
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-right"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnScroll={false}
          zoomOnScroll
          zoomOnPinch
        >
          <Background color="#1f2937" gap={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
