import React, { useState, useEffect } from 'react';

function ApprovalsPanel() {
  const [approvals, setApprovals] = useState([]);
  const [loadingState, setLoadingState] = useState({});

  const fetchApprovals = async () => {
    const response = await fetch('/approvals/pending');
    const data = await response.json();
    setApprovals(data);
  };

  useEffect(() => {
    fetchApprovals(); // Initial fetch
    const evtSource = new EventSource("/stream");
    evtSource.onmessage = function(event) {
      fetchApprovals(); // Re-fetch on any event
    };

    return () => {
      evtSource.close();
    };
  }, []);

  const submitApproval = async (approvalId, decision, responseData) => {
    setLoadingState(prev => ({ ...prev, [approvalId]: decision }));
    await fetch(`/approvals/${approvalId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, response_data: responseData })
    });
    fetchApprovals(); // Refresh after submission
    setLoadingState(prev => ({ ...prev, [approvalId]: null }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-96 flex flex-col">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex-shrink-0">Pending Approvals</h2>
      <div className="space-y-4 overflow-y-auto">
        {approvals.map(app => (
          <div key={app.id} className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800">Workflow ID: {app.workflow_id}</h3>
            <p className="mt-2 text-gray-600">{app.prompt}</p>
            {app.ui_schema && (
              <form id={`form-${app.id}`} className="mt-4 space-y-2">
                {app.ui_schema.map(field => (
                  <div key={field.name}>
                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea name={field.name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                    ) : (
                      <input type={field.type} name={field.name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    )}
                  </div>
                ))}
                <div className="flex space-x-2">
                  <button type="button" disabled={loadingState[app.id]} onClick={() => {
                    const formData = new FormData(document.getElementById(`form-${app.id}`));
                    const responseData = Object.fromEntries(formData.entries());
                    submitApproval(app.id, 'APPROVED', responseData);
                  }} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                    {loadingState[app.id] === 'APPROVED' ? 'Submitting...' : 'Approve'}
                  </button>
                  <button type="button" disabled={loadingState[app.id]} onClick={() => submitApproval(app.id, 'REJECTED')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                    {loadingState[app.id] === 'REJECTED' ? 'Submitting...' : 'Reject'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApprovalsPanel;