from . import event_bus
from app.models.workflow import Workflow, db
from app.nodes.node_registry import get_node
from app.services.workflow_loader import load_workflow

def get_next_step(workflow_definition, current_step_id):
    """Finds the next step in the workflow DAG."""
    for i, step in enumerate(workflow_definition['steps']):
        if step['id'] == current_step_id:
            return workflow_definition['steps'][i+1] if i + 1 < len(workflow_definition['steps']) else None
    return None

def find_step_by_id(workflow_definition, step_id):
    """Finds a step definition by its ID."""
    for step in workflow_definition['steps']:
        if step['id'] == step_id:
            return step
    return None

def handle_event(workflow_id, event_type, payload):
    """The core logic that drives the workflow forward."""
    print(f"\n--- HANDLING EVENT: {event_type} ---")
    print(f"  Workflow ID: {workflow_id}")
    print(f"  Payload: {payload}")
    
    workflow = Workflow.query.get(workflow_id)
    if not workflow:
        print("  Workflow not found.")
        return

    workflow_definition = load_workflow(workflow.name)

    # On start, trigger the first step
    if event_type == 'WORKFLOW_STARTED':
        print(f"DEBUG: Workflow {workflow_id} started. Workflow name: {workflow.name}")
        print(f"DEBUG: Loaded workflow definition: {workflow_definition}")
        workflow.status = 'RUNNING'
        first_step = workflow_definition['steps'][0]
        trigger_step(workflow, first_step, {})

    # On step completion, trigger the next one
    elif event_type in ['NODE_COMPLETED', 'HUMAN_APPROVAL_RECEIVED']:
        workflow.status = 'RUNNING'
        current_step_id = payload['source_step_id']
        
        # Check for a branching decision from the previous node
        next_step_id = payload.get('next_step_override')
        if next_step_id:
            next_step = find_step_by_id(workflow_definition, next_step_id)
        else:
            next_step = get_next_step(workflow_definition, current_step_id)

        print(f"  Current step ID: {current_step_id}")
        print(f"  Next step ID from override: {next_step_id}")
        
        if next_step:
            print(f"  Triggering next step: {next_step['id']}")
            # Pass output from previous step as input to the next
            trigger_step(workflow, next_step, payload)
        else:
            print("  No next step found. Workflow complete.")
            workflow.status = 'COMPLETED'
            event_bus.publish(workflow_id, 'WORKFLOW_COMPLETED')

    db.session.commit()

def trigger_step(workflow, step_definition, context):
    """Executes a single step."""
    print(f"--- TRIGGERING STEP: {step_definition['id']} ---")
    print(f"  Node type: {step_definition['type']}")
    print(f"  Context: {context}")
    
    node_type = step_definition['type']
    try:
        node_class = get_node(node_type)
        node = node_class()
        node.execute(workflow, step_definition, context)
    except ValueError as e:
        print(f"ERROR: {e}")
        # Optionally, publish a WORKFLOW_FAILED event
        workflow.status = 'FAILED'
        db.session.commit()

# Subscribe the engine to the event bus
event_bus.subscribe(handle_event)