import os
from datetime import datetime, timedelta
import random
from werkzeug.security import generate_password_hash
from app import app, db
from models import (
    AdminUser,
    PartnerRegistration,
    UploadedFile,
    AccountVerification,
    Transaction,
    AuditLog,
    BusinessIndustry,
    RegistrationStatus,
    EmailType,
    TransactionStatus,
    TransactionType,
)
import uuid

def populate_data():
    with app.app_context():
        print("Bắt đầu điền dữ liệu mẫu...")

        # Clear existing data (optional, for fresh start)
        # db.drop_all()
        # db.create_all()

        # Create additional AdminUser
        if not AdminUser.query.filter_by(username='testadmin').first():
            test_admin = AdminUser(
                username='testadmin',
                email='testadmin@zalopay.vn',
                password_hash=generate_password_hash('testadmin123'),
                is_superuser=False
            )
            db.session.add(test_admin)
            print("Đã tạo người dùng admin mẫu: testadmin/testadmin123")
        else:
            test_admin = AdminUser.query.filter_by(username='testadmin').first()

        # PartnerRegistrations
        registrations_data = [
            {
                "business_name": "Cửa hàng ABC",
                "business_type": "individual",
                "industry": BusinessIndustry.RETAIL,
                "business_address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
                "business_phone": "0901234567",
                "business_email": "abc@example.com",
                "representative_name": "Nguyễn Văn A",
                "representative_phone": "0901234567",
                "representative_email": "nguyenvana@example.com",
                "representative_id_number": "123456789",
                "bank_name": "Vietcombank",
                "bank_account_number": "0011001234567",
                "bank_account_name": "NGUYEN VAN A",
                "status": RegistrationStatus.PENDING,
            },
            {
                "business_name": "Công ty XYZ",
                "business_type": "enterprise",
                "industry": BusinessIndustry.RESTAURANT,
                "tax_code": "0312345678",
                "business_license": "GPKD-XYZ-2023",
                "business_address": "456 Đường Nguyễn Huệ, Quận 1, TP.HCM",
                "business_phone": "02812345678",
                "business_email": "xyz@example.com",
                "website": "https://www.xyz.com",
                "representative_name": "Trần Thị B",
                "representative_phone": "0908765432",
                "representative_email": "tranthib@example.com",
                "representative_id_number": "987654321",
                "representative_position": "Giám đốc",
                "bank_name": "Techcombank",
                "bank_account_number": "190200987654321",
                "bank_account_name": "CONG TY XYZ",
                "status": RegistrationStatus.APPROVED,
                "reviewed_at": datetime.utcnow(),
                "reviewed_by": test_admin.id,
                "notes": "Hồ sơ đầy đủ, đã phê duyệt.",
            },
            {
                "business_name": "Dịch vụ DEF",
                "business_type": "individual",
                "industry": BusinessIndustry.SERVICES,
                "business_address": "789 Đường Hai Bà Trưng, Quận 3, TP.HCM",
                "business_phone": "0912345678",
                "business_email": "def@example.com",
                "representative_name": "Lê Văn C",
                "representative_phone": "0912345678",
                "representative_email": "levanc@example.com",
                "representative_id_number": "456789123",
                "bank_name": "ACB",
                "bank_account_number": "2000123456789",
                "bank_account_name": "LE VAN C",
                "status": RegistrationStatus.REJECTED,
                "reviewed_at": datetime.utcnow(),
                "reviewed_by": test_admin.id,
                "notes": "Thông tin không hợp lệ.",
            },
        ]

        for data in registrations_data:
            if not PartnerRegistration.query.filter_by(business_email=data["business_email"]).first():
                registration = PartnerRegistration(**data)
                db.session.add(registration)
                db.session.flush() # To get ID for uploaded files
                if data["status"] == RegistrationStatus.APPROVED:
                    # Add sample uploaded files for approved registration
                    file1 = UploadedFile(
                        filename=f"{uuid.uuid4()}.pdf",
                        original_filename="giay_phep_kinh_doanh.pdf",
                        file_path="/uploads/giay_phep_kinh_doanh.pdf",
                        file_type="application/pdf",
                        file_size=1024 * 500, # 500KB
                        registration_id=registration.id,
                        uploaded_at=datetime.utcnow() - timedelta(days=random.randint(1, 10))
                    )
                    file2 = UploadedFile(
                        filename=f"{uuid.uuid4()}.jpg",
                        original_filename="cmnd_nguoi_dai_dien.jpg",
                        file_path="/uploads/cmnd_nguoi_dai_dien.jpg",
                        file_type="image/jpeg",
                        file_size=1024 * 300, # 300KB
                        registration_id=registration.id,
                        uploaded_at=datetime.utcnow() - timedelta(days=random.randint(1, 10))
                    )
                    db.session.add_all([file1, file2])
                print(f"Đã tạo đăng ký đối tác: {data['business_name']} ({data['status'].value})")
            else:
                print(f"Đăng ký đối tác {data['business_name']} đã tồn tại.")

        db.session.commit()

        # Fetch the approved partner for further data creation
        approved_partner = PartnerRegistration.query.filter_by(status=RegistrationStatus.APPROVED).first()
        if not approved_partner:
            print("Không tìm thấy đối tác đã phê duyệt để tạo dữ liệu liên quan.")
            return

        # AccountVerifications
        verifications_data = [
            {
                "partner_id": approved_partner.id,
                "email_type": EmailType.BUSINESS,
                "verification_type": "identity_verification",
                "description": "Yêu cầu xác minh danh tính cho chủ doanh nghiệp.",
                "status": RegistrationStatus.PENDING,
                "submitted_at": datetime.utcnow() - timedelta(days=random.randint(1, 5)),
            },
            {
                "partner_id": approved_partner.id,
                "email_type": EmailType.PERSONAL,
                "verification_type": "business_verification",
                "description": "Xác minh giấy phép kinh doanh và địa chỉ.",
                "status": RegistrationStatus.APPROVED,
                "submitted_at": datetime.utcnow() - timedelta(days=random.randint(6, 10)),
                "reviewed_at": datetime.utcnow() - timedelta(days=random.randint(1, 3)),
                "reviewed_by": test_admin.id,
                "notes": "Đã xác minh thành công.",
            },
        ]

        for data in verifications_data:
            if not AccountVerification.query.filter_by(partner_id=data["partner_id"], verification_type=data["verification_type"]).first():
                verification = AccountVerification(**data)
                db.session.add(verification)
                db.session.flush() # To get ID for uploaded files
                if data["status"] == RegistrationStatus.APPROVED:
                    file3 = UploadedFile(
                        filename=f"{uuid.uuid4()}.pdf",
                        original_filename="giay_chung_nhan_doanh_nghiep.pdf",
                        file_path="/uploads/giay_chung_nhan_doanh_nghiep.pdf",
                        file_type="application/pdf",
                        file_size=1024 * 700, # 700KB
                        verification_id=verification.id,
                        uploaded_at=datetime.utcnow() - timedelta(days=random.randint(1, 5))
                    )
                    db.session.add(file3)
                print(f"Đã tạo yêu cầu xác minh: {data['verification_type']} ({data['status'].value}) cho đối tác {approved_partner.business_name}")
            else:
                print(f"Yêu cầu xác minh {data['verification_type']} cho đối tác {approved_partner.business_name} đã tồn tại.")
        db.session.commit()

        # Transactions
        transactions_data = [
            {
                "transaction_id": str(uuid.uuid4()),
                "partner_id": approved_partner.id,
                "amount": 5000000, # 50,000 VND
                "currency": "VND",
                "transaction_type": TransactionType.PAYMENT,
                "status": TransactionStatus.COMPLETED,
                "description": "Thanh toán đơn hàng #12345",
                "payment_method": "ZaloPay",
                "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                "completed_at": datetime.utcnow() - timedelta(days=random.randint(1, 29)),
            },
            {
                "transaction_id": str(uuid.uuid4()),
                "partner_id": approved_partner.id,
                "amount": 12000000, # 120,000 VND
                "currency": "VND",
                "transaction_type": TransactionType.PAYMENT,
                "status": TransactionStatus.COMPLETED,
                "description": "Thanh toán dịch vụ tháng 7",
                "payment_method": "Bank Transfer",
                "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                "completed_at": datetime.utcnow() - timedelta(days=random.randint(1, 29)),
            },
            {
                "transaction_id": str(uuid.uuid4()),
                "partner_id": approved_partner.id,
                "amount": 2500000, # 25,000 VND
                "currency": "VND",
                "transaction_type": TransactionType.REFUND,
                "status": TransactionStatus.COMPLETED,
                "description": "Hoàn tiền đơn hàng #12345",
                "payment_method": "ZaloPay",
                "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                "completed_at": datetime.utcnow() - timedelta(days=random.randint(1, 29)),
            },
            {
                "transaction_id": str(uuid.uuid4()),
                "partner_id": approved_partner.id,
                "amount": 7500000, # 75,000 VND
                "currency": "VND",
                "transaction_type": TransactionType.PAYMENT,
                "status": TransactionStatus.PENDING,
                "description": "Đơn hàng đang chờ xử lý",
                "payment_method": "ZaloPay",
                "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 5)),
            },
            {
                "transaction_id": str(uuid.uuid4()),
                "partner_id": approved_partner.id,
                "amount": 10000000, # 100,000 VND
                "currency": "VND",
                "transaction_type": TransactionType.WITHDRAWAL,
                "status": TransactionStatus.FAILED,
                "description": "Rút tiền thất bại do lỗi ngân hàng",
                "payment_method": "Bank Transfer",
                "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 10)),
            },
        ]

        for data in transactions_data:
            if not Transaction.query.filter_by(transaction_id=data["transaction_id"]).first():
                transaction = Transaction(**data)
                db.session.add(transaction)
                print(f"Đã tạo giao dịch: {data['transaction_id']} ({data['status'].value})")
            else:
                print(f"Giao dịch {data['transaction_id']} đã tồn tại.")
        db.session.commit()

        # AuditLogs
        audit_logs_data = [
            {
                "user_id": test_admin.id,
                "action": "LOGIN",
                "resource_type": "AdminUser",
                "resource_id": test_admin.id,
                "details": "Đăng nhập thành công",
                "ip_address": "192.168.1.1",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                "created_at": datetime.utcnow() - timedelta(minutes=random.randint(1, 60)),
            },
            {
                "user_id": test_admin.id,
                "action": "UPDATE_STATUS",
                "resource_type": "PartnerRegistration",
                "resource_id": approved_partner.id,
                "details": f"Cập nhật trạng thái đăng ký đối tác {approved_partner.business_name} thành APPROVED",
                "ip_address": "192.168.1.1",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                "created_at": datetime.utcnow() - timedelta(hours=random.randint(1, 24)),
            },
        ]

        for data in audit_logs_data:
            audit_log = AuditLog(**data)
            db.session.add(audit_log)
            print(f"Đã tạo nhật ký kiểm toán: {data['action']} - {data['resource_type']}")
        db.session.commit()

        print("Điền dữ liệu mẫu hoàn tất.")

if __name__ == '__main__':
    populate_data()
