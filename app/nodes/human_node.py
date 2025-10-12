from .base_node import BaseNode
from app.services import event_bus
from app.models.workflow import Approval, db

class HumanApprovalNode(BaseNode):
    def execute(self, workflow, step_definition, context):
        print(f"Executing HumanApprovalNode for step: {step_definition['id']}")
        workflow.status = 'PAUSED'

        # Create an approval request in the database
        prompt_text = f"{step_definition['prompt']} Context: {context.get('output', 'N/A')}"
        new_approval = Approval(workflow_id=workflow.id, prompt=prompt_text)
        db.session.add(new_approval)
        db.session.commit()

        # The workflow now waits for an external event to resume
        payload = {'source_step_id': step_definition['id'], 'approval_id': new_approval.id}
        event_bus.publish(workflow.id, 'HUMAN_APPROVAL_REQUESTED', payload)