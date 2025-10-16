import React, { useState } from 'react';

function Fork() {
  const [workflowId, setWorkflowId] = useState('');
  const [upToEvent, setUpToEvent] = useState('');
  const [forkData, setForkData] = useState(null);

  const handleFork = async (e) => {
    e.preventDefault();
    const response = await fetch(`/workflows/${workflowId}/fork_and_resume?up_to_event=${upToEvent}`, { method: 'POST' });
    const data = await response.json();
    setForkData(data);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Fork Workflow</h2>
      <form onSubmit={handleFork} className="space-y-4">
        <div>
          <label htmlFor="workflowId" className="block text-sm font-medium text-gray-700">Original Workflow ID</label>
          <input type="text" id="workflowId" value={workflowId} onChange={e => setWorkflowId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="upToEvent" className="block text-sm font-medium text-gray-700">Fork Up To Event #</label>
          <input type="number" id="upToEvent" value={upToEvent} onChange={e => setUpToEvent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Fork
        </button>
      </form>

      {forkData && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800">Fork Result</h3>
          <p className="text-sm text-gray-500">New Workflow ID: {forkData.new_workflow_id}</p>
          <pre className="text-sm text-gray-600 bg-gray-100 p-4 rounded mt-2 whitespace-pre-wrap break-all">{JSON.stringify(forkData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Fork;