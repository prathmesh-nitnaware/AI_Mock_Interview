import os
import json
from flask import Blueprint, request, jsonify
from utils.resume_parser import extract_text_from_file
from utils.ai_client import client, MODEL_NAME

interview_bp = Blueprint('interview', __name__)

# --- 1. GET DSA QUESTION (Mock/Database) ---
@interview_bp.route('/dsa', methods=['GET'])
def get_dsa_question():
    difficulty = request.args.get('difficulty', 'easy').lower()
    # You can expand this list or connect to a DB later
    questions = {
        "easy": {"title": "Two Sum", "description": "Given an array of integers, return indices...", "input_format": "nums = [2,7,11,15]", "output_format": "[0,1]"},
        "medium": {"title": "Longest Substring", "description": "Find the length of the longest substring...", "input_format": "s = 'abcabcbb'", "output_format": "3"},
        "hard": {"title": "Median of Two Sorted Arrays", "description": "Find the median...", "input_format": "nums1 = [1,3], nums2 = [2]", "output_format": "2.0"}
    }
    return jsonify(questions.get(difficulty, questions['easy']))

# --- 2. CODE SUBMISSION REVIEW ---
@interview_bp.route('/submit', methods=['POST'])
def submit_code():
    data = request.json
    code = data.get('code')
    question_title = data.get('question_title')
    
    prompt = f"""
    Review this Python code for the problem '{question_title}'.
    Code:
    {code}
    
    Return JSON (no markdown):
    {{
        "correctness": "Yes/No/Partial",
        "time_complexity": "e.g. O(n)",
        "rating": "Score out of 10",
        "feedback": "Short feedback on bugs and quality."
    }}
    """
    try:
        chat_response = client.chat.complete(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = chat_response.choices[0].message.content.replace('```json', '').replace('```', '')
        return jsonify({"success": True, "review": json.loads(content)})
    except Exception as e:
        print(f"Review Error: {e}")
        return jsonify({"success": False, "review": {"feedback": "AI Error"}}), 500

# --- 3. INITIATE SESSION (The Missing Route) ---
@interview_bp.route('/initiate', methods=['POST'])
def initiate_session():
    data = request.json
    
    role = data.get('role', 'Software Engineer')
    experience = data.get('experience', '0-2 Years')
    focus = data.get('focus', 'Technical') 
    intensity = data.get('intensity', 3)
    resume_context = data.get('resume_context', '') # <--- Get the text passed from Frontend

    print(f"Starting session for {role}. Resume context length: {len(resume_context)}")

    # Prompt Engineering for Mistral
    prompt = f"""
    Act as a Technical Interviewer. Start a {focus} interview for a {role} with {experience} experience.
    The interview intensity is set to {intensity}/10.
    
    Candidate's Resume Context: 
    "{resume_context[:2500]}"
    
    Based on the resume context (if provided), generate the FIRST interview question. 
    It should specifically target a skill or project mentioned in the resume.
    
    Return ONLY valid JSON (no markdown):
    {{
        "title": "Question Title",
        "description": "The question text...",
        "input_format": "Input example (if coding)",
        "output_format": "Output example (if coding)"
    }}
    """
    
    try:
        chat_response = client.chat.complete(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        content = chat_response.choices[0].message.content.replace('```json', '').replace('```', '')
        return jsonify(json.loads(content))

    except Exception as e:
        print(f"Init Session Error: {e}")
        return jsonify({"error": "Failed to start session"}), 500