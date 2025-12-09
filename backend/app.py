import json
import asyncio
import uuid
import random
from datetime import datetime
from typing import Optional, Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- 3. MOCK MONGODB DATABASE ---
class MockCollection:
    def __init__(self):
        self.data = {}

    def insert_one(self, document):
        doc_id = document.get("_id", str(uuid.uuid4()))
        document["_id"] = doc_id
        self.data[doc_id] = document
        return type('obj', (object,), {'inserted_id': doc_id})

    def find_one(self, query):
        # Very simple mock find (only checks ID)
        if "_id" in query:
            return self.data.get(query["_id"])
        return None
    
    def update_one(self, query, update):
        if "_id" in query and query["_id"] in self.data:
            # Handle $set operator
            if "$set" in update:
                self.data[query["_id"]].update(update["$set"])
            # Handle $push operator
            if "$push" in update:
                for key, val in update["$push"].items():
                    if key not in self.data[query["_id"]]:
                        self.data[query["_id"]][key] = []
                    self.data[query["_id"]][key].append(val)
            return True
        return False

# Initialize "DB"
db = {
    "sessions": MockCollection(),
    "users": MockCollection(),
    "resumes": MockCollection()
}

# --- APP SETUP ---
app = FastAPI(title="Prep AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class ResumeScoreRequest(BaseModel):
    resume_id: str
    job_role: str

class InterviewStartRequest(BaseModel):
    role: str
    experience: str
    interview_type: str
    question_count: int = 5
    resume_context: Optional[str] = None

# --- ENDPOINTS ---

@app.get("/")
async def root():
    return {"status": "ok", "db": "Mock MongoDB Active"}

@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    await asyncio.sleep(1) 
    resume_id = str(uuid.uuid4())
    raw_text = f"Resume Content: {file.filename}. Skills: React, Python."
    
    # Store in DB
    db["resumes"].insert_one({
        "_id": resume_id,
        "filename": file.filename,
        "text": raw_text,
        "upload_date": datetime.now()
    })
    
    return {"resume_id": resume_id, "raw_text": raw_text}

@app.post("/api/resume/score")
async def score_resume(req: ResumeScoreRequest):
    await asyncio.sleep(1.5)
    # Fetch from DB if needed: db["resumes"].find_one({"_id": req.resume_id})
    return {
        "score": 85,
        "strengths": ["Clear layout"],
        "weaknesses": ["More metrics needed"],
        "suggestions": ["Add leadership section"]
    }

@app.post("/api/interview/start")
async def start_interview(req: InterviewStartRequest):
    session_id = str(uuid.uuid4())
    
    # Contextual First Question
    if req.resume_context:
        first_q = f"Based on your resume, tell me about your experience with {req.role}."
    else:
        first_q = f"Welcome to the {req.role} interview. Tell me about yourself."

    # Insert into Mock DB
    db["sessions"].insert_one({
        "_id": session_id,
        "config": req.dict(),
        "questions": [first_q],
        "answers": [],
        "current_index": 0,
        "total_questions": req.question_count,
        "status": "active"
    })
    
    return {"session_id": session_id, "first_question": first_q}

@app.websocket("/api/interview/live/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    
    # DB Lookup
    session_data = db["sessions"].find_one({"_id": session_id})
    
    if not session_data:
        await websocket.close(code=4004)
        return

    # Send Initial Q
    await websocket.send_json({
        "type": "question",
        "content": session_data["questions"][-1]
    })
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "user_answer_finished":
                user_ans = message.get("content", "")
                
                # Update DB (Push answer)
                db["sessions"].update_one(
                    {"_id": session_id}, 
                    {"$push": {"answers": user_ans}}
                )

                # Send AI Status
                await websocket.send_json({"type": "status", "content": "Analyzing..."})
                await asyncio.sleep(1.5)
                
                # Send Score
                await websocket.send_json({
                    "type": "analysis",
                    "clarity": random.randint(80, 99),
                    "confidence": random.randint(70, 95)
                })
                
                await asyncio.sleep(1)

                # Logic for Next Question
                # Refetch to get updated state if needed, or maintain local state
                current_idx = session_data["current_index"] + 1
                total = session_data["total_questions"]
                
                # Update Index in DB
                db["sessions"].update_one(
                    {"_id": session_id}, 
                    {"$set": {"current_index": current_idx}}
                )
                session_data["current_index"] = current_idx # Local update

                if current_idx >= total:
                    await websocket.send_json({"type": "end", "message": "Done"})
                    break
                else:
                    next_q = f"Question {current_idx + 1}: Technical deep dive."
                    
                    # Update DB (Push question)
                    db["sessions"].update_one(
                        {"_id": session_id}, 
                        {"$push": {"questions": next_q}}
                    )
                    
                    await websocket.send_json({"type": "question", "content": next_q})

    except WebSocketDisconnect:
        print(f"WS Disconnected: {session_id}")

@app.get("/api/dashboard/{user_id}")
async def get_dashboard(user_id: str):
    return {
        "resume_scores": [70, 80, 90],
        "interview_scores": [60, 75, 88],
        "recent_activities": [
            {"type": "interview", "date": "2023-11-01", "score": 88}
        ]
    }