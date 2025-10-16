document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('workflow-editor');
    let activeNode = null;
    let offsetX = 0;
    let offsetY = 0;

    editor.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('workflow-node')) {
            activeNode = e.target;
            offsetX = e.clientX - activeNode.getBoundingClientRect().left;
            offsetY = e.clientY - activeNode.getBoundingClientRect().top;
        }
    });

    editor.addEventListener('mousemove', (e) => {
        if (activeNode) {
            e.preventDefault();
            const editorRect = editor.getBoundingClientRect();
            let x = e.clientX - editorRect.left - offsetX;
            let y = e.clientY - editorRect.top - offsetY;

            // Constrain within editor boundaries
            x = Math.max(0, Math.min(x, editorRect.width - activeNode.offsetWidth));
            y = Math.max(0, Math.min(y, editorRect.height - activeNode.offsetHeight));

            activeNode.style.left = `${x}px`;
            activeNode.style.top = `${y}px`;
        }
    });

    editor.addEventListener('mouseup', () => {
        activeNode = null;
    });

    editor.addEventListener('mouseleave', () => {
        activeNode = null;
    });
});