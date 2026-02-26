import os
import jwt
import datetime
import ollama
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from bson import ObjectId

# 1. Initialization & Config
load_dotenv()
app = Flask(__name__)

# UPDATED CORS: Explicitly allow the frontend origin and common headers
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:5173"],
    "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'prepai_local_dev_key_2026')

# 2. Local MongoDB Connection
try:
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    client = MongoClient(mongo_uri)
    db = client['prepai'] 
    users_collection = db['users']
    client.admin.command('ping')
    print("✅ Connected to Local MongoDB (Database: prepai)")
except Exception as e:
    print(f"❌ Local MongoDB Connection Error: {e}")

# --- AUTH DECORATOR ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({"email": data['email']})
            if not current_user:
                return jsonify({'error': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'error': 'Token is invalid or expired!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# --- AUTH ROUTES ---

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email') or data.get('username')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 409

    hashed_pw = generate_password_hash(password)
    
    new_user = {
        "email": email,
        "password": hashed_pw,
        "name": email.split('@')[0].capitalize(),
        "role": "candidate",
        "createdAt": datetime.datetime.utcnow()
    }
    users_collection.insert_one(new_user)
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email') or data.get('username')
    password = data.get('password')

    user = users_collection.find_one({"email": email})

    if user and check_password_hash(user['password'], password):
        token = jwt.encode({
            'email': user['email'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'])

        return jsonify({
            "token": token,
            "user": {
                "id": str(user['_id']),
                "name": user.get('name', email.split('@')[0]),
                "email": user['email']
            }
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

# --- AI CORE (OLLAMA) ---

@app.route('/api/interview/generate-from-resume', methods=['POST'])
@token_required
def generate_from_resume(current_user):
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file found"}), 400
    
    file = request.files['resume']
    try:
        reader = PdfReader(file)
        resume_text = ""
        for page in reader.pages:
            resume_text += page.extract_text()

        response = ollama.chat(model='llama3', messages=[
            {
                'role': 'system', 
                'content': 'You are a Senior Technical Interviewer. Generate 5 interview questions based on the resume. Return ONLY the questions, one per line.'
            },
            {
                'role': 'user', 
                'content': f"Candidate Resume: {resume_text[:2500]}"
            }
        ])

        questions = [q.strip() for q in response['message']['content'].split('\n') if q.strip()]
        return jsonify({"questions": questions[:5]}), 200
    except Exception as e:
        return jsonify({"error": "Local AI failed to process resume"}), 500

@app.route('/api/dashboard/<user_id>', methods=['GET'])
@token_required
def get_dashboard(current_user, user_id):
    return jsonify({
        "stats": {"total_interviews": 3, "average_score": 84},
        "recent_activity": [
            {"role": "Frontend Intern", "date": "2026-02-26", "score": 92}
        ]
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)