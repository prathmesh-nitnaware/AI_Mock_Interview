import jwt
import os
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "prepai_local_dev_key_2026")

# Mongo connection
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client["prepai"]
users_collection = db["users"]


def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        if request.method == "OPTIONS":
            return jsonify({"status": "ok"}), 200

        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:

            token = token.split(" ")[1] if " " in token else token

            data = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=["HS256"]
            )

            user = users_collection.find_one({
                "email": data["email"]
            })

            if not user:
                return jsonify({"error": "User not found"}), 401

        except Exception as e:

            return jsonify({
                "error": "Invalid token",
                "details": str(e)
            }), 401

        return f(user, *args, **kwargs)

    return decorated