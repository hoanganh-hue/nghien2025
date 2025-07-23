"""
Database service for managing database operations
"""
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app import db
import logging

logger = logging.getLogger(__name__)

class DatabaseService:
    @staticmethod
    def get_session():
        """Get database session"""
        return db.session
    
    @staticmethod
    def execute_query(query, params=None):
        """Execute raw SQL query"""
        try:
            result = db.session.execute(text(query), params or {})
            db.session.commit()
            return result
        except Exception as e:
            db.session.rollback()
            logger.error(f"Database query error: {str(e)}")
            raise
    
    @staticmethod
    def get_statistics():
        """Get dashboard statistics"""
        try:
            stats = {}
            
            # Partner registrations count by status
            from models import PartnerRegistration, RegistrationStatus
            stats['total_registrations'] = PartnerRegistration.query.count()
            stats['pending_registrations'] = PartnerRegistration.query.filter_by(status=RegistrationStatus.PENDING).count()
            stats['approved_registrations'] = PartnerRegistration.query.filter_by(status=RegistrationStatus.APPROVED).count()
            
            # Account verifications count
            from models import AccountVerification
            stats['total_verifications'] = AccountVerification.query.count()
            stats['pending_verifications'] = AccountVerification.query.filter_by(status=RegistrationStatus.PENDING).count()
            
            # Transactions count and volume
            from models import Transaction, TransactionStatus
            stats['total_transactions'] = Transaction.query.count()
            stats['completed_transactions'] = Transaction.query.filter_by(status=TransactionStatus.COMPLETED).count()
            
            # Total transaction volume
            volume_result = db.session.execute(
                text("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'completed'")
            ).scalar()
            stats['total_volume'] = volume_result or 0
            
            return stats
        except Exception as e:
            logger.error(f"Error getting statistics: {str(e)}")
            return {}
    
    @staticmethod
    def create_audit_log(user_id, action, resource_type, resource_id=None, details=None, ip_address=None, user_agent=None):
        """Create audit log entry"""
        try:
            from models import AuditLog
            log = AuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details,
                ip_address=ip_address,
                user_agent=user_agent
            )
            db.session.add(log)
            db.session.commit()
        except Exception as e:
            logger.error(f"Error creating audit log: {str(e)}")
