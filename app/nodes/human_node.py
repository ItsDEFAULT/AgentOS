from datetime import datetime, timedelta
from .base_node import BaseNode
from app.services import event_bus
from app.models.workflow import Approval, db
from app.services.communication_service import send_approval_request

class HumanApprovalNode(BaseNode):
    def execute(self, workflow, step_definition, context):
        print(f"Executing HumanApprovalNode for step: {step_definition['id']}")
        workflow.status = 'PAUSED'

        # Create an approval request in the database
        prompt_text = f"{step_definition['prompt']} Context: {context.get('output', 'N/A')}"
        ui_schema = step_definition.get('ui_schema') # Extract ui_schema from step_definition
        timeout_seconds = step_definition.get('timeout_seconds', 3600) # Default to 1 hour
        max_retries = step_definition.get('max_retries', 0)

        expires_at = datetime.utcnow() + timedelta(seconds=timeout_seconds)

        new_approval = Approval(
            workflow_id=workflow.id,
            prompt=prompt_text,
            ui_schema=ui_schema,
            expires_at=expires_at,
            max_retries=max_retries
        )
        db.session.add(new_approval)
        db.session.commit()

        # The workflow now waits for an external event to resume
        channel = step_definition.get('channel', 'default') # e.g., 'email', 'slack', 'default'
        
        # Send the approval request via the specified channel
        send_approval_request(new_approval, channel)
        
        payload = {'source_step_id': step_definition['id'], 'approval_id': new_approval.id, 'channel': channel}
        event_bus.publish(workflow.id, 'HUMAN_APPROVAL_REQUESTED', payload)