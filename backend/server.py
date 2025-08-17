from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
from pydantic import BaseModel
from pymongo import MongoClient
import os
from datetime import datetime
import uuid
import json
from pathlib import Path
import shutil

# MongoDB setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URL)
db = client.dating_app

# FastAPI app setup
app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Pydantic models
class UserRegistration(BaseModel):
    telegram_id: str
    name: str
    age: int
    gender: str
    orientation: str
    interested_in: List[str]
    relationship_type: List[str]
    selectedSpokies: List[int]
    bio: Optional[str] = ""

class UserProfile(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    age: Optional[int] = None
    relationship_type: Optional[List[str]] = None
    selectedSpokies: Optional[List[int]] = None

class LikeRequest(BaseModel):
    target_user_id: str
    action: str  # "like", "dislike", "super_like"

class ChatMessage(BaseModel):
    chat_id: str
    message: str

# API Endpoints

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/api/auth/register")
async def register_user(
    telegram_id: str = Form(...),
    name: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    orientation: str = Form(...),
    interested_in: str = Form(...),  # JSON string
    relationship_type: str = Form(...),  # JSON string
    selectedSpokies: str = Form(...),  # JSON string
    bio: str = Form(""),
    photos: List[UploadFile] = File(default=[])
):
    try:
        print(f"🖼️ Received files: {len(photos) if photos else 0}")
        
        # Check if user already exists
        existing_user = db.users.find_one({"telegram_id": telegram_id})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Process photos
        profile_photos = []
        if photos and len(photos) > 0:
            for photo in photos:
                if photo.filename and photo.filename != "":
                    # Generate unique filename
                    file_extension = photo.filename.split(".")[-1]
                    filename = f"{uuid.uuid4()}.{file_extension}"
                    file_path = uploads_dir / filename
                    
                    # Save file
                    with open(file_path, "wb") as buffer:
                        shutil.copyfileobj(photo.file, buffer)
                    
                    photo_url = f"/uploads/{filename}"
                    profile_photos.append(photo_url)
                    print(f"✅ Photo saved: {photo_url}")
        
        # Parse JSON fields
        try:
            interested_in_parsed = json.loads(interested_in)
            relationship_type_parsed = json.loads(relationship_type)
            selectedSpokies_parsed = json.loads(selectedSpokies)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")
        
        # Default tokens
        default_tokens = 10
        
        # Create user document
        user_data = {
            "user_id": str(uuid.uuid4()),
            "telegram_id": telegram_id,
            "name": name,
            "age": age,
            "gender": gender,
            "orientation": orientation,
            "interested_in": interested_in_parsed,
            "relationship_type": relationship_type_parsed,
            "selected_spokies": selectedSpokies_parsed,
            "profile_photos": profile_photos,
            "bio": bio,
            "tokens": default_tokens,
            "location": {"lat": None, "lng": None},
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "is_active": True
        }
        
        # Insert user into database
        result = db.users.insert_one(user_data)
        
        if result.inserted_id:
            print("✅ User successfully registered!")
            return {"message": "User registered successfully!", "telegram_id": telegram_id}
        else:
            raise HTTPException(status_code=500, detail="Failed to register user")
            
    except HTTPException:
        raise
    except Exception as error:
        print(f"❌ Registration error: {error}")
        raise HTTPException(status_code=500, detail="Failed to register user")

@app.get("/api/profile/{telegram_id}")
async def get_user_profile(telegram_id: str):
    try:
        user = db.users.find_one({"telegram_id": telegram_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Convert ObjectId to string for JSON serialization
        user["_id"] = str(user["_id"])
        return user
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"❌ Get profile error: {error}")
        raise HTTPException(status_code=500, detail="Failed to get user profile")

@app.put("/api/profile/{telegram_id}")
async def update_user_profile(telegram_id: str, profile_data: UserProfile):
    try:
        # Find user
        user = db.users.find_one({"telegram_id": telegram_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prepare update data
        update_data = {}
        if profile_data.name is not None:
            update_data["name"] = profile_data.name
        if profile_data.bio is not None:
            update_data["bio"] = profile_data.bio
        if profile_data.age is not None:
            update_data["age"] = profile_data.age
        if profile_data.relationship_type is not None:
            update_data["relationship_type"] = profile_data.relationship_type
        if profile_data.selectedSpokies is not None:
            update_data["selected_spokies"] = profile_data.selectedSpokies
        
        update_data["updated_at"] = datetime.now()
        
        # Update user
        result = db.users.update_one(
            {"telegram_id": telegram_id},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return {"message": "Profile updated successfully"}
        else:
            return {"message": "No changes made"}
            
    except HTTPException:
        raise
    except Exception as error:
        print(f"❌ Update profile error: {error}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@app.get("/api/search/users")
async def search_users(telegram_id: str, skip: int = 0, limit: int = 10):
    try:
        # Get current user to filter based on preferences
        current_user = db.users.find_one({"telegram_id": telegram_id})
        if not current_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get users that current user has already interacted with
        user_interactions = db.interactions.find({"user_id": current_user["user_id"]})
        interacted_user_ids = [interaction["target_user_id"] for interaction in user_interactions]
        
        # Build search query
        search_query = {
            "telegram_id": {"$ne": telegram_id},  # Not current user
            "user_id": {"$nin": interacted_user_ids},  # Not already interacted
            "is_active": True
        }
        
        # Filter by interests if specified
        if current_user.get("interested_in"):
            search_query["gender"] = {"$in": current_user["interested_in"]}
        
        # Get users
        users = list(db.users.find(
            search_query,
            {
                "user_id": 1,
                "name": 1,
                "age": 1,
                "profile_photos": 1,
                "bio": 1,
                "selected_spokies": 1,
                "location": 1
            }
        ).skip(skip).limit(limit))
        
        # Convert ObjectId to string
        for user in users:
            user["_id"] = str(user["_id"])
        
        return {"users": users}
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"❌ Search users error: {error}")
        raise HTTPException(status_code=500, detail="Failed to search users")

@app.post("/api/like")
async def handle_like(like_request: LikeRequest, telegram_id: str):
    try:
        # Get current user
        current_user = db.users.find_one({"telegram_id": telegram_id})
        if not current_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Record interaction
        interaction_data = {
            "interaction_id": str(uuid.uuid4()),
            "user_id": current_user["user_id"],
            "target_user_id": like_request.target_user_id,
            "action": like_request.action,
            "timestamp": datetime.now()
        }
        
        db.interactions.insert_one(interaction_data)
        
        # Check if it's a match (both users liked each other)
        is_match = False
        if like_request.action in ["like", "super_like"]:
            # Check if target user also liked current user
            reverse_like = db.interactions.find_one({
                "user_id": like_request.target_user_id,
                "target_user_id": current_user["user_id"],
                "action": {"$in": ["like", "super_like"]}
            })
            
            if reverse_like:
                is_match = True
                # Create chat room for match
                chat_data = {
                    "chat_id": str(uuid.uuid4()),
                    "participants": [current_user["user_id"], like_request.target_user_id],
                    "created_at": datetime.now(),
                    "last_message": None,
                    "last_message_time": datetime.now()
                }
                db.chats.insert_one(chat_data)
        
        return {
            "success": True,
            "is_match": is_match,
            "action": like_request.action
        }
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"❌ Like error: {error}")
        raise HTTPException(status_code=500, detail="Failed to process like")

@app.get("/api/likes/received/{telegram_id}")
async def get_received_likes(telegram_id: str):
    try:
        # Get current user
        current_user = db.users.find_one({"telegram_id": telegram_id})
        if not current_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get users who liked current user
        likes = list(db.interactions.find({
            "target_user_id": current_user["user_id"],
            "action": {"$in": ["like", "super_like"]}
        }))
        
        # Get user details for those who liked
        liker_ids = [like["user_id"] for like in likes]
        likers = list(db.users.find(
            {"user_id": {"$in": liker_ids}},
            {
                "user_id": 1,
                "name": 1,
                "age": 1,
                "profile_photos": 1,
                "bio": 1,
                "location": 1
            }
        ))
        
        # Convert ObjectId to string
        for liker in likers:
            liker["_id"] = str(liker["_id"])
        
        return {"likes": likers}
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"❌ Get received likes error: {error}")
        raise HTTPException(status_code=500, detail="Failed to get received likes")

@app.get("/api/chats/{telegram_id}")
async def get_user_chats(telegram_id: str):
    try:
        # Get current user
        current_user = db.users.find_one({"telegram_id": telegram_id})
        if not current_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's chats
        chats = list(db.chats.find({
            "participants": current_user["user_id"]
        }).sort("last_message_time", -1))
        
        # Get participant details for each chat
        for chat in chats:
            other_participant_id = next(p for p in chat["participants"] if p != current_user["user_id"])
            participant = db.users.find_one(
                {"user_id": other_participant_id},
                {"name": 1, "profile_photos": 1}
            )
            if participant:
                chat["participant_name"] = participant["name"]
                chat["participant_photo"] = participant["profile_photos"][0] if participant["profile_photos"] else None
            
            chat["_id"] = str(chat["_id"])
        
        return {"chats": chats}
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"❌ Get chats error: {error}")
        raise HTTPException(status_code=500, detail="Failed to get chats")

@app.get("/api/chats/{chat_id}/messages")
async def get_chat_messages(chat_id: str, skip: int = 0, limit: int = 50):
    try:
        # Get messages for chat
        messages = list(db.messages.find({
            "chat_id": chat_id
        }).sort("timestamp", 1).skip(skip).limit(limit))
        
        # Convert ObjectId to string
        for message in messages:
            message["_id"] = str(message["_id"])
        
        return {"messages": messages}
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"❌ Get chat messages error: {error}")
        raise HTTPException(status_code=500, detail="Failed to get chat messages")

@app.post("/api/chats/{chat_id}/messages")
async def send_message(chat_id: str, message_data: ChatMessage, telegram_id: str):
    try:
        # Get current user
        current_user = db.users.find_one({"telegram_id": telegram_id})
        if not current_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify user is participant in chat
        chat = db.chats.find_one({"chat_id": chat_id})
        if not chat or current_user["user_id"] not in chat["participants"]:
            raise HTTPException(status_code=403, detail="Not authorized to send messages in this chat")
        
        # Create message
        message = {
            "message_id": str(uuid.uuid4()),
            "chat_id": chat_id,
            "sender_id": current_user["user_id"],
            "message": message_data.message,
            "timestamp": datetime.now(),
            "is_read": False
        }
        
        db.messages.insert_one(message)
        
        # Update chat's last message
        db.chats.update_one(
            {"chat_id": chat_id},
            {
                "$set": {
                    "last_message": message_data.message,
                    "last_message_time": datetime.now()
                }
            }
        )
        
        return {"message": "Message sent successfully", "message_id": message["message_id"]}
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"❌ Send message error: {error}")
        raise HTTPException(status_code=500, detail="Failed to send message")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
