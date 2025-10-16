from uuid import uuid4
from flask import current_app as app, jsonify, request, render_template, Response
import json
from app import db
from app.models.workflow import Workflow, Approval
from app.models.event import Event
from app.services import event_bus
from app.services.workflow_loader import load_workflow
from app.services.event_replay import replay_workflow, WorkflowStatus, ApprovalStatus
from app.services.message_queue import get_message
import os

@app.route('/workflows/<workflow_id>/replay', methods=['GET'])
def replay_workflow_api(workflow_id):
    """
    Replays all events for a workflow and returns reconstructed state.
    Optional query param: up_to_event (int)
    """
    up_to_event = request.args.get('up_to_event', default=None, type=int)
    state = replay_workflow(workflow_id, up_to_event=up_to_event)
    # Serialize enums to string for JSON
    approvals_serialized = {
        aid: {
            'status': val['status'].value if isinstance(val['status'], ApprovalStatus) else val['status'],
            'prompt': val['prompt'],
            'ui_schema': val.get('ui_schema'),
            'response_data': val.get('response_data')
        } for aid, val in state.approvals.items()
    }
    return jsonify({
        'status': state.status.value if isinstance(state.status, WorkflowStatus) else state.status,
        'outputs': state.outputs,
        'approvals': approvals_serialized,
        'history': state.history
    })

@app.route('/')
def index():
    """Serves the main HTML page."""
    return app.send_static_file('index.html')

@app.route('/workflows/run', methods=['POST'])
def run_workflow():
    """Starts a workflow based on the provided name or defaults to 'sample_blog.yaml'."""
    workflow_name = request.args.get('workflow_name', 'sample_blog.yaml')
    try:
        workflow_definition = load_workflow(workflow_name)
    except FileNotFoundError:
        return jsonify({'error': f"Workflow '{workflow_name}' not found."}), 404

    new_workflow = Workflow(name=workflow_name)
    db.session.add(new_workflow)
    db.session.commit()

    event_bus.publish(new_workflow.id, 'WORKFLOW_STARTED')
    return jsonify({'message': 'Workflow started', 'workflow_id': new_workflow.id}), 202

@app.route('/approvals/pending', methods=['GET'])
def get_pending_approvals():
    """Gets all approvals waiting for a human."""
    approvals = Approval.query.filter_by(status='PENDING').all()
    return jsonify([{
       'id': a.id,
       'workflow_id': a.workflow_id,
       'prompt': a.prompt,
       'ui_schema': a.ui_schema,
       'created_at': a.created_at.isoformat() if a.created_at else None,
       'expires_at': a.expires_at.isoformat() if a.expires_at else None
   } for a in approvals])

@app.route('/approvals/<approval_id>/submit', methods=['POST'])
def submit_approval(approval_id):
    """The endpoint the human UI calls to approve/reject."""
    data = request.json
    decision = data.get('decision') # 'APPROVED' or 'REJECTED'
    response_data = data.get('response_data') # Data from dynamic UI form
    
    approval = Approval.query.get(approval_id)
    if not approval or approval.status != 'PENDING':
        return jsonify({'error': 'Approval not found or already handled'}), 404

    approval.status = decision
    approval.response_data = response_data # Store the response data
    db.session.commit()

    # Find the step that requested this approval to pass it in the payload
    # For the hackathon, we can find the event
    request_event = Event.query.filter_by(event_type='HUMAN_APPROVAL_REQUESTED').\
        filter(Event.payload.op('->>')('approval_id') == approval_id).first()

    payload = {
        'source_step_id': request_event.payload['source_step_id'],
        'decision': decision
    }
    event_bus.publish(approval.workflow_id, 'HUMAN_APPROVAL_RECEIVED', payload)
    return jsonify({'message': 'Decision recorded'})

@app.route('/workflows/<workflow_id>/events', methods=['GET'])
def get_workflow_events(workflow_id):
    """Gets the event timeline for a workflow."""
    events = Event.query.filter_by(workflow_id=workflow_id).order_by(Event.timestamp).all()
    return jsonify([{
        'type': e.event_type,
        'payload': e.payload,
        'timestamp': e.timestamp.isoformat()
    } for e in events])

