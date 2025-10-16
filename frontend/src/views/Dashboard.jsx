import React from 'react';
import ControlsPanel from '../components/ControlsPanel';
import EventsPanel from '../components/EventsPanel';
import ApprovalsPanel from '../components/ApprovalsPanel';

function Dashboard({ currentWorkflowId, setCurrentWorkflowId }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ControlsPanel setCurrentWorkflowId={setCurrentWorkflowId} />
        <ApprovalsPanel />
      </div>
      <EventsPanel currentWorkflowId={currentWorkflowId} />
    </div>
  );
}

export default Dashboard;