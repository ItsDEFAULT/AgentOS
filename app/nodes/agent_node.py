from .base_node import BaseNode
from app.services import event_bus
import google.generativeai as genai
import os

class AgentNode(BaseNode):
    def execute(self, workflow, step_definition, context):
        # 1. Configure the Gemini API client
        try:
            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        except Exception as e:
            print(f"Configuration Error: {e}")
            event_bus.publish(workflow.id, 'NODE_FAILED', {'error': 'Google API key not configured.'})
            return

        # Use output from previous step if available
        previous_output = context.get('output', '')
        prompt = f"{step_definition['prompt']}\n\nContext from previous step: {previous_output}"

        print(f"Executing AgentNode with prompt for Gemini: {prompt[:70]}...")

        try:
            # 2. Initialize the model and generate content
            model = genai.GenerativeModel('gemini-2.5-pro') # Specify the model
            response = model.generate_content(prompt)

            # 3. Extract the result and publish the event
            result = response.text
            payload = {'source_step_id': step_definition['id'], 'output': result}
            event_bus.publish(workflow.id, 'NODE_COMPLETED', payload)

        except Exception as e:
            print(f"Gemini API Error: {e}")
            event_bus.publish(workflow.id, 'NODE_FAILED', {'error': str(e)})