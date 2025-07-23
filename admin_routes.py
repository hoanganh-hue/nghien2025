"""
Admin API routes for managing partner registrations, verifications, and transactions
"""
from flask import Blueprint, request, jsonify, send_from_directory
from app import db, limiter
from auth_service import token_required, AuthService
from database_service import DatabaseService
from models import (AdminUser, PartnerRegistration, AccountVerification, 
                   Transaction, AuditLog, RegistrationStatus, TransactionStatus)
from datetime import datetime
import csv
import io
import logging

logger = logging.getLogger(__name__)

# Create blueprint for admin API routes
admin_bp = Blueprint('admin', __name__)

# Authentication endpoints
@admin_bp.route('/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        user = AuthService.authenticate_user(username, password)
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        token = AuthService.generate_token(user.id, user.username)
        if not token:
            return jsonify({'error': 'Could not generate token'}), 500
        
        # Create audit log
        DatabaseService.create_audit_log(
            user.id, 'LOGIN', 'AUTH', 
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_superuser': user.is_superuser
            }
        })
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current user info"""
    user = request.current_user
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_superuser': user.is_superuser,
        'last_login': user.last_login.isoformat() if user.last_login else None
    })

# Dashboard endpoints
@admin_bp.route('/api/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        stats = DatabaseService.get_statistics()
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Dashboard stats error: {str(e)}")
        return jsonify({'error': 'Could not fetch statistics'}), 500

@admin_bp.route('/api/dashboard/recent-activities', methods=['GET'])
@token_required
def get_recent_activities():
    """Get recent audit log activities"""
    try:
        activities = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(10).all()
        return jsonify([{
            'id': activity.id,
            'action': activity.action,
            'resource_type': activity.resource_type,
            'resource_id': activity.resource_id,
            'details': activity.details,
            'user': activity.user.username if activity.user else 'System',
            'created_at': activity.created_at.isoformat()
        } for activity in activities])
    except Exception as e:
        logger.error(f"Recent activities error: {str(e)}")
        return jsonify({'error': 'Could not fetch activities'}), 500

# Partner registration endpoints
@admin_bp.route('/api/registrations', methods=['GET'])
@token_required
def get_registrations():
    """Get partner registrations with filtering and pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        industry = request.args.get('industry')
        search = request.args.get('search', '').strip()
        
        query = PartnerRegistration.query
        
        # Apply filters
        if status:
            query = query.filter(PartnerRegistration.status == status)
        if industry:
            query = query.filter(PartnerRegistration.industry == industry)
        if search:
            query = query.filter(
                db.or_(
                    PartnerRegistration.business_name.contains(search),
                    PartnerRegistration.representative_name.contains(search),
                    PartnerRegistration.business_email.contains(search)
                )
            )
        
        # Paginate
        registrations = query.order_by(PartnerRegistration.registered_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'registrations': [{
                'id': reg.id,
                'business_name': reg.business_name,
                'business_type': reg.business_type,
                'industry': reg.industry.value,
                'representative_name': reg.representative_name,
                'business_email': reg.business_email,
                'status': reg.status.value,
                'registered_at': reg.registered_at.isoformat(),
                'reviewed_at': reg.reviewed_at.isoformat() if reg.reviewed_at else None,
                'reviewer': reg.reviewer.username if reg.reviewer else None
            } for reg in registrations.items],
            'total': registrations.total,
            'pages': registrations.pages,
            'current_page': page
        })
    except Exception as e:
        logger.error(f"Get registrations error: {str(e)}")
        return jsonify({'error': 'Could not fetch registrations'}), 500

@admin_bp.route('/api/registrations/<int:registration_id>', methods=['GET'])
@token_required
def get_registration_detail(registration_id):
    """Get detailed registration information"""
    try:
        registration = PartnerRegistration.query.get_or_404(registration_id)
        
        return jsonify({
            'id': registration.id,
            'business_name': registration.business_name,
            'business_type': registration.business_type,
            'industry': registration.industry.value,
            'tax_code': registration.tax_code,
            'business_license': registration.business_license,
            'business_address': registration.business_address,
            'business_phone': registration.business_phone,
            'business_email': registration.business_email,
            'website': registration.website,
            'representative_name': registration.representative_name,
            'representative_phone': registration.representative_phone,
            'representative_email': registration.representative_email,
            'representative_id_number': registration.representative_id_number,
            'representative_position': registration.representative_position,
            'bank_name': registration.bank_name,
            'bank_account_number': registration.bank_account_number,
            'bank_account_name': registration.bank_account_name,
            'bank_branch': registration.bank_branch,
            'status': registration.status.value,
            'registered_at': registration.registered_at.isoformat(),
            'reviewed_at': registration.reviewed_at.isoformat() if registration.reviewed_at else None,
            'reviewer': registration.reviewer.username if registration.reviewer else None,
            'notes': registration.notes,
            'uploaded_files': [{
                'id': file.id,
                'filename': file.original_filename,
                'file_type': file.file_type,
                'file_size': file.file_size,
                'uploaded_at': file.uploaded_at.isoformat()
            } for file in registration.uploaded_files]
        })
    except Exception as e:
        logger.error(f"Get registration detail error: {str(e)}")
        return jsonify({'error': 'Could not fetch registration details'}), 500

@admin_bp.route('/api/registrations/<int:registration_id>/status', methods=['PUT'])
@token_required
def update_registration_status(registration_id):
    """Update registration status"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        notes = data.get('notes', '')
        
        if not new_status or new_status not in [s.value for s in RegistrationStatus]:
            return jsonify({'error': 'Invalid status'}), 400
        
        registration = PartnerRegistration.query.get_or_404(registration_id)
        old_status = registration.status.value
        
        registration.status = RegistrationStatus(new_status)
        registration.reviewed_at = datetime.utcnow()
        registration.reviewed_by = request.current_user.id
        registration.notes = notes
        
        db.session.commit()
        
        # Create audit log
        DatabaseService.create_audit_log(
            request.current_user.id,
            'UPDATE_STATUS',
            'REGISTRATION',
            registration_id,
            f"Status changed from {old_status} to {new_status}",
            request.remote_addr,
            request.headers.get('User-Agent')
        )
        
        return jsonify({'message': 'Status updated successfully'})
        
    except Exception as e:
        logger.error(f"Update registration status error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Could not update status'}), 500

# Similar endpoints for verifications and transactions...
@admin_bp.route('/api/verifications', methods=['GET'])
@token_required
def get_verifications():
    """Get account verifications with filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        verifications = AccountVerification.query.order_by(
            AccountVerification.submitted_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'verifications': [{
                'id': ver.id,
                'partner_id': ver.partner_id,
                'partner_name': ver.partner.business_name if ver.partner else 'Unknown',
                'email_type': ver.email_type.value,
                'verification_type': ver.verification_type,
                'status': ver.status.value,
                'submitted_at': ver.submitted_at.isoformat(),
                'reviewed_at': ver.reviewed_at.isoformat() if ver.reviewed_at else None
            } for ver in verifications.items],
            'total': verifications.total,
            'pages': verifications.pages,
            'current_page': page
        })
    except Exception as e:
        logger.error(f"Get verifications error: {str(e)}")
        return jsonify({'error': 'Could not fetch verifications'}), 500

@admin_bp.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions():
    """Get transactions with filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        transactions = Transaction.query.order_by(
            Transaction.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'transactions': [{
                'id': trans.id,
                'transaction_id': trans.transaction_id,
                'partner_id': trans.partner_id,
                'partner_name': trans.partner.business_name if trans.partner else 'Unknown',
                'amount': trans.amount,
                'currency': trans.currency,
                'transaction_type': trans.transaction_type.value,
                'status': trans.status.value,
                'payment_method': trans.payment_method,
                'created_at': trans.created_at.isoformat(),
                'completed_at': trans.completed_at.isoformat() if trans.completed_at else None
            } for trans in transactions.items],
            'total': transactions.total,
            'pages': transactions.pages,
            'current_page': page
        })
    except Exception as e:
        logger.error(f"Get transactions error: {str(e)}")
        return jsonify({'error': 'Could not fetch transactions'}), 500

# File download endpoint
@admin_bp.route('/api/files/<int:file_id>/download', methods=['GET'])
@token_required
def download_file(file_id):
    """Download uploaded file"""
    try:
        from models import UploadedFile
        file_record = UploadedFile.query.get_or_404(file_id)
        
        directory = os.path.dirname(file_record.file_path)
        filename = os.path.basename(file_record.file_path)
        
        return send_from_directory(
            directory, 
            filename, 
            as_attachment=True,
            download_name=file_record.original_filename
        )
    except Exception as e:
        logger.error(f"Download file error: {str(e)}")
        return jsonify({'error': 'Could not download file'}), 500

# Export endpoints
@admin_bp.route('/api/registrations/export', methods=['GET'])
@token_required
def export_registrations():
    """Export registrations to CSV"""
    try:
        registrations = PartnerRegistration.query.all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'ID', 'Business Name', 'Business Type', 'Industry', 'Representative Name',
            'Business Email', 'Status', 'Registered At', 'Reviewed At'
        ])
        
        # Write data
        for reg in registrations:
            writer.writerow([
                reg.id,
                reg.business_name,
                reg.business_type,
                reg.industry.value,
                reg.representative_name,
                reg.business_email,
                reg.status.value,
                reg.registered_at.strftime('%Y-%m-%d %H:%M:%S'),
                reg.reviewed_at.strftime('%Y-%m-%d %H:%M:%S') if reg.reviewed_at else ''
            ])
        
        output.seek(0)
        
        from flask import Response
        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={"Content-disposition": "attachment; filename=registrations.csv"}
        )
        
    except Exception as e:
        logger.error(f"Export registrations error: {str(e)}")
        return jsonify({'error': 'Could not export registrations'}), 500
