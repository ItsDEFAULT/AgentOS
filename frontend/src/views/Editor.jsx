import React, { useState, useEffect } from 'react';
import WorkflowEditor from '../components/WorkflowEditor';

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
      </div>
      <textarea value={workflowContent} onChange={e => setWorkflowContent(e.target.value)} className="w-full h-96 p-2 border border-gray-300 rounded-md font-mono"></textarea>
      <WorkflowEditor />
    </div>
  );
}

export default Editor;