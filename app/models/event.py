from app import db

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workflow_id = db.Column(db.String(36), db.ForeignKey('workflow.id'), nullable=False)
    event_type = db.Column(db.String(100), nullable=False)
    payload = db.Column(db.JSON)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())