import os
import json
from flask import Blueprint, request, jsonify
from utils.ai_client import client, MODEL_NAME

# --- 1. INITIALIZE BLUEPRINT ---
interview_bp = Blueprint('interview', __name__)

# --- 2. DSA QUESTION BANK (Standard Mode Fallback) ---
@interview_bp.route('/dsa', methods=['GET'])
def get_dsa_question():
    difficulty = request.args.get('difficulty', 'easy').lower()
    questions = {
        "easy": {"title": "Two Sum", "description": "Given an array of integers, return indices...", "input_format": "nums = [2,7,11,15]", "output_format": "[0,1]"},
        "medium": {"title": "Longest Substring", "description": "Find the length of the longest substring...", "input_format": "s = 'abcabcbb'", "output_format": "3"},
        "hard": {"title": "Median of Two Sorted Arrays", "description": "Find the median...", "input_format": "nums1 = [1,3], nums2 = [2]", "output_format": "2.0"}
    }
    return jsonify(questions.get(difficulty, questions['easy']))

# --- 3. INITIATE SESSION (Generates Question 1 from Resume) ---
@interview_bp.route('/initiate', methods=['POST'])
def initiate_session():
    print("------------------------------------------------")
    print("🟢 INITIATE SESSION HIT")
    
    data = request.json
    role = data.get('role', 'Software Engineer')
    experience = data.get('experience', '0-2 Years')
    focus = data.get('focus', 'Technical') 
    intensity = data.get('intensity', 3)
    resume_context = data.get('resume_context', '')

    print(f"Role: {role} | Focus: {focus}")
    print(f"Resume Context Length: {len(resume_context)}")

    # Prompt Engineering
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
        print(f"❌ INIT ERROR: {e}")
        return jsonify({"error": "Failed to start session"}), 500

# --- 4. SUBMIT ANSWER (Updated for Behavioral Analysis) ---
@interview_bp.route('/submit', methods=['POST'])
def submit_code():
    print("------------------------------------------------")
    print("🟢 SUBMIT (VERBAL) HIT")
    
    data = request.json
    answer = data.get('code', '')
    question_title = data.get('question_title', 'Unknown Question')
    metrics = data.get('metrics', {}) # New Behavioral Data
    
    # Extract Metrics
    wpm = metrics.get('wpm', 0)
    fillers = metrics.get('filler_words', 0)
    duration = metrics.get('duration', 0)
    
    print(f"Metrics -> WPM: {wpm} | Fillers: {fillers} | Duration: {duration}s")

    # VERBAL ANALYSIS PROMPT
    prompt = f"""
    Act as a Behavioral & Technical Interviewer. 
    Question: '{question_title}'
    User Answer Transcript: "{answer}"
    
    Behavioral Data:
    - Speaking Pace: {wpm} words per minute (Ideal is 110-150)
    - Filler Words Used: {fillers} (e.g., um, uh, like)
    
    Evaluate:
    1. Clarity: Based on WPM and sentence structure.
    2. Confidence: Based on filler words and hesitation.
    3. Technical Accuracy: Based on the content.
    
    Return strictly valid JSON:
    {{
        "technical_accuracy": "High/Medium/Low",
        "clarity_score": 8,
        "confidence_score": 7,
        "feedback": "2 sentences. Comment on their tone/pace (e.g. 'You spoke a bit too fast') and technical correctness."
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
        print(f"❌ ERROR: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

# --- 5. NEXT QUESTION (Looping Logic) ---
@interview_bp.route('/next-question', methods=['POST'])
def get_next_question():
    print("------------------------------------------------")
    print("🟢 NEXT QUESTION HIT")
    data = request.json
    
    # We need context to generate a distinct next question
    role = data.get('role', 'Software Engineer')
    experience = data.get('experience', '0-2 Years')
    focus = data.get('focus', 'Technical')
    current_question_title = data.get('current_question', '')
    resume_context = data.get('resume_context', '')

    prompt = f"""
    Act as a Technical Interviewer. 
    Role: {role}
    Experience: {experience}
    Focus: {focus}
    
    The candidate just answered the question: "{current_question_title}".
    
    Generate the NEXT distinct interview question. 
    It should be different from the previous one but relevant to the candidate's profile.
    Resume Context: "{resume_context[:1000]}"
    
    Return ONLY valid JSON:
    {{
        "title": "Question Title",
        "description": "The question text...",
        "input_format": "N/A",
        "output_format": "N/A"
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
        print(f"Next Q Error: {e}")
        return jsonify({"error": "Failed to generate next question"}), 500