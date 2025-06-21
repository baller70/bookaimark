import React, { useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { BoardNode } from './BoardNode';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Development', bookmarks: [
      { id: 'b1', title: 'GitHub' },
      { id: 'b2', title: 'Stack Overflow' },
    ] },
    type: 'board',
  },
  {
    id: '2',
    position: { x: 400, y: 120 },
    data: { label: 'Design', bookmarks: [
      { id: 'b3', title: 'Figma' },
    ] },
    type: 'board',
  }
];

const initialEdges: Edge[] = [];

/**
 * A minimal, zero-configuration board canvas powered by React Flow.
 * – Drag nodes anywhere (no grid by default)
 * – Create connections by dragging from a node's handle to another node
 * – Add new nodes with the "Add Board" button
 */
export const SimpleBoardCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // helper
  const updateNodeBookmarks = (nodeId: string, items: any[]) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, bookmarks: items } } : n
      )
    );
  };

  const nodeTypes: NodeTypes = {
    board: (props) => (
      <BoardNode
        {...props}
        data={{
          ...props.data,
          updateBookmarks: (items: any[]) => updateNodeBookmarks(props.id, items),
        }}
      />
    ),
  };

  // Create edge on connection
  const handleConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Add new node at random position
  const handleAddNode = () => {
    const id = (nodes.length + 1).toString();
    const newNode: Node = {
      id,
      position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 },
      data: { label: `Board ${id}`, bookmarks: [] },
      type: 'board',
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="w-full h-full relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-50 space-x-2">
        <Button size="sm" onClick={handleAddNode}>
          + Board
        </Button>
      </div>

      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-gray-50"
        >
          <Background gap={12} color="#e5e7eb" />
          <MiniMap />
          <Controls position="bottom-right" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}; 