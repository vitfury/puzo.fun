import { useCallback, useMemo, useEffect, useState } from 'react';
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
  EdgeTypes,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Genre } from '../../types/genre';
import GenreNode, { type GenreNodeData } from './GenreNode';
import SmoothBezierEdge from '../genres/SmoothBezierEdge';

interface GenreFlowMapProps {
  genres: Genre[];
  onNodePositionChange: (id: number, x: number, y: number) => void;
  onEdit: (genre: Genre) => void;
  onDelete: (id: number) => void;
  onAddChild: (parentGenre: Genre) => void;
  onParentConnectionChange: (genreId: number, parentIds: number[]) => void;
}

export default function GenreFlowMap({
  genres,
  onNodePositionChange,
  onEdit,
  onDelete,
  onAddChild,
  onParentConnectionChange,
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

  // Convert parent-child relationships to edges (from both legacy parent_id and many-to-many parent_ids)
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    genres.forEach((genre) => {
      // Legacy single parent
      if (genre.parent_id !== null) {
        edges.push({
          id: `e${genre.parent_id}-${genre.id}`,
          source: String(genre.parent_id),
          target: String(genre.id),
          type: 'smoothBezier',
          animated: true,
          style: { stroke: '#a855f7', strokeWidth: 2 },
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
            animated: true,
            style: { stroke: '#a855f7', strokeWidth: 2 },
          });
        }
      });
    });
    
    return edges;
  }, [genres]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update edges when genres change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Track connection start to handle connection end
  const [connectionStart, setConnectionStart] = useState<{ sourceId: number } | null>(null);
  const [connectionSuccessful, setConnectionSuccessful] = useState(false);

  const onConnectStart = useCallback(
    (_event: React.MouseEvent<Element, MouseEvent> | React.TouchEvent<Element>, { nodeId }: { nodeId: string | null }) => {
      if (nodeId) {
        setConnectionStart({ sourceId: Number(nodeId) });
        setConnectionSuccessful(false);
      }
    },
    []
  );


  const onConnect = useCallback(
    (params: Connection) => {
      // Connection was successful - this will prevent onConnectEnd from creating a new genre
      setConnectionSuccessful(true);

      // Add new edge with smoothBezier type
      setEdges((eds: Edge[]) => {
        const newEdge = addEdge(
          {
            ...params,
            type: 'smoothBezier',
            animated: true,
            style: { stroke: '#a855f7', strokeWidth: 2 },
          },
          eds
        );
        
        // Update parent connections in backend
        const targetGenreId = Number(params.target);
        const sourceGenreId = Number(params.source);
        
        // Get current parent IDs for target genre
        const targetGenre = genres.find(g => g.id === targetGenreId);
        const currentParentIds = targetGenre?.parent_ids || [];
        
        // Add new parent if not already present
        if (!currentParentIds.includes(sourceGenreId)) {
          const newParentIds = [...currentParentIds, sourceGenreId];
          onParentConnectionChange(targetGenreId, newParentIds);
        }
        
        return newEdge;
      });
    },
    [setEdges, genres, onParentConnectionChange]
  );

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      deletedEdges.forEach((edge) => {
        const targetGenreId = Number(edge.target);
        const sourceGenreId = Number(edge.source);
        
        // Get current parent IDs for target genre
        const targetGenre = genres.find(g => g.id === targetGenreId);
        const currentParentIds = targetGenre?.parent_ids || [];
        
        // Remove parent connection
        const newParentIds = currentParentIds.filter(id => id !== sourceGenreId);
        onParentConnectionChange(targetGenreId, newParentIds);
      });
      
      // Remove edges from state
      setEdges((eds) => eds.filter((e) => !deletedEdges.includes(e)));
    },
    [genres, onParentConnectionChange, setEdges]
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

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      smoothBezier: SmoothBezierEdge,
    }),
    []
  );

  return (
    <div className="w-full h-full bg-gray-900">
      <ReactFlowProvider>
        <FlowMapContent
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onEdgesDelete={onEdgesDelete}
          onNodeDragStop={onNodeDragStop}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionStart={connectionStart}
          connectionSuccessful={connectionSuccessful}
          setConnectionStart={setConnectionStart}
          setConnectionSuccessful={setConnectionSuccessful}
          genres={genres}
          onAddChild={onAddChild}
        />
      </ReactFlowProvider>
    </div>
  );
}

function FlowMapContent({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onConnectStart,
  onEdgesDelete,
  onNodeDragStop,
  onNodesDelete,
  nodeTypes,
  edgeTypes,
  connectionStart,
  connectionSuccessful,
  setConnectionStart,
  setConnectionSuccessful,
  genres,
  onAddChild,
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  onConnectStart: any; // React Flow's OnConnectStart type
  onEdgesDelete: (edges: Edge[]) => void;
  onNodeDragStop: (event: React.MouseEvent, node: Node) => void;
  onNodesDelete: (nodes: Node[]) => void;
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
  connectionStart: { sourceId: number } | null;
  connectionSuccessful: boolean;
  setConnectionStart: (value: { sourceId: number } | null) => void;
  setConnectionSuccessful: (value: boolean) => void;
  genres: Genre[];
  onAddChild: (genre: Genre) => void;
}) {

  const handleConnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent) => {
      if (!connectionStart || connectionSuccessful) {
        setConnectionStart(null);
        setConnectionSuccessful(false);
        return;
      }

      // Connection was not successful (dropped in empty space), create new genre
      // Find parent genre
      const parentGenre = genres.find(g => g.id === connectionStart.sourceId);
      if (parentGenre) {
        // Create new genre
        onAddChild(parentGenre);
      }
      
      setConnectionStart(null);
      setConnectionSuccessful(false);
    },
    [connectionStart, connectionSuccessful, genres, onAddChild, setConnectionStart, setConnectionSuccessful]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={handleConnectEnd}
      onEdgesDelete={onEdgesDelete}
      onNodeDragStop={onNodeDragStop}
      onNodesDelete={onNodesDelete}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
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
  );
}
