import os
import json
import tempfile
from flask import Blueprint, request, jsonify
from utils.resume_parser import extract_text_from_file
from utils.ai_client import client, MODEL_NAME 

resume_bp = Blueprint('resume', __name__)

@resume_bp.route('/score', methods=['POST'])
def score_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume uploaded"}), 400

    file = request.files['resume']
    job_desc = request.form.get('job_description', 'General')
    
    # Use tempfile to avoid permission errors
    fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    
    try:
        with os.fdopen(fd, 'wb') as tmp:
            file.save(tmp)
        
        # 1. Extract Text
        resume_text = extract_text_from_file(temp_path)
        
        # 2. Score with Mistral
        prompt = f"""
        Act as an ATS. Resume Text: "{resume_text[:2000]}". Job: "{job_desc}".
        Return JSON: {{ "score": 85, "improvement_tips": ["Tip 1"], "summary": "Short summary" }}
        """
        
        chat_response = client.chat.complete(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )

        content = chat_response.choices[0].message.content.replace('```json', '').replace('```', '')
        response_data = json.loads(content)
        
        # --- CRITICAL: Return the raw text so frontend can use it for Interview ---
        response_data['extracted_text'] = resume_text 
        
        return jsonify(response_data)

    except Exception as e:
        print(f"Resume Score Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)