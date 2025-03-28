"use client";

import React, { useState, useCallback, useEffect, FC } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  OnConnect,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

interface EditableNodeProps {
  data: {
    label: string;
    onChange?: (id: string, value: string) => void;
  };
  id: string;
}

/**
 * A custom node that renders an input field.
 * It uses React Flow's Handle components to allow connections
 * from both the top (target) and bottom (source) of the node.
 */
const EditableNode: FC<EditableNodeProps> = ({ data, id }) => {
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    data.onChange && data.onChange(id, evt.target.value);
  };

  return (
    <div className="p-2 bg-white rounded shadow">
      <Handle type="target" position={Position.Top} />
      <input
        className="border border-gray-300 rounded p-1"
        value={data.label}
        onChange={handleChange}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = {
  editable: EditableNode,
};

export default function MindMapPage() {
  const [mindMapName, setMindMapName] = useState("Untitled Mind Map");

  // Initial node and edge definitions.
  // Note: We don’t include the onChange callback here; we’ll add it later.
  const initialNodes: Node[] = [
    {
      id: "1",
      type: "editable",
      position: { x: 150, y: 150 },
      data: { label: "Start Node" },
    },
  ];
  const initialEdges: Edge[] = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Function to update a node's label.
  const updateNodeLabel = useCallback(
    (id: string, value: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? {
                ...node,
                data: { ...node.data, label: value, onChange: updateNodeLabel },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  // Ensure that all nodes have the onChange callback attached.
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, onChange: updateNodeLabel },
      })),
    );
  }, [updateNodeLabel, setNodes]);

  // onConnect handler for connecting nodes with edges.
  const onConnect: OnConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges],
  );

  // Handler to add a new node at a random position.
  const addNode = () => {
    const newId = (nodes.length + 1).toString();
    const newNode: Node = {
      id: newId,
      type: "editable",
      position: {
        x: Math.random() * 800,
        y: Math.random() * 600,
      },
      data: { label: `Node ${newId}`, onChange: updateNodeLabel },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header with Mind Map Name and Add Node Button */}
      <header className="p-4 bg-gray-800 text-white flex items-center justify-between">
        <input
          type="text"
          value={mindMapName}
          onChange={(e) => setMindMapName(e.target.value)}
          placeholder="Name your mind map..."
          className="bg-gray-700 p-2 rounded-md text-white placeholder-gray-300 focus:outline-none"
        />
        <button
          onClick={addNode}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
        >
          Add Node
        </button>
      </header>

      {/* Main Mind Map Container */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          connectionLineStyle={{ stroke: "#ddd", strokeWidth: 2 }}
          // Removing snapToGrid and Background for free dragging.
          nodeTypes={nodeTypes}
        >
          <MiniMap nodeColor={() => "#FFCC00"} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
