from flask import Blueprint, request, jsonify
from utils.auth_helpers import token_required
from datetime import datetime

coding_bp = Blueprint("coding", __name__)

# Static Challenge Library (ML & Algorithms)
CHALLENGES = [
    {
        "id": "ml_1",
        "title": "Linear Regression from Scratch",
        "difficulty": "Medium",
        "description": "Implement a simple Linear Regression model using only NumPy. You must implement the fit() method using Gradient Descent and the predict() method.",
        "constraints": ["Time complexity: O(epochs * n_samples)", "Memory: < 256MB"],
        "starter_code": "import numpy as np\n\nclass LinearRegression:\n    def __init__(self, lr=0.01, epochs=1000):\n        self.lr = lr\n        self.epochs = epochs\n        self.weights = None\n        self.bias = None\n\n    def fit(self, X, y):\n        # TODO: Implement Gradient Descent\n        pass\n\n    def predict(self, X):\n        # TODO: Implement Prediction\n        pass",
        "sample_input": "X = [[1], [2], [3]], y = [2, 4, 6]",
        "sample_output": "Predictions: [2, 4, 6]"
    },
    {
        "id": "ds_1",
        "title": "K-Nearest Neighbors Logic",
        "difficulty": "Easy",
        "description": "Calculate the Euclidean distance between a query point and a list of dataset points, returning the indices of the K nearest neighbors.",
        "constraints": ["Use standard math libraries", "K will always be < len(points)"],
        "starter_code": "import math\n\ndef get_knn(query, points, k):\n    # Write your logic here\n    return []",
        "sample_input": "query=[0,0], points=[[1,1],[0.1,0.1],[2,2]], k=1",
        "sample_output": "[1]"
    }
]

@coding_bp.route("/challenges", methods=["GET"])
@token_required
def get_challenges(current_user):
    # Returns the list for the Dojo selection screen
    return jsonify(CHALLENGES), 200

@coding_bp.route("/challenge/<challenge_id>", methods=["GET"])
@token_required
def get_single_challenge(current_user, challenge_id):
    challenge = next((c for c in CHALLENGES if c["id"] == challenge_id), None)
    if not challenge:
        return jsonify({"error": "Challenge not found"}), 404
    return jsonify(challenge), 200