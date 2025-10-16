import React, { useRef } from 'react';
import Draggable from 'react-draggable';

function WorkflowEditor() {
  const nodes = [
    { id: 'start', name: 'Start', position: { x: 50, y: 50 } },
    { id: 'agent1', name: 'Agent Action', position: { x: 200, y: 150 } },
    { id: 'end', name: 'End', position: { x: 50, y: 250 } },
  ];

  const nodeRefs = useRef(nodes.map(() => React.createRef()));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Workflow Editor</h2>
      <div className="relative h-96 border border-gray-300 rounded-lg">
        {nodes.map((node, i) => (
          <Draggable key={node.id} defaultPosition={node.position} bounds="parent" nodeRef={nodeRefs.current[i]}>
            <div ref={nodeRefs.current[i]} className="absolute p-2 bg-gray-200 border border-gray-400 rounded-md cursor-move">
              {node.name}
            </div>
          </Draggable>
        ))}
      </div>
    </div>
  );
}

export default WorkflowEditor;