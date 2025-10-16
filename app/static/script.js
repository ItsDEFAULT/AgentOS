document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('runWorkflowBtn');
    const workflowIdEl = document.getElementById('workflowId');
    const approvalsList = document.getElementById('approvalsList');
    const eventsList = document.getElementById('eventsList');

    let currentWorkflowId = null;

    runBtn.addEventListener('click', async () => {
        const workflowName = prompt("Enter the workflow name (e.g., test_workflow.yaml):", "test_workflow.yaml");
        if (!workflowName) return; // User cancelled the prompt
        // Generate a temporary client-side ID to track the workflow
        const tempId = `temp-${Date.now()}`;
        currentWorkflowId = tempId;
        workflowIdEl.textContent = `Running... (${workflowName})`;

        const response = await fetch(`/workflows/run?workflow_name=${workflowName}`, { method: 'POST' });
        const data = await response.json();
        
        // Replace the temporary ID with the actual ID from the server
        if (currentWorkflowId === tempId) {
            currentWorkflowId = data.workflow_id;
            workflowIdEl.textContent = currentWorkflowId;
        }
        approvalsList.innerHTML = '';
        eventsList.innerHTML = '';
    });

    // Listen for Server-Sent Events
    const evtSource = new EventSource("/stream");
    evtSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log("SSE Received:", data);

        if (data.event === 'NEW_EVENT' && data.workflow_id === currentWorkflowId) {
            const div = document.createElement('div');
            div.className = 'event';
            div.innerHTML = `<strong>${data.type}</strong><pre>${JSON.stringify(data.payload, null, 2)}</pre>`;
            eventsList.appendChild(div);
        }

        // Always refresh approvals, as they are not tied to a specific workflow ID in the SSE message
        fetchApprovals();
    };

    async function fetchApprovals() {
        const response = await fetch('/approvals/pending');
        const approvals = await response.json();
        approvalsList.innerHTML = '';
        approvals.forEach(app => {
            const div = document.createElement('div');
            div.className = 'approval';
            let uiHtml = `<p><strong>ID:</strong> ${app.id}</p><p>${app.prompt}</p>`;

            if (app.ui_schema) {
                uiHtml += `<form id="form-${app.id}">`;
                app.ui_schema.forEach(field => {
                    uiHtml += `<label for="${field.name}">${field.label}:</label><br>`;
                    if (field.type === 'textarea') {
                        uiHtml += `<textarea id="${field.name}-${app.id}" name="${field.name}"></textarea><br>`;
                    } else {
                        uiHtml += `<input type="${field.type}" id="${field.name}-${app.id}" name="${field.name}"><br>`;
                    }
                });
                uiHtml += `<button type="button" onclick="submitApproval('${app.id}', 'APPROVED')">Approve</button>`;
                uiHtml += `<button type="button" onclick="submitApproval('${app.id}', 'REJECTED')">Reject</button>`;
                uiHtml += `</form>`;
            } else {
                uiHtml += `<button onclick="submitApproval('${app.id}', 'APPROVED')">Approve</button>`;
                uiHtml += `<button onclick="submitApproval('${app.id}', 'REJECTED')">Reject</button>`;
            }
            div.innerHTML = uiHtml;
            approvalsList.appendChild(div);
        });
    }


    // Initial fetch
    fetchApprovals();
});

async function submitApproval(approvalId, decision) {
    let responseData = {};
    const form = document.getElementById(`form-${approvalId}`);
    if (form) {
        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            responseData[key] = value;
        }
    }

    await fetch(`/approvals/${approvalId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, response_data: responseData })
    });
    // Manually refresh approvals list after submission
    // In a real app, you'd have better state management
}