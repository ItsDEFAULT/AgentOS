import React, { useState, useEffect } from 'react';

function EventsPanel({ currentWorkflowId }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const evtSource = new EventSource("/stream");
    evtSource.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (data.event === 'NEW_EVENT' && data.workflow_id === currentWorkflowId) {
        setEvents(prevEvents => [...prevEvents, data]);
      }
    };

    return () => {
      evtSource.close();
    };
  }, [currentWorkflowId]);

  if (!currentWorkflowId) {
    return null;
  }

  const getNodeColor = (eventType) => {
    if (eventType.includes('AGENT')) return 'bg-blue-100 border-blue-500';
    if (eventType.includes('HUMAN')) return 'bg-yellow-100 border-yellow-500';
    if (eventType.includes('COMPLETED')) return 'bg-green-100 border-green-500';
    if (eventType.includes('FAILED')) return 'bg-red-100 border-red-500';
    return 'bg-gray-100 border-gray-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Event Timeline</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {events.map((evt, index) => (
          <div key={index} className={`flex-shrink-0 w-64 h-64 p-4 rounded-lg border-l-4 ${getNodeColor(evt.type)} flex flex-col`}>
            <strong className="font-semibold text-gray-700 flex-shrink-0">{evt.type}</strong>
            <div className="overflow-y-auto mt-2">
              <pre className="text-xs text-gray-600 bg-white p-2 rounded whitespace-pre-wrap break-all">{JSON.stringify(evt.payload, null, 2)}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventsPanel;