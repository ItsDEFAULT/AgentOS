class BaseNode:
    def execute(self, workflow, step_definition, context):
        raise NotImplementedError