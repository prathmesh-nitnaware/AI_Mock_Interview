import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

client = MongoClient(mongo_uri)

db = client["prepai"]

users_collection = db["users"]

interviews_collection = db["interviews"]

print("MongoDB connected successfully")