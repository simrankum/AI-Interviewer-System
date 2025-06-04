from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import socketio
import os
import time
from dotenv import load_dotenv
from utils.question_generator import QuestionGenerator
from utils.resume_parser import ResumeParser

# Load environment variables
load_dotenv()

api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    print("WARNING: ANTHROPIC_API_KEY not found!")
else:
    print("API key loaded successfully.")

# FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Socket.IO setup
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
sio_app = socketio.ASGIApp(sio, app)

# Utils
question_generator = QuestionGenerator(api_key)
resume_parser = ResumeParser()

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("sample.html", {"request": request})

@app.post("/generate")
async def generate_questions(request: Request):
    try:
        data = await request.json()
        job_role = data.get('job_role', '')
        industry = data.get('industry', '')
        experience_level = data.get('experience_level', '')
        candidate_background = data.get('candidate_background', '')
        question_count = int(data.get('question_count', 10))

        if not all([job_role, industry, experience_level]):
            return JSONResponse(content=[{"question": "Missing required fields."}], status_code=400)

        questions = question_generator.generate_questions(
            job_role, industry, experience_level, candidate_background, question_count
        )

        return questions or [{
            "question": "No questions generated.",
            "type": "General",
            "evaluates": "N/A",
            "strong_answer_example": "N/A",
            "follow_ups": ["N/A"]
        }]
    except Exception as e:
        return JSONResponse(content=[{
            "question": f"An error occurred: {str(e)}",
            "type": "Error"
        }], status_code=500)

@app.post("/parse_resume")
async def parse_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        parsed_text = resume_parser.extract_text_from_bytes(content)
        keywords = resume_parser.extract_keywords(parsed_text)
        return {"text": parsed_text, "keywords": keywords}
    except Exception as e:
        return {"error": str(e)}

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def join(sid, data):
    room = data['room']
    username = data.get('username', 'Anonymous')
    await sio.enter_room(sid, room)
    await sio.emit('user_joined', {'username': username}, room=room)

@sio.event
async def leave(sid, data):
    room = data['room']
    username = data.get('username', 'Anonymous')
    await sio.leave_room(sid, room)
    await sio.emit('user_left', {'username': username}, room=room)

@sio.event
async def signal(sid, data):
    room = data['room']
    await sio.emit('signal', data, room=room, skip_sid=sid)

@sio.event
async def message(sid, data):
    room = data['room']
    await sio.emit('message', data, room=room, skip_sid=sid)

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")