from app import db
import uuid

class Workflow(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), default='PENDING') # PENDING, RUNNING, PAUSED, COMPLETED
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class Approval(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = db.Column(db.String(36), db.ForeignKey('workflow.id'), nullable=False)
    status = db.Column(db.String(50), default='PENDING') # PENDING, APPROVED, REJECTED
    prompt = db.Column(db.Text, nullable=True)