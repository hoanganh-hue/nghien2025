import os
import logging
from flask import Flask
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create separate merchant app
merchant_app = Flask(__name__)
merchant_app.secret_key = os.environ.get("SESSION_SECRET", "zalopay-merchant-secret-key-2024")
merchant_app.wsgi_app = ProxyFix(merchant_app.wsgi_app, x_proto=1, x_host=1)

# CORS configuration
CORS(merchant_app, origins=["http://localhost:8000", "http://127.0.0.1:8000"])

# File upload configuration
merchant_app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
merchant_app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads', 'merchant')

# Ensure upload directory exists
os.makedirs(merchant_app.config['UPLOAD_FOLDER'], exist_ok=True)

# Import merchant routes
from merchant_routes import merchant_bp
merchant_app.register_blueprint(merchant_bp)

if __name__ == '__main__':
    merchant_app.run(host='0.0.0.0', port=8000, debug=True)
