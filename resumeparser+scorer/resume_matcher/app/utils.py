from datetime import datetime
import uuid

def generate_unique_id():
    return f"resume-{int(datetime.now().timestamp())}-{uuid.uuid4().hex[:6]}"
