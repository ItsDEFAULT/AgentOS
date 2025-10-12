document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('runWorkflowBtn');
    const workflowIdEl = document.getElementById('workflowId');
    const approvalsList = document.getElementById('approvalsList');
    const eventsList = document.getElementById('eventsList');

    let currentWorkflowId = null;

    runBtn.addEventListener('click', async () => {
        const response = await fetch('/workflows/run', { method: 'POST' });
        const data = await response.json();
        currentWorkflowId = data.workflow_id;
        workflowIdEl.textContent = currentWorkflowId;
        approvalsList.innerHTML = '';
        eventsList.innerHTML = '';
    });

    // Poll for pending approvals
    setInterval(async () => {
        const response = await fetch('/approvals/pending');
        const approvals = await response.json();
        approvalsList.innerHTML = '';
        approvals.forEach(app => {
            const div = document.createElement('div');
            div.className = 'approval';
            div.innerHTML = `
                <p><strong>ID:</strong> ${app.id}</p>
                <p>${app.prompt}</p>
                <button onclick="submitApproval('${app.id}', 'APPROVED')">Approve</button>
            `;
            approvalsList.appendChild(div);
        });
    }, 3000);

    // Poll for events for the current workflow
    setInterval(async () => {
        if (!currentWorkflowId) return;
        const response = await fetch(`/workflows/${currentWorkflowId}/events`);
        const events = await response.json();
        eventsList.innerHTML = '';
        events.forEach(evt => {
            const div = document.createElement('div');
            div.className = 'event';
            div.innerHTML = `<strong>${evt.type}</strong><pre>${JSON.stringify(evt.payload, null, 2)}</pre>`;
            eventsList.appendChild(div);
        });
    }, 2000);
});

async function submitApproval(approvalId, decision) {
    await fetch(`/approvals/${approvalId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision })
    });
    // Manually refresh approvals list after submission
    // In a real app, you'd have better state management
}