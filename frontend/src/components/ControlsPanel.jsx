import React, { useState, useEffect } from 'react';

function ControlsPanel({ setCurrentWorkflowId }) {
  const [workflowId, setWorkflowId] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      const response = await fetch('/workflows/list');
      const data = await response.json();
      setWorkflows(data);
      if (data.length > 0) {
        setSelectedWorkflow(data[0]);
      }
    };
    fetchWorkflows();
  }, []);

  const runWorkflow = async () => {
    if (!selectedWorkflow) return;
    setIsLoading(true);

    const response = await fetch(`/workflows/run?workflow_name=${selectedWorkflow}`, { method: 'POST' });
    const data = await response.json();
    setWorkflowId(data.workflow_id);
    setCurrentWorkflowId(data.workflow_id);
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Controls</h2>
      <div className="space-y-4">
        <select value={selectedWorkflow} onChange={e => setSelectedWorkflow(e.target.value)} className="p-2 border border-gray-300 rounded-md w-full">
          {workflows.map(wf => <option key={wf} value={wf}>{wf}</option>)}
        </select>
        <button onClick={runWorkflow} disabled={isLoading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full disabled:bg-gray-400">
          {isLoading ? 'Running...' : 'Run New Workflow'}
        </button>
      </div>
      <p className="mt-4 text-gray-600">Current Workflow ID: <strong className="font-mono">{workflowId || 'None'}</strong></p>
    </div>
  );
}

export default ControlsPanel;