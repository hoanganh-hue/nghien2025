import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
from sqlalchemy.orm import DeclarativeBase

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "zalopay-admin-secret-key-2024")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# CORS configuration
CORS(app, origins=["http://localhost:5000", "http://127.0.0.1:5000"])

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Database configuration
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///zalopay_portal.db")
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# File upload configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db.init_app(app)

with app.app_context():
    # Import models to ensure they're registered
    import models
    
    # Create all tables
    db.create_all()
    
    # Create default admin user if not exists
    from models import AdminUser
    from werkzeug.security import generate_password_hash
    
    admin = AdminUser.query.filter_by(username='admin').first()
    if not admin:
        admin = AdminUser(
            username='admin',
            email='admin@zalopay.vn',
            password_hash=generate_password_hash('admin123'),
            is_superuser=True
        )
        db.session.add(admin)
        db.session.commit()
        print("Default admin user created: admin/admin123")

# Import and register blueprints
from admin_routes import admin_bp
from merchant_routes import merchant_bp

# Register blueprints
app.register_blueprint(admin_bp, url_prefix='/api')
app.register_blueprint(merchant_bp)

# Serve static files for admin frontend
@app.route('/admin')
@app.route('/admin/')
@app.route('/admin/<path:path>')
def serve_admin(path=''):
    """Serve the React admin application"""
    return app.send_static_file('admin/index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
