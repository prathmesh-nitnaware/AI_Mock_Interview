import os
from flask import Flask, jsonify
from flask_cors import CORS

# Import Blueprints
# Ensure 'backend/routes/interview.py' and 'backend/routes/resume_score.py' exist
from routes.resume_score import resume_bp
from routes.interview import interview_bp

app = Flask(__name__)

# --- CONFIGURATION ---
# Allow all origins (Simplest for dev)
CORS(app, resources={r"/*": {"origins": "*"}})

# File Upload Config
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit
UPLOAD_FOLDER = './temp_uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure temp folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- REGISTER BLUEPRINTS ---
app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(interview_bp, url_prefix='/api/interview')

# --- HEALTH CHECK ---
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "active",
        "message": "Prep.AI Backend is running",
        "routes": ["/api/resume/score", "/api/interview/initiate", "/api/interview/submit"]
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
    # Run on Port 5000
    app.run(debug=True, port=5000)