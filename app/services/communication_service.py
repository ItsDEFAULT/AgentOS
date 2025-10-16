def send_approval_request(approval, channel):
    """
    Simulates sending an approval request to an external channel.
    In a real application, this would integrate with services like Slack, Email, etc.
    """
    print(f"COMMUNICATION SERVICE: Sending approval request for workflow {approval.workflow_id} via {channel}.")
    print(f"  Approval ID: {approval.id}")
    print(f"  Prompt: {approval.prompt}")

    if channel == 'slack':
        # Placeholder for Slack integration
        print("  (Simulating Slack message)")
    elif channel == 'email':
        # Placeholder for Email integration
        print("  (Simulating Email message)")
    else:
        # Default to console logging
        print("  (Defaulting to console log)")