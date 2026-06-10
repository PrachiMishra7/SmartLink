from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class URLBase(BaseModel):
    original_url: HttpUrl
    custom_alias: Optional[str] = None
    password: Optional[str] = None
    expiry_date: Optional[datetime] = None

class URLCreate(URLBase):
    pass

class URLResponse(BaseModel):
    id: int
    original_url: HttpUrl
    short_code: str
    custom_alias: Optional[str] = None
    user_id: Optional[int] = None
    created_at: datetime
    expiry_date: Optional[datetime] = None
    qr_code_url: Optional[str] = None
    click_count: int

    class Config:
        from_attributes = True
