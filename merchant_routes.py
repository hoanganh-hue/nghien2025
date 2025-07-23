"""
Merchant portal routes for partner registration and account verification
"""
from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from app import db
from models import PartnerRegistration, AccountVerification, UploadedFile, BusinessIndustry, EmailType
from file_service import FileService
from datetime import datetime
import logging
import os

logger = logging.getLogger(__name__)

# Create blueprint for merchant routes
merchant_bp = Blueprint('merchant', __name__, template_folder='templates/merchant')

@merchant_bp.route('/')
def index():
    """Merchant homepage - replica of ZaloPay merchant site"""
    return render_template('merchant/index.html')

@merchant_bp.route('/register')
def register_form():
    """Partner registration form"""
    return render_template('merchant/register.html')

@merchant_bp.route('/register', methods=['POST'])
def register_partner():
    """Handle partner registration submission"""
    try:
        # Get form data
        business_name = request.form.get('business_name')
        business_type = request.form.get('business_type')
        industry = request.form.get('industry')
        tax_code = request.form.get('tax_code')
        business_license = request.form.get('business_license')
        business_address = request.form.get('business_address')
        business_phone = request.form.get('business_phone')
        business_email = request.form.get('business_email')
        website = request.form.get('website')
        
        # Representative information
        representative_name = request.form.get('representative_name')
        representative_phone = request.form.get('representative_phone')
        representative_email = request.form.get('representative_email')
        representative_id_number = request.form.get('representative_id_number')
        representative_position = request.form.get('representative_position')
        
        # Bank information
        bank_name = request.form.get('bank_name')
        bank_account_number = request.form.get('bank_account_number')
        bank_account_name = request.form.get('bank_account_name')
        bank_branch = request.form.get('bank_branch')
        
        # Validate required fields
        required_fields = [
            business_name, business_type, industry, business_address, business_phone,
            business_email, representative_name, representative_phone, representative_email,
            representative_id_number, bank_name, bank_account_number, bank_account_name
        ]
        
        if not all(required_fields):
            flash('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error')
            return redirect(url_for('merchant.register_form'))
        
        # Create registration record
        registration = PartnerRegistration(
            business_name=business_name,
            business_type=business_type,
            industry=BusinessIndustry(industry),
            tax_code=tax_code,
            business_license=business_license,
            business_address=business_address,
            business_phone=business_phone,
            business_email=business_email,
            website=website,
            representative_name=representative_name,
            representative_phone=representative_phone,
            representative_email=representative_email,
            representative_id_number=representative_id_number,
            representative_position=representative_position,
            bank_name=bank_name,
            bank_account_number=bank_account_number,
            bank_account_name=bank_account_name,
            bank_branch=bank_branch
        )
        
        db.session.add(registration)
        db.session.flush()  # Get the ID
        
        # Handle file uploads
        upload_folder = os.path.join(os.path.dirname(__file__), 'uploads', 'registrations')
        os.makedirs(upload_folder, exist_ok=True)
        
        # Process uploaded files
        files_to_upload = [
            'business_license_file',
            'representative_id_file',
            'business_location_photos'
        ]
        
        for file_field in files_to_upload:
            if file_field in request.files:
                files = request.files.getlist(file_field)
                for file in files:
                    if file and file.filename:
                        file_info, error = FileService.save_file(
                            file, upload_folder, str(registration.id)
                        )
                        
                        if file_info:
                            uploaded_file = UploadedFile(
                                filename=file_info['filename'],
                                original_filename=file_info['original_filename'],
                                file_path=file_info['file_path'],
                                file_type=file_info['file_type'],
                                file_size=file_info['file_size'],
                                registration_id=registration.id
                            )
                            db.session.add(uploaded_file)
                        else:
                            logger.warning(f"Could not upload file {file.filename}: {error}")
        
        db.session.commit()
        
        flash('Đăng ký thành công! Chúng tôi sẽ xem xét hồ sơ của bạn trong vòng 24 giờ.', 'success')
        return redirect(url_for('merchant.register_success', registration_id=registration.id))
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        db.session.rollback()
        flash('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.', 'error')
        return redirect(url_for('merchant.register_form'))

@merchant_bp.route('/register/success/<int:registration_id>')
def register_success(registration_id):
    """Registration success page"""
    registration = PartnerRegistration.query.get_or_404(registration_id)
    return render_template('merchant/register_success.html', registration=registration)

@merchant_bp.route('/verify')
def verify_form():
    """Account verification form"""
    return render_template('merchant/verify.html')

@merchant_bp.route('/verify', methods=['POST'])
def verify_account():
    """Handle account verification submission"""
    try:
        partner_id = request.form.get('partner_id')
        email_type = request.form.get('email_type')
        verification_type = request.form.get('verification_type')
        description = request.form.get('description')
        
        if not all([partner_id, email_type, verification_type]):
            flash('Vui lòng điền đầy đủ thông tin.', 'error')
            return redirect(url_for('merchant.verify_form'))
        
        # Verify partner exists
        partner = PartnerRegistration.query.get(partner_id)
        if not partner:
            flash('Không tìm thấy thông tin đối tác.', 'error')
            return redirect(url_for('merchant.verify_form'))
        
        # Create verification record
        verification = AccountVerification(
            partner_id=partner_id,
            email_type=EmailType(email_type),
            verification_type=verification_type,
            description=description
        )
        
        db.session.add(verification)
        db.session.flush()
        
        # Handle file uploads
        upload_folder = os.path.join(os.path.dirname(__file__), 'uploads', 'verifications')
        os.makedirs(upload_folder, exist_ok=True)
        
        if 'verification_files' in request.files:
            files = request.files.getlist('verification_files')
            for file in files:
                if file and file.filename:
                    file_info, error = FileService.save_file(
                        file, upload_folder, str(verification.id)
                    )
                    
                    if file_info:
                        uploaded_file = UploadedFile(
                            filename=file_info['filename'],
                            original_filename=file_info['original_filename'],
                            file_path=file_info['file_path'],
                            file_type=file_info['file_type'],
                            file_size=file_info['file_size'],
                            verification_id=verification.id
                        )
                        db.session.add(uploaded_file)
        
        db.session.commit()
        
        flash('Yêu cầu xác minh đã được gửi thành công!', 'success')
        return redirect(url_for('merchant.verify_success', verification_id=verification.id))
        
    except Exception as e:
        logger.error(f"Verification error: {str(e)}")
        db.session.rollback()
        flash('Có lỗi xảy ra. Vui lòng thử lại.', 'error')
        return redirect(url_for('merchant.verify_form'))

@merchant_bp.route('/verify/success/<int:verification_id>')
def verify_success(verification_id):
    """Verification success page"""
    verification = AccountVerification.query.get_or_404(verification_id)
    return render_template('merchant/verify_success.html', verification=verification)

@merchant_bp.route('/solutions')
def solutions():
    """Solutions page"""
    return render_template('merchant/solutions.html')

@merchant_bp.route('/faq')
def faq():
    """FAQ page"""
    return render_template('merchant/faq.html')

# API endpoints for merchant frontend
@merchant_bp.route('/api/industries', methods=['GET'])
def get_industries():
    """Get list of business industries"""
    industries = [
        {'value': 'restaurant', 'label': 'Nhà hàng ăn uống'},
        {'value': 'retail', 'label': 'Bán lẻ'},
        {'value': 'services', 'label': 'Dịch vụ chăm sóc cá nhân'},
        {'value': 'entertainment', 'label': 'Giải trí'},
        {'value': 'online', 'label': 'Kinh doanh online'},
        {'value': 'canteen', 'label': 'Căn tin'},
        {'value': 'parking', 'label': 'Bãi đỗ xe'},
        {'value': 'other', 'label': 'Khác'}
    ]
    return jsonify(industries)

@merchant_bp.route('/api/banks', methods=['GET'])
def get_banks():
    """Get list of banks"""
    banks = [
        'Vietcombank', 'BIDV', 'VietinBank', 'Agribank', 'Techcombank',
        'ACB', 'MB Bank', 'VPBank', 'TPBank', 'Sacombank',
        'HDBank', 'SHB', 'VIB', 'OCB', 'SCB'
    ]
    return jsonify(banks)
