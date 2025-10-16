# AgentOS: An Event-Driven Orchestration Platform for Agentic Workflows

AgentOS is a scalable, resilient, and extensible orchestration platform designed to bridge the gap between deterministic workflows and non-deterministic agentic systems. It provides a robust framework for building, executing, and observing complex, event-driven workflows that can seamlessly integrate human-in-the-loop checkpoints.

## Core Concepts & Parallels with Operating Systems

AgentOS is architected around concepts that parallel modern operating systems, providing a familiar mental model for developers:

*   **The Event Bus as the Kernel:** The event bus is the core of AgentOS, analogous to an OS kernel. It manages the flow of information and triggers all actions within the system. Every step, every state change, and every interaction is an event, ensuring a decoupled and highly observable architecture.
*   **Workflows as Processes:** Each workflow is a long-running process with its own state and execution history. The platform can run multiple workflows concurrently, each isolated from the others.
*   **Nodes as System Calls:** Nodes are the fundamental units of work in a workflow, similar to system calls in an OS. They provide access to the underlying capabilities of the system, such as running an agent, requesting human approval, or making a choice.
*   **State Management as Memory:** AgentOS provides a persistent, replayable state management system, akin to an OS's memory management. Every event is logged, allowing for a complete reconstruction of a workflow's state at any point in time. This enables powerful debugging, auditing, and rollback capabilities.

## Key Features

*   **Event-Driven Architecture:** The entire platform is built around an event bus, ensuring a scalable and decoupled architecture. All operations are asynchronous and event-driven, enabling high-throughput and resilient execution.
*   **Stateful & Persistent Workflows:** Workflows are persistent and stateful, allowing for long-running and resilient processes. The event log serves as the single source of truth, enabling powerful features like replay and rollback.
*   **Human-in-the-Loop:** The `human_approval` node allows for seamless integration of human feedback and approval into any workflow, with support for dynamic UI generation via a flexible schema.
*   **Extensible Node System:** A dynamic node registry allows developers to easily add new capabilities to the platform without modifying the core engine.
*   **Workflow Forking & Replay:** Workflows can be forked and replayed from any point in time, enabling powerful debugging and "what-if" scenarios.
*   **Intuitive Frontend:** A modern, React-based frontend with a tab-based navigation system, a real-time dashboard, and a YAML-based workflow editor provides a user-friendly experience for building and monitoring workflows.

## Architecture

The following diagram illustrates the event-driven flow of AgentOS:

![AgentOS Sequence Diagram](demo/sequence-diagram.png)

And this diagram shows how the fork-and-replay system works in AgentOS:

![AgentOS Sequence Diagram](demo/sequence-diagram-replay.png)

## Future Scope

The architectural foundation of AgentOS opens up a wide range of possibilities for future development:

*   **Advanced Workflow Constructs:** The platform can be extended to support more complex workflow patterns, such as parallel execution, error handling, and sub-workflows.
*   **Richer Node Library:** The extensible node system makes it easy to add new integrations with external services, such as databases, APIs, and messaging platforms.
*   **Enhanced Visual Editor:** The current YAML editor can be evolved into a full-fledged, drag-and-drop visual editor, providing an even more intuitive workflow building experience.
*   **Pluggable Communication Channels:** The `channel` property on the `human_approval` node can be expanded to support a wide range of communication channels, such as email, Slack, and custom webhooks.
*   **Improved Observability:** The event-driven architecture provides a wealth of data that can be used to build rich observability tools, such as real-time dashboards, performance metrics, and distributed tracing.

## Getting Started

1.  **Install Dependencies:**
    ```
    pip install -r requirements.txt
    ```
2.  **Set Up the Database and Gemini API key:**
    *   **Note:** This project requires PostgreSQL to be installed and running.
    *   Create a `.env` file with your `DATABASE_URL` and `GOOGLE_API_KEY`. For example:
        ```
        DATABASE_URL="postgresql://user:password@localhost/agentos_db"
        GOOGLE_API_KEY="YOUR_API_KEY"
        ```
    *   Run `python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"` to initialize the database.
3.  **Run the Application:**
    ```
    python run.py
    ```
4.  **Open your browser** and navigate to `http://127.0.0.1:5000`.