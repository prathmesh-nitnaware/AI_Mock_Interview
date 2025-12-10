import os
from flask import Flask, jsonify
from flask_cors import CORS

# Import blueprints from the routes folder
# Ensure these files exist in your /routes directory
from routes.resume_score import resume_bp
from routes.interview import interview_bp

# Optional: Import Auth blueprint if you have created auth.py
# from routes.auth import auth_bp 

app = Flask(__name__)

# --- CONFIGURATION ---
# Allow React (localhost:5173 or 3000) to talk to this Backend
CORS(app, resources={r"/*": {"origins": "*"}})

# Security: Set a secret key for sessions (if used)
app.config['SECRET_KEY'] = 'your-secret-key-here'

# File Upload Config
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit uploads to 16MB
UPLOAD_FOLDER = './temp_uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists on startup
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- REGISTER BLUEPRINTS ---
# This connects your specific route files to the main app
app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(interview_bp, url_prefix='/api/interview')

# Optional: Register Auth if you have it
# app.register_blueprint(auth_bp, url_prefix='/api/auth')

# --- HEALTH CHECK ROUTE ---
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "active",
        "message": "Backend is running successfully",
        "services": ["resume-scorer", "interview-bot"]
    }), 200

# --- ERROR HANDLERS ---
@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "File too large (Max 16MB)"}), 413

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal Server Error"}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

# --- MAIN ENTRY POINT ---
if __name__ == '__main__':
    # Run on port 5000 by default
    app.run(debug=True, port=5000)