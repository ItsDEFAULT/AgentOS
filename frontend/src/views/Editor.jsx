import React, { useState, useEffect } from 'react';
import InstructionsPanel from '../components/InstructionsPanel';

function Editor() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [workflowContent, setWorkflowContent] = useState('');

  useEffect(() => {
    const fetchWorkflows = async () => {
      const response = await fetch('/workflows/list');
      const data = await response.json();
      setWorkflows(data);
      if (data.length > 0) {
        setSelectedWorkflow(data[0]);
        loadWorkflow(data[0]);
      }
    };
    fetchWorkflows();
  }, []);

  const loadWorkflow = async (workflowName) => {
    const response = await fetch(`/workflows/load?workflow_name=${workflowName}`);
    const data = await response.json();
    setWorkflowContent(data.content);
  };

  const saveWorkflow = async () => {
    await fetch('/workflows/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow_name: selectedWorkflow, content: workflowContent })
    });
    alert('Workflow saved!');
  };

  const newWorkflow = () => {
    const workflowName = prompt("Enter a new workflow name (e.g., my_workflow.yaml):");
    if (workflowName) {
      const newContent = `name: ${workflowName}\ndescription: A new workflow.\nsteps:\n  - id: start\n    type: agent\n    prompt: "Start"\n    next_step: end\n  - id: end\n    type: agent\n    prompt: "End"`;
      setWorkflowContent(newContent);
      setSelectedWorkflow(workflowName);
      setWorkflows(prev => [...prev, workflowName]);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <select value={selectedWorkflow} onChange={e => {
          setSelectedWorkflow(e.target.value);
          loadWorkflow(e.target.value);
        }} className="p-2 border border-gray-300 rounded-md">
          {workflows.map(wf => <option key={wf} value={wf}>{wf}</option>)}
        </select>
        <button onClick={saveWorkflow} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Save Workflow
        </button>
        <button onClick={newWorkflow} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          New Workflow
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <textarea value={workflowContent} onChange={e => setWorkflowContent(e.target.value)} className="w-full h-96 p-2 border border-gray-300 rounded-md font-mono"></textarea>
        <InstructionsPanel />
      </div>
    </div>
  );
}

export default Editor;