import os
import yaml

WORKFLOW_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'workflows')

def list_workflows():
    """List all YAML workflow files in the workflows directory."""
    return [f for f in os.listdir(WORKFLOW_DIR) if f.endswith('.yaml') or f.endswith('.yml')]

def load_workflow(name):
    """Load and parse a workflow YAML file by name."""
    path = os.path.join(WORKFLOW_DIR, name)
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Workflow '{name}' not found.")
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)
