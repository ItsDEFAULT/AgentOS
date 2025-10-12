from flask import current_app as app, jsonify, request, render_template
from app import db
from app.models.workflow import Workflow, Approval
from app.models.event import Event
from app.services import event_bus
from app.services.workflow_engine import WORKFLOW_DEFINITION

@app.route('/')
def index():
    """Serves the main HTML page."""
    return render_template('index.html')

@app.route('/workflows/run', methods=['POST'])
def run_workflow():
    """Starts our hardcoded workflow."""
    new_workflow = Workflow(name=WORKFLOW_DEFINITION['name'])
    db.session.add(new_workflow)
    db.session.commit()
    event_bus.publish(new_workflow.id, 'WORKFLOW_STARTED')
    return jsonify({'message': 'Workflow started', 'workflow_id': new_workflow.id}), 202

@app.route('/approvals/pending', methods=['GET'])
def get_pending_approvals():
    """Gets all approvals waiting for a human."""
    approvals = Approval.query.filter_by(status='PENDING').all()
    return jsonify([{'id': a.id, 'prompt': a.prompt} for a in approvals])

@app.route('/approvals/<approval_id>/submit', methods=['POST'])
def submit_approval(approval_id):
    """The endpoint the human UI calls to approve/reject."""
    decision = request.json.get('decision') # 'APPROVED' or 'REJECTED'
    approval = Approval.query.get(approval_id)
    if not approval or approval.status != 'PENDING':
        return jsonify({'error': 'Approval not found or already handled'}), 404

    approval.status = decision
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