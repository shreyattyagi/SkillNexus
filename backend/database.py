from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['resume_analyzer']

# Collections
users = db.users
resumes = db.resumes
analyses = db.analyses

def serialize_object_id(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    return obj

def create_user(email: str, hashed_password: str):
    user = {
        "email": email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    return users.insert_one(user)

def get_user(email: str):
    return users.find_one({"email": email})

def save_resume_analysis(user_id: str, filename: str, analysis_data: dict):
    analysis = {
        "user_id": ObjectId(user_id),
        "filename": filename,
        "analysis_data": analysis_data,
        "created_at": datetime.utcnow()
    }
    return analyses.insert_one(analysis)

def get_user_analyses(user_id: str):
    user_analyses = analyses.find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
    return list(map(lambda x: {**x, "_id": str(x["_id"]), "user_id": str(x["user_id"])}, user_analyses)) 