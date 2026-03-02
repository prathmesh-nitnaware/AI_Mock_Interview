from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
import jwt
from datetime import datetime, timedelta, timezone

from config import Config
from models.user_model import create_user, get_user_by_email

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():

    data = request.json

    email = data["email"]
    password = data["password"]
    name = data.get("name", email.split("@")[0])

    if get_user_by_email(email):
        return jsonify({"error": "User exists"}), 409

    create_user(name, email, password)

    return jsonify({"message": "User created"})


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data["email"]
    password = data["password"]

    user = get_user_by_email(email)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid password"}), 401

    token = jwt.encode({
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }, Config.SECRET_KEY)

    return jsonify({
        "token": token,
        "user": {
            "email": email,
            "name": user["name"]
        }
    })