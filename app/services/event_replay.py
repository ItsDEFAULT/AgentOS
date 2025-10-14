
from app.models.event import Event
from app.models.workflow import Workflow, Approval
from app import db
from enum import Enum

class WorkflowStatus(Enum):
    PENDING = 'PENDING'
    RUNNING = 'RUNNING'
    PAUSED = 'PAUSED'
    COMPLETED = 'COMPLETED'
    FAILED = 'FAILED'


class ApprovalStatus(Enum):
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'

class WorkflowState:
    def __init__(self):
        self.status = WorkflowStatus.PENDING
        self.steps = []
        self.outputs = {}
        self.approvals = {}
        self.history = []

    def apply_event(self, event):
        self.history.append({
            'type': event.event_type,
            'payload': event.payload,
            'timestamp': event.timestamp
        })
        # Basic event handling logic
        if event.event_type == 'WORKFLOW_STARTED':
            self.status = WorkflowStatus.RUNNING
        elif event.event_type == 'NODE_COMPLETED':
            step_id = event.payload.get('source_step_id')
            output = event.payload.get('output')
            if step_id:
                self.outputs[step_id] = output
        elif event.event_type == 'HUMAN_APPROVAL_REQUESTED':
            approval_id = event.payload.get('approval_id')
            prompt = event.payload.get('prompt')
            if approval_id:
                self.approvals[approval_id] = {
                    'status': ApprovalStatus.PENDING,
                    'prompt': prompt
                }
        elif event.event_type == 'HUMAN_APPROVAL_RECEIVED':
            approval_id = event.payload.get('approval_id')
            decision = event.payload.get('decision')
            if approval_id and approval_id in self.approvals:
                # Map decision string to enum
                if decision == ApprovalStatus.APPROVED.value:
                    self.approvals[approval_id]['status'] = ApprovalStatus.APPROVED
                elif decision == ApprovalStatus.REJECTED.value:
                    self.approvals[approval_id]['status'] = ApprovalStatus.REJECTED
                else:
                    self.approvals[approval_id]['status'] = ApprovalStatus.PENDING
        elif event.event_type == 'WORKFLOW_COMPLETED':
            self.status = WorkflowStatus.COMPLETED
        elif event.event_type == 'NODE_FAILED':
            self.status = WorkflowStatus.FAILED


def replay_workflow(workflow_id, up_to_event=None):
    """
    Replays all events for a workflow and reconstructs its state.
    If up_to_event is provided, replay only up to that event index.
    Returns a WorkflowState object.
    """
    query = Event.query.filter_by(workflow_id=workflow_id).order_by(Event.timestamp)
    events = query.all()
    if up_to_event is not None:
        events = events[:up_to_event]
    state = WorkflowState()
    for event in events:
        state.apply_event(event)
    return state
