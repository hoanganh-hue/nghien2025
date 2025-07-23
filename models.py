import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app import db
import uuid

class BusinessIndustry(enum.Enum):
    RESTAURANT = "restaurant"
    RETAIL = "retail"
    SERVICES = "services"
    ENTERTAINMENT = "entertainment"
    ONLINE = "online"
    CANTEEN = "canteen"
    PARKING = "parking"
    OTHER = "other"

class RegistrationStatus(enum.Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class EmailType(enum.Enum):
    BUSINESS = "business"
    PERSONAL = "personal"

class TransactionStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TransactionType(enum.Enum):
    PAYMENT = "payment"
    REFUND = "refund"
    WITHDRAWAL = "withdrawal"

class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    is_superuser = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)

class PartnerRegistration(db.Model):
    __tablename__ = 'partner_registrations'
    
    id = Column(Integer, primary_key=True)
    business_name = Column(String(255), nullable=False)
    business_type = Column(String(50), nullable=False)  # individual or enterprise
    industry = Column(Enum(BusinessIndustry), nullable=False)
    tax_code = Column(String(50))
    business_license = Column(String(255))
    business_address = Column(Text, nullable=False)
    business_phone = Column(String(20), nullable=False)
    business_email = Column(String(120), nullable=False)
    website = Column(String(255))
    
    # Representative information
    representative_name = Column(String(255), nullable=False)
    representative_phone = Column(String(20), nullable=False)
    representative_email = Column(String(120), nullable=False)
    representative_id_number = Column(String(50), nullable=False)
    representative_position = Column(String(100))
    
    # Bank information
    bank_name = Column(String(255), nullable=False)
    bank_account_number = Column(String(50), nullable=False)
    bank_account_name = Column(String(255), nullable=False)
    bank_branch = Column(String(255))
    
    # Status and metadata
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.PENDING)
    registered_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(Integer, ForeignKey('admin_users.id'))
    notes = Column(Text)
    
    # Relationships
    uploaded_files = relationship("UploadedFile", back_populates="registration")
    reviewer = relationship("AdminUser")

class UploadedFile(db.Model):
    __tablename__ = 'uploaded_files'
    
    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    registration_id = Column(Integer, ForeignKey('partner_registrations.id'))
    verification_id = Column(Integer, ForeignKey('account_verifications.id'))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    registration = relationship("PartnerRegistration", back_populates="uploaded_files")
    verification = relationship("AccountVerification", back_populates="uploaded_files")

class AccountVerification(db.Model):
    __tablename__ = 'account_verifications'
    
    id = Column(Integer, primary_key=True)
    partner_id = Column(Integer, ForeignKey('partner_registrations.id'))
    email_type = Column(Enum(EmailType), nullable=False)
    verification_type = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.PENDING)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(Integer, ForeignKey('admin_users.id'))
    notes = Column(Text)
    
    # Relationships
    partner = relationship("PartnerRegistration")
    uploaded_files = relationship("UploadedFile", back_populates="verification")
    reviewer = relationship("AdminUser")

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = Column(Integer, primary_key=True)
    transaction_id = Column(String(100), unique=True, nullable=False)
    partner_id = Column(Integer, ForeignKey('partner_registrations.id'))
    amount = Column(Integer, nullable=False)  # Amount in VND cents
    currency = Column(String(3), default='VND')
    transaction_type = Column(Enum(TransactionType), nullable=False)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    description = Column(Text)
    payment_method = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # Relationships
    partner = relationship("PartnerRegistration")

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('admin_users.id'))
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(Integer)
    details = Column(Text)
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("AdminUser")