@app.route('/workflows/<workflow_id>/fork_and_resume', methods=['POST', 'GET'])
def fork_and_resume_workflow(workflow_id):
    """
    Forks a workflow by replaying events up to N, then resumes execution from that point.
    Accepts up_to_event as a URL query parameter.
    Returns new workflow ID and reconstructed state.
    """
    up_to_event = request.args.get('up_to_event', default=None, type=int)
    if up_to_event is None:
        return jsonify({ 'error': 'up_to_event is required as a query parameter' }), 400

    # 1. Replay events up to N
    state = replay_workflow(workflow_id, up_to_event=up_to_event)

    # 2. Create new workflow (fork)
    orig_workflow = Workflow.query.get(workflow_id)
    if not orig_workflow:
        return jsonify({ 'error': 'Original workflow not found' }), 404

    new_workflow = Workflow(
        id=str(uuid4()),
        name=orig_workflow.name,
        status=state.status.value if hasattr(state.status, 'value') else state.status,
        version=orig_workflow.version + 1,
        parent_id=orig_workflow.id
    )
    db.session.add(new_workflow)
    db.session.commit()

    # 3. Copy approvals (if any) to new workflow
    for aid, val in state.approvals.items():
        db.session.add(Approval(
            id=str(uuid4()),
            workflow_id=new_workflow.id,
            status=val['status'].value if hasattr(val['status'], 'value') else val['status'],
            prompt=val['prompt']
        ))
    db.session.commit()

    # 4. Trigger next step in new workflow (if possible)
    # Find last event in replayed history
    last_event = state.history[-1] if state.history else None
    if last_event:
        # Use event_bus to publish the last event type and payload to new workflow
        event_bus.publish(new_workflow.id, last_event['type'], last_event['payload'])

    # 5. Return new workflow ID and reconstructed state
    approvals_serialized = {
        aid: {
            'status': val['status'].value if hasattr(val['status'], 'value') else val['status'],
            'prompt': val['prompt'],
            'ui_schema': val.get('ui_schema'),
            'response_data': val.get('response_data')
        } for aid, val in state.approvals.items()
    }
    return jsonify({
        'new_workflow_id': new_workflow.id,
        'status': state.status.value if hasattr(state.status, 'value') else state.status,
        'outputs': state.outputs,
        'approvals': approvals_serialized,
        'history': state.history
    }), 201

@app.route('/stream')
def stream():
    """Server-Sent Events endpoint."""
    def event_stream():
        while True:
            # Blocking call, waits for a message
            data = get_message()
            yield f"data: {json.dumps(data)}\n\n"
    return Response(event_stream(), mimetype="text/event-stream")

@app.route('/workflows/list', methods=['GET'])
def list_workflows():
    """Lists all available YAML workflow files."""
    workflows_dir = os.path.join(os.path.dirname(__file__), '..', 'workflows')
    files = [f for f in os.listdir(workflows_dir) if f.endswith('.yaml')]
    return jsonify(files)

@app.route('/workflows/load', methods=['GET'])
def load_workflow_file():
    """Loads the content of a specific workflow file."""
    workflow_name = request.args.get('workflow_name')
    if not workflow_name:
        return jsonify({'error': 'workflow_name is required'}), 400
    
    try:
        with open(os.path.join(os.path.dirname(__file__), '..', 'workflows', workflow_name), 'r') as f:
            content = f.read()
        return jsonify({'content': content})
    except FileNotFoundError:
        return jsonify({'error': f"Workflow '{workflow_name}' not found."}), 404

@app.route('/workflows/save', methods=['POST'])
def save_workflow_file():
    """Saves content to a workflow file."""
    data = request.json
    workflow_name = data.get('workflow_name')
    content = data.get('content')

    if not workflow_name or not content:
        return jsonify({'error': 'workflow_name and content are required'}), 400

    with open(os.path.join(os.path.dirname(__file__), '..', 'workflows', workflow_name), 'w') as f:
        f.write(content)
    
    return jsonify({'message': f"Workflow '{workflow_name}' saved successfully."})

@app.route('/workflows/list_all', methods=['GET'])
def list_all_workflows():
    """Lists all workflows and their events."""
    workflows = Workflow.query.all()
    output = []
    for wf in workflows:
        events = Event.query.filter_by(workflow_id=wf.id).order_by(Event.timestamp).all()
        output.append({
            'id': wf.id,
            'name': wf.name,
            'status': wf.status,
            'created_at': wf.created_at.isoformat(),
            'events': [{'type': e.event_type, 'payload': e.payload} for e in events]
        })
    return jsonify(output)