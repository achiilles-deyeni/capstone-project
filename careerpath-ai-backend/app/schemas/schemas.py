"""
Pydantic schemas for request/response validation.

These schemas define the structure of data sent to and from the API,
providing automatic validation and documentation.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============ User Schemas ============

class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, max_length=100)


class UserCreate(UserBase):
    """Schema for creating a new user"""
    clerk_id: str = Field(..., description="Clerk user ID from authentication")
    email: EmailStr


class UserUpdate(UserBase):
    """Schema for updating user information"""
    pass


class UserResponse(UserBase):
    """Schema for user responses"""
    id: int
    clerk_id: str
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode in v1)


# ============ Roadmap Schemas ============

class RoadmapBase(BaseModel):
    """Base roadmap schema"""
    title: str = Field(..., max_length=500)
    career_type: Optional[str] = Field(None, max_length=200)
    prompt: Optional[str] = None


class RoadmapCreate(RoadmapBase):
    """Schema for creating a new roadmap"""
    career_data: Dict[str, Any] = Field(..., description="AI-generated career path data")


class RoadmapUpdate(BaseModel):
    """Schema for updating a roadmap"""
    title: Optional[str] = Field(None, max_length=500)
    is_favorite: Optional[bool] = None


class RoadmapResponse(RoadmapBase):
    """Schema for roadmap responses"""
    id: int
    user_id: int
    career_data: Dict[str, Any]
    is_favorite: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapListResponse(BaseModel):
    """Schema for listing roadmaps"""
    id: int
    title: str
    career_type: Optional[str]
    is_favorite: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Chat Message Schemas ============

class ChatMessageBase(BaseModel):
    """Base chat message schema"""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1)


class ChatMessageCreate(ChatMessageBase):
    """Schema for creating a chat message"""
    cached: Optional[bool] = False
    generation_time_ms: Optional[int] = None


class ChatMessageResponse(ChatMessageBase):
    """Schema for chat message responses"""
    id: int
    user_id: int
    cached: bool
    generation_time_ms: Optional[int]
    timestamp: datetime

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    """Schema for returning chat history"""
    messages: List[ChatMessageResponse]
    total: int


# ============ Generic Response Schemas ============

class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response schema"""
    detail: str
    error_type: Optional[str] = None
