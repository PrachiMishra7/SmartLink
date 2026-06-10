from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    urls = relationship("URL", back_populates="owner", cascade="all, delete-orphan")

class URL(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    original_url = Column(Text, nullable=False)
    short_code = Column(String(50), unique=True, index=True, nullable=False)
    custom_alias = Column(String(100), unique=True, index=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nullable for anonymous shortens, if allowed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    password = Column(String(255), nullable=True)
    qr_code_url = Column(String(255), nullable=True)
    click_count = Column(Integer, default=0)

    owner = relationship("User", back_populates="urls")
    clicks = relationship("ClickLog", back_populates="url", cascade="all, delete-orphan")

class ClickLog(Base):
    __tablename__ = "click_logs"

    id = Column(Integer, primary_key=True, index=True)
    url_id = Column(Integer, ForeignKey("urls.id"), nullable=False)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    device = Column(String(50), nullable=True)
    browser = Column(String(50), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(50), nullable=True)
    referrer = Column(Text, nullable=True)

    url = relationship("URL", back_populates="clicks")

class ThreatLog(Base):
    __tablename__ = "threat_logs"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(Text, nullable=False)
    threat_status = Column(String(50), nullable=False)
    scan_result = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
