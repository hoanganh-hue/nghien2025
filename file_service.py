"""
File upload and management service
"""
import os
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class FileService:
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}
    MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB
    
    @staticmethod
    def allowed_file(filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in FileService.ALLOWED_EXTENSIONS
    
    @staticmethod
    def save_file(file, upload_folder, subfolder=None):
        """Save uploaded file and return file info"""
        try:
            if not file or not FileService.allowed_file(file.filename):
                return None, "Invalid file type"
            
            # Generate unique filename
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            
            # Create subfolder if specified
            if subfolder:
                upload_path = os.path.join(upload_folder, subfolder)
                os.makedirs(upload_path, exist_ok=True)
            else:
                upload_path = upload_folder
            
            file_path = os.path.join(upload_path, filename)
            
            # Save file
            file.save(file_path)
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            # Create thumbnail for images
            if file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                try:
                    FileService.create_thumbnail(file_path)
                except Exception as e:
                    logger.warning(f"Could not create thumbnail: {str(e)}")
            
            return {
                'filename': filename,
                'original_filename': file.filename,
                'file_path': file_path,
                'file_size': file_size,
                'file_type': file.filename.rsplit('.', 1)[1].lower()
            }, None
            
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            return None, str(e)
    
    @staticmethod
    def create_thumbnail(image_path, size=(150, 150)):
        """Create thumbnail for image"""
        try:
            with Image.open(image_path) as img:
                img.thumbnail(size, Image.Resampling.LANCZOS)
                
                # Save thumbnail with _thumb suffix
                thumb_path = image_path.rsplit('.', 1)[0] + '_thumb.' + image_path.rsplit('.', 1)[1]
                img.save(thumb_path)
                
                return thumb_path
        except Exception as e:
            logger.error(f"Error creating thumbnail: {str(e)}")
            return None
    
    @staticmethod
    def delete_file(file_path):
        """Delete file from filesystem"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                
                # Also delete thumbnail if exists
                thumb_path = file_path.rsplit('.', 1)[0] + '_thumb.' + file_path.rsplit('.', 1)[1]
                if os.path.exists(thumb_path):
                    os.remove(thumb_path)
                
                return True
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            return False
