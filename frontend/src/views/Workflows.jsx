import React, { useState, useEffect } from 'react';

function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchWorkflows = async () => {
      const response = await fetch('/workflows/list_all');
      const data = await response.json();
      setWorkflows(data);
    };
    fetchWorkflows();
  }, []);

  const filteredWorkflows = workflows.filter(wf => wf.id.toLowerCase().includes(searchTerm.toLowerCase()));

  const getNodeColor = (eventType) => {
    if (eventType.includes('AGENT')) return 'bg-blue-100 border-blue-500';
    if (eventType.includes('HUMAN')) return 'bg-yellow-100 border-yellow-500';
    if (eventType.includes('COMPLETED')) return 'bg-green-100 border-green-500';
    if (eventType.includes('FAILED')) return 'bg-red-100 border-red-500';
    return 'bg-gray-100 border-gray-500';
  };

  return (
    <div className="space-y-8">
      <input
        type="text"
        placeholder="Search by Workflow ID..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      />
      {filteredWorkflows.map(wf => (
        <div key={wf.id} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800">{wf.name}</h2>
          <p className="text-sm text-gray-500">ID: {wf.id}</p>
          <div className="mt-4 flex space-x-4 overflow-x-auto pb-4">
            {wf.events.map((evt, index) => (
              <div key={index} className={`flex-shrink-0 w-64 h-64 p-4 rounded-lg border-l-4 ${getNodeColor(evt.type)} flex flex-col`}>
                <strong className="font-semibold text-gray-700 flex-shrink-0">{evt.type}</strong>
                <div className="overflow-y-auto mt-2">
                  <pre className="text-xs text-gray-600 bg-white p-2 rounded whitespace-pre-wrap break-all">{JSON.stringify(evt.payload, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Workflows;