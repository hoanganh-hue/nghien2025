"""
Authentication service for JWT token management
"""
import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from werkzeug.security import check_password_hash
from models import AdminUser
import logging

logger = logging.getLogger(__name__)

class AuthService:
    SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "zalopay-jwt-secret-2024")
    ALGORITHM = "HS256"
    TOKEN_EXPIRY_HOURS = 24
    
    @classmethod
    def generate_token(cls, user_id, username):
        """Generate JWT token for user"""
        try:
            payload = {
                'user_id': user_id,
                'username': username,
                'exp': datetime.utcnow() + timedelta(hours=cls.TOKEN_EXPIRY_HOURS),
                'iat': datetime.utcnow()
            }
            token = jwt.encode(payload, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
            return token
        except Exception as e:
            logger.error(f"Error generating token: {str(e)}")
            return None
    
    @classmethod
    def verify_token(cls, token):
        """Verify JWT token and return user data"""
        try:
            payload = jwt.decode(token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {str(e)}")
            return None
    
    @classmethod
    def authenticate_user(cls, username, password):
        """Authenticate user credentials"""
        try:
            user = AdminUser.query.filter_by(username=username, is_active=True).first()
            if user and check_password_hash(user.password_hash, password):
                # Update last login
                user.last_login = datetime.utcnow()
                from app import db
                db.session.commit()
                return user
            return None
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return None

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = AuthService.verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Get current user
        current_user = AdminUser.query.get(payload['user_id'])
        if not current_user or not current_user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 401
        
        request.current_user = current_user
        return f(*args, **kwargs)
    
    return decorated
