from app import db
from app.models.event import Event

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
    new_event = Event(workflow_id=workflow_id, event_type=event_type, payload=payload or {})
    db.session.add(new_event)
    db.session.commit()

    # 2. Notify subscribers
    for callback in subscribers:
        callback(workflow_id, event_type, payload)