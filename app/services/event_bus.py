from app import db
from app.models.event import Event
from app.services.message_queue import put_message

subscribers = []

def subscribe(callback_func):
    """Adds a function to the list of subscribers."""
    subscribers.append(callback_func)

def publish(workflow_id, event_type, payload=None):
    """
    Creates an event, saves it to DB, and notifies all subscribers.
    """
    print(f"EVENT PUBLISHED: {event_type} for workflow {workflow_id}")
    # 1. Persist the event
    new_event = Event(workflow_id=workflow_id, event_type=event_type, payload=payload or {}, status='PENDING')
    db.session.add(new_event)
    db.session.commit()

    # 2. Notify subscribers
    try:
        for callback in subscribers:
            callback(workflow_id, event_type, payload)
        new_event.status = 'PROCESSED'
    except Exception as e:
        print(f"ERROR PROCESSING EVENT: {e}")
        new_event.status = 'FAILED'
    db.session.commit()
    
    # Notify frontend via SSE
    put_message({
        'event': 'NEW_EVENT',
        'workflow_id': workflow_id,
        'type': event_type,
        'payload': payload,
        'timestamp': new_event.timestamp.isoformat()
    })