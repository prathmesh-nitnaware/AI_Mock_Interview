from flask import Flask
from flask_cors import CORS
from routes import register_routes

app = Flask(__name__)

# Enhanced CORS to prevent Preflight (OPTIONS) errors
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# Register all route blueprints
register_routes(app)

@app.route("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)