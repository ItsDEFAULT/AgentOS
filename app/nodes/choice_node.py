from .base_node import BaseNode
from app.services import event_bus
import re

class ChoiceNode(BaseNode):
    def execute(self, workflow, step_definition, context):
        print(f"Executing ChoiceNode for step: {step_definition['id']}")
        
        input_text = context.get('output', '')
        choices = step_definition.get('choices', [])
        
        print(f"  Input text: '{input_text}'")
        
        next_step_id = step_definition.get('default_next_step') # Fallback step
        
        for choice in choices:
            print(f"  Checking condition: '{choice['condition']}'")
            # Simple keyword matching for the hackathon
            if re.search(choice['condition'], input_text, re.IGNORECASE):
                next_step_id = choice['next_step']
                print(f"  Condition met. Next step is: {next_step_id}")
                break
        
        print(f"  Final next step: {next_step_id}")
        
        if next_step_id:
            payload = {
                'source_step_id': step_definition['id'], 
                'output': input_text, # Pass through the input
                'next_step_override': next_step_id # Tell the engine where to go
            }
            event_bus.publish(workflow.id, 'NODE_COMPLETED', payload)
        else:
            # No path forward, fail the node
            event_bus.publish(workflow.id, 'NODE_FAILED', {'error': 'ChoiceNode found no matching condition.'})