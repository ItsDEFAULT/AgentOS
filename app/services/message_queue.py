import queue

# A simple in-memory message queue for SSE
# In a production app, you'd use Redis or RabbitMQ
sse_queue = queue.Queue()

def put_message(data):
    """Puts a message into the SSE queue."""
    sse_queue.put(data)

def get_message():
    """Retrieves a message from the SSE queue."""
    return sse_queue.get()