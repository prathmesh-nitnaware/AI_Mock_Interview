from flask import Blueprint, jsonify
from utils.auth_helpers import token_required

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/", methods=["GET", "OPTIONS"])
@token_required
def dashboard(current_user):

    return jsonify({

        "user": current_user["name"],

        "stats": {
            "interviews": 0,
            "avg_score": 0
        }

    })