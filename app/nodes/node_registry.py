from app.nodes.agent_node import AgentNode
from app.nodes.human_node import HumanApprovalNode
from app.nodes.choice_node import ChoiceNode

NODE_REGISTRY = {
    'agent': AgentNode,
    'human_approval': HumanApprovalNode,
    'choice': ChoiceNode,
}

def register_node(node_type, node_class):
    """Dynamically registers a new node type."""
    if node_type in NODE_REGISTRY:
        raise ValueError(f"Node type '{node_type}' is already registered.")
    NODE_REGISTRY[node_type] = node_class

def get_node(node_type):
    """Retrieves a node class from the registry."""
    node_class = NODE_REGISTRY.get(node_type)
    if not node_class:
        raise ValueError(f"Node type '{node_type}' is not registered.")
    return node_class