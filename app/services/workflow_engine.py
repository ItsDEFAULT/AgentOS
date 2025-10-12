from . import event_bus
from app.models.workflow import Workflow, db
from app.nodes.agent_node import AgentNode
from app.nodes.human_node import HumanApprovalNode

# HACKATHON: Hardcode the workflow definition
WORKFLOW_DEFINITION = {
    'name': 'Generate and Approve Blog Post',
    'steps': [
        {'id': 'step1', 'type': 'agent', 'prompt': 'Generate a short, catchy title for a blog post about AI orchestration.'},
        {'id': 'step2', 'type': 'human', 'prompt': 'Please approve the generated title.'},
        {'id': 'step3', 'type': 'agent', 'prompt': 'The title was approved. Now, write a 2-paragraph blog post with that title.'}
    ]
}

def get_next_step(current_step_id):
    """Finds the next step in our hardcoded DAG."""
    for i, step in enumerate(WORKFLOW_DEFINITION['steps']):
        if step['id'] == current_step_id:
            return WORKFLOW_DEFINITION['steps'][i+1] if i + 1 < len(WORKFLOW_DEFINITION['steps']) else None
    return None

def handle_event(workflow_id, event_type, payload):
    """The core logic that drives the workflow forward."""
    workflow = Workflow.query.get(workflow_id)
    if not workflow:
        return

    # On start, trigger the first step
    if event_type == 'WORKFLOW_STARTED':
        workflow.status = 'RUNNING'
        first_step = WORKFLOW_DEFINITION['steps'][0]
        trigger_step(workflow, first_step, {})

    # On step completion, trigger the next one
    elif event_type in ['NODE_COMPLETED', 'HUMAN_APPROVAL_RECEIVED']:
        workflow.status = 'RUNNING'
        current_step_id = payload['source_step_id']
        next_step = get_next_step(current_step_id)

        if next_step:
            # Pass output from previous step as input to the next
            trigger_step(workflow, next_step, payload)
        else:
            workflow.status = 'COMPLETED'
            event_bus.publish(workflow_id, 'WORKFLOW_COMPLETED')

    db.session.commit()

def trigger_step(workflow, step_definition, context):
    """Executes a single step."""
    node_type = step_definition['type']

    if node_type == 'agent':
        node = AgentNode()
        node.execute(workflow, step_definition, context)
    elif node_type == 'human':
        node = HumanApprovalNode()
        node.execute(workflow, step_definition, context)

# Subscribe the engine to the event bus
event_bus.subscribe(handle_event)