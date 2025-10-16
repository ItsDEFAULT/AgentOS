import React from 'react';

function InstructionsPanel() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">YAML Instructions</h2>
      <div className="space-y-4 text-sm text-gray-600">
        <p><strong>name:</strong> The name of your workflow.</p>
        <p><strong>description:</strong> A brief description of what your workflow does.</p>
        <p><strong>steps:</strong> A list of steps that make up your workflow.</p>
        <div className="ml-4">
          <p><strong>id:</strong> A unique identifier for the step.</p>
          <p><strong>type:</strong> The type of node to use. Available types: `agent`, `human_approval`, `choice`.</p>
          <p><strong>prompt:</strong> The instructions for the agent or the prompt for human approval.</p>
          <p><strong>next_step:</strong> The ID of the next step to execute.</p>
          <p><strong>choices:</strong> (For `choice` nodes) A list of conditions and corresponding `next_step` IDs.</p>
          <p><strong>channel:</strong> (For `human_approval` nodes) The channel to send the approval request to (e.g., `email`, `slack`).</p>
          <p><strong>ui_schema:</strong> (For `human_approval` nodes) A YAML schema to dynamically generate a UI.</p>
        </div>
      </div>
    </div>
  );
}

export default InstructionsPanel;