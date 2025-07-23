Hệ thống ZaloPay Admin & Merchant Portal
Mục lục
1. Giới thiệu (#1-giới-thiệu)
2. Kiến trúc hệ thống (#2-kiến-trúc-hệ-thống)
* Backend (#backend)
* Frontend (#frontend)
* Cơ sở dữ liệu (#cơ-sở-dữ-liệu)
3. Tính năng chính (#3-tính-năng-chính)
* Ứng dụng Admin (#ứng-dụng-admin)
* Ứng dụng Merchant (#ứng-dụng-merchant)
4. Yêu cầu hệ thống (#4-yêu-cầu-hệ-thống)
5. Cài đặt & Triển khai (#5-cài-đặt--triển-khai)
* Bước 1: Clone Repository (#bước-1-clone-repository)
* Bước 2: Cấu hình Backend (#bước-2-cấu-hình-backend)
* Cài đặt Python và Virtual Environment
(#cài-đặt-python-và-virtual-environment)
* Cấu hình Cơ sở dữ liệu PostgreSQL
(#cấu-hình-cơ-sở-dữ-liệu-postgresql)
* Cấu hình biến môi trường
(#cấu-hình-biến-môi-trường)
* Khởi tạo Cơ sở dữ liệu (#khởi-tạo-cơ-sở-dữ-liệu)
* Bước 3: Cấu hình Frontend
(#bước-3-cấu-hình-frontend)
* Cài đặt Node.js và npm (#cài-đặt-nodejs-và-npm)
* Cài đặt Dependencies (#cài-đặt-dependencies)
* Build Frontend (#build-frontend)
* Bước 4: Chạy ứng dụng (#bước-4-chạy-ứng-dụng)
* Chạy Backend Admin (#chạy-backend-admin)
* Chạy Backend Merchant (#chạy-backend-merchant)
* Phục vụ Frontend Admin (#phục-vụ-frontend-admin)
6. Lưu ý quan trọng & Khắc phục sự cố
(#6-lưu-ý-quan-trọng--khắc-phục-sự-cố)
* Quyền thư mục Uploads (#quyền-thư-mục-uploads)
* Lỗi kết nối Database (#lỗi-kết-nối-database)
* Xung đột cổng (#xung-đột-cổng)
* Logging (#logging)
* CSRF Protection (#csrf-protection)
7. Phát triển & Mở rộng (#7-phát-triển--mở-rộng)

8. Công cụ Tự động hóa Triển khai (#8-công-cụ-tự-động-hóa-triển-khai)
Dự án bao gồm hệ thống công cụ tự động hóa triển khai trong thư mục `scripts/merchant/automation/`. Các công cụ này hỗ trợ thiết lập môi trường, sao lưu và phục hồi cơ sở dữ liệu, cũng như chạy server một cách nhanh chóng và an toàn với các tính năng:
- Thiết lập zero-config, tự động phát hiện Python, tạo và kích hoạt virtual environment.
- Sao lưu và phục hồi database với độ chính xác cao, bao gồm cả cấu trúc và dữ liệu.
- Xử lý lỗi thông minh và dọn dẹp tự động khi có sự cố.
- Hỗ trợ chạy các tác vụ định kỳ và giám sát server.
Chi tiết hướng dẫn sử dụng và cấu hình có trong file `scripts/merchant/automation/README.md`.
---
1. Giới thiệu
Dự án này cung cấp một hệ thống toàn diện cho ZaloPay, bao
gồm hai ứng dụng chính:
* ZaloPay Admin Portal: Ứng dụng quản trị nội bộ cho phép
nhân viên ZaloPay quản lý các đăng ký đối tác, xác minh
tài khoản, theo dõi giao dịch và xem báo cáo.
* ZaloPay Merchant Portal: Cổng thông tin dành cho các đối
tác/người bán, cho phép họ đăng ký trở thành đối tác và
thực hiện quy trình xác minh tài khoản.
Hệ thống được thiết kế với kiến trúc phân tán, đảm bảo tính
độc lập và khả năng mở rộng cho từng thành phần.
2. Kiến trúc hệ thống
Hệ thống được chia thành các thành phần chính:
Backend
* Được xây dựng bằng Flask (Python), cung cấp các API
RESTful cho cả ứng dụng Admin và Merchant.
* Hai ứng dụng Flask riêng biệt (app.py cho Admin và
merchant_app.py cho Merchant) chạy trên các cổng khác
nhau, đảm bảo sự độc lập về logic và triển khai.
* Sử dụng SQLAlchemy làm ORM để tương tác với cơ sở dữ
liệu.
* Tích hợp các tính năng bảo mật như xác thực JWT, giới
hạn tốc độ truy cập (rate limiting) và bảo vệ CSRF.
Frontend
* Admin Frontend: Là một Single Page Application (SPA) được
phát triển bằng React (TypeScript), sử dụng Wouter cho
routing và React Query để quản lý dữ liệu. Giao diện
người dùng được xây dựng với các component từ Shadcn/ui
(dựa trên Radix UI và Tailwind CSS).
* Merchant Frontend: Là một tập hợp các trang HTML, CSS và
JavaScript thuần được phục vụ trực tiếp bởi ứng dụng
Flask Merchant.
Cơ sở dữ liệu
* Cả hai ứng dụng Backend (Admin và Merchant) chia sẻ chung
một cơ sở dữ liệu SQL.
* Sử dụng PostgreSQL làm hệ quản trị cơ sở dữ liệu khuyến
nghị cho môi trường sản phẩm, với tùy chọn SQLite cho môi
trường phát triển.
* Các định nghĩa model được chuẩn hóa và tập trung trong
thư mục backend/app/models/.
* Logic tương tác với cơ sở dữ liệu được quản lý thông qua
DatabaseManager trong
backend/app/services/database_service.py.
3. Tính năng chính
Ứng dụng Admin
* Quản lý đăng ký đối tác:
* Xem danh sách đăng ký mới.
* Lọc và tìm kiếm đăng ký theo trạng thái, ngành nghề,
tên doanh nghiệp, và khoảng thời gian.
* Xem chi tiết thông tin đăng ký, bao gồm các tài liệu
đính kèm.
* Phê duyệt, từ chối hoặc chuyển trạng thái "đang xem
xét" cho các đăng ký.
* Chỉnh sửa thông tin hồ sơ đối tác đã được phê duyệt.
* Xuất dữ liệu đăng ký ra file CSV.
* Quản lý xác minh tài khoản:
* Xem danh sách các yêu cầu xác minh tài khoản.
* Lọc và tìm kiếm yêu cầu xác minh theo loại email và
khoảng thời gian.
* Xem chi tiết yêu cầu xác minh, bao gồm các file bằng
chứng.
* Xuất báo cáo xác minh ra file CSV.
* Quản lý giao dịch:
* Xem danh sách các giao dịch của đối tác.
* Lọc và tìm kiếm giao dịch theo ID đối tác, trạng
thái, loại giao dịch, và khoảng thời gian.
* Xem chi tiết từng giao dịch.
* Cập nhật trạng thái giao dịch.
* Hệ thống thông báo: Hiển thị các thông báo gần đây (từ
audit logs) trên giao diện admin.
* Quản lý người dùng Admin: Đăng nhập, đăng ký (chỉ
superuser), xem thông tin người dùng hiện tại.
Ứng dụng Merchant
* Đăng ký đối tác: Cung cấp biểu mẫu để đối tác điền thông
tin doanh nghiệp, thông tin người đại diện, thông tin
thanh toán và tải lên các tài liệu cần thiết (CMND/CCCD,
giấy phép kinh doanh).
* Xác minh tài khoản: Cung cấp biểu mẫu để đối tác gửi yêu
cầu xác minh tài khoản với các bằng chứng liên quan.
* Trang thông tin: Giới thiệu về ZaloPay Merchant, các giải
pháp, lợi ích, đối tác và câu hỏi thường gặp (FAQ).
4. Yêu cầu hệ thống
Để triển khai và chạy dự án này, máy chủ của bạn cần có
các phần mềm sau:
* Git: Để clone repository.
* Python 3.9+: (Khuyến nghị Python 3.11 hoặc 3.13 như
trong .venv của dự án).
* pip: Trình quản lý gói Python (thường đi kèm với
Python).
* Node.js 18+: (Khuyến nghị phiên bản LTS).
* npm: Trình quản lý gói Node.js (thường đi kèm với
Node.js).
* PostgreSQL: Hệ quản trị cơ sở dữ liệu (khuyến nghị cho
môi trường sản phẩm).
* Đảm bảo PostgreSQL server đang chạy và có thể truy
cập được.
* Tạo một database mới cho dự án (ví dụ: zalopay_db).
* Cấu hình quyền truy cập cho người dùng database.
5. Cài đặt & Triển khai
Thực hiện các bước sau theo thứ tự để cài đặt và triển
khai dự án.
Bước 1: Clone Repository
Mở terminal hoặc command prompt và chạy lệnh sau:
1 git clone
zalopay-project
2 cd zalopay-project
Bước 2: Cấu hình Backend
Cài đặt Python và Virtual Environment
Di chuyển vào thư mục backend và tạo một virtual
environment:
1 cd backend
2 python3 -m venv venv
Kích hoạt virtual environment:
* Trên Linux/macOS:
1 source venv/bin/activate
* Trên Windows (Command Prompt):
1 venv\Scripts\activate.bat
* Trên Windows (PowerShell):
1 venv\Scripts\Activate.ps1
Cài đặt các thư viện Python cần thiết:
1 pip install -r requirements.txt
Cấu hình Cơ sở dữ liệu PostgreSQL
1. Tạo Database:
Đảm bảo bạn đã cài đặt và khởi động PostgreSQL. Mở
psql hoặc công cụ quản lý PostgreSQL và tạo một database
mới (ví dụ: zalopay_db) và một người dùng với mật khẩu
phù hợp.
1 CREATE DATABASE zalopay_db;
2 CREATE USER zalopay_user WITH PASSWORD
'your_password';
3 GRANT ALL PRIVILEGES ON DATABASE zalopay_db
TO zalopay_user;
2. Cấu hình `pg_hba.conf` (nếu cần):
Nếu bạn gặp lỗi kết nối, hãy kiểm tra file pg_hba.conf
của PostgreSQL để đảm bảo cho phép kết nối từ địa chỉ IP
của ứng dụng. Thường nằm ở
/etc/postgresql//main/pg_hba.conf trên Linux hoặc
trong thư mục cài đặt PostgreSQL trên Windows. Thêm dòng
sau (thay thế IP và phương thức xác thực phù hợp):
1 host zalopay_db zalopay_user
0.0.0.0/0 md5
Sau khi chỉnh sửa, khởi động lại dịch vụ PostgreSQL.
Cấu hình biến môi trường
Tạo một file .env trong thư mục backend/ bằng cách sao
chép file .env.example:
1 cp .env.example .env
Mở file .env và cấu hình các biến sau:
1 # Secret key for Flask application (generate a
strong, random key)
2 SECRET_KEY='your_super_secret_key_here'
3
4 # Database URL for PostgreSQL (replace with your
actual credentials)
5 # Format:
postgresql://user:password@host:port/database_na
me
6 DATABASE_URL=
'postgresql://zalopay_user:your_password@localho
st:5432/zalopay_db'
7
8 # Or for SQLite (development only, not
recommended for production)
9 # DATABASE_URL='sqlite:
///./instance/zalopay_portal.db'
10
11 # Flask app port for Admin (default: 8000)
12 PORT=8000
13
14 # Flask app port for Merchant (default: 8001)
15 MERCHANT_PORT=8001
16
17 # Debug mode (set to False for production)
18 DEBUG=True
Khởi tạo Cơ sở dữ liệu
Sau khi cấu hình DATABASE_URL, chạy lệnh sau để tạo các
bảng trong cơ sở dữ liệu và tạo người dùng admin mặc
định:
1 python3 -c "from
backend.app.services.database_service import
init_database; init_database()"
Nếu thành công, bạn sẽ thấy thông báo Database tables
created successfully và Default admin user created:
admin/admin123.
Bước 3: Cấu hình Frontend
Di chuyển vào thư mục frontend:
1 cd ../frontend
Cài đặt Node.js và npm
Đảm bảo Node.js và npm đã được cài đặt trên hệ thống của
bạn.
Cài đặt Dependencies
Cài đặt các thư viện JavaScript cần thiết:
1 npm install
Build Frontend
Build ứng dụng React Admin cho môi trường production. Các
file tĩnh sẽ được tạo trong frontend/dist/public/.
1 npm run build
Bước 4: Chạy ứng dụng
Bạn cần chạy cả hai ứng dụng backend (Admin và Merchant)
và phục vụ frontend Admin.
Chạy Backend Admin
Mở một terminal mới, di chuyển vào thư mục backend/ và
kích hoạt virtual environment. Sau đó chạy ứng dụng
Admin:
1 cd zalopay-project/backend
2 source venv/bin/activate # hoặc
venv\Scripts\activate.bat trên Windows
3 gunicorn -w 4 -b 0.0.0.0:$PORT app:app # $PORT là
biến môi trường đã cấu hình (mặc định 8000)
* gunicorn: Web Server Gateway Interface (WSGI) HTTP Server
cho Python.
* -w 4: Chạy 4 worker processes.
* -b 0.0.0.0:$PORT: Bind ứng dụng vào tất cả các interface
trên cổng đã cấu hình.
Chạy Backend Merchant
Mở một terminal khác, di chuyển vào thư mục backend/ và kích
hoạt virtual environment. Sau đó chạy ứng dụng Merchant:
1 cd zalopay-project/backend
2 source venv/bin/activate # hoặc
venv\Scripts\activate.bat trên Windows
3 gunicorn -w 4 -b 0.0.0.0:$MERCHANT_PORT
app.api.merchant.merchant_app:app #
$MERCHANT_PORT là biến môi trường đã cấu hình
(mặc định 8001)
Phục vụ Frontend Admin
Ứng dụng Admin frontend được build thành các file tĩnh
trong frontend/dist/public/. Bạn có thể phục vụ các file
này bằng bất kỳ web server tĩnh nào (ví dụ: Nginx,
Apache, hoặc một server Python đơn giản cho mục đích thử
nghiệm).
Cách đơn giản nhất để thử nghiệm (không dùng cho
Production):
Bạn có thể sử dụng một HTTP server đơn giản của Python để
phục vụ các file này. Mở một terminal khác, di chuyển vào
thư mục frontend/dist/public/:
1 cd zalopay-project/frontend/dist/public
2 python3 -m http.server 3000 # Hoặc cổng bất kỳ
bạn muốn
Sau đó, truy cập:
* Admin Portal: http://localhost:3000 (hoặc cổng bạn đã
chọn)
* Merchant Portal: http://localhost:8001 (hoặc cổng bạn đã
cấu hình cho Merchant Backend)
Lưu ý: Đối với môi trường production, bạn nên sử dụng một
web server mạnh mẽ hơn như Nginx hoặc Apache để phục vụ
các file frontend Admin và proxy request đến backend
Flask.
6. Lưu ý quan trọng & Khắc phục sự cố
* Quyền thư mục Uploads:
* Đảm bảo thư mục backend/uploads/ có quyền ghi cho
người dùng mà ứng dụng Flask đang chạy. Nếu không,
việc tải file lên sẽ thất bại.
* Bạn có thể cần chạy chmod -R 775 backend/uploads trên
Linux/macOS.
* Lỗi kết nối Database:
* Kiểm tra lại DATABASE_URL trong file .env.
* Đảm bảo PostgreSQL server đang chạy và có thể truy
cập từ máy chủ ứng dụng.
* Kiểm tra cấu hình pg_hba.conf và firewall.
* Đảm bảo bạn đã chạy init_database() thành công.
* Xung đột cổng:
* Nếu bạn gặp lỗi "Address already in use", có thể có
một tiến trình khác đang sử dụng cổng 8000 hoặc 8001.
* Bạn có thể thay đổi PORT và MERCHANT_PORT trong file
.env hoặc tìm và dừng tiến trình đang chiếm cổng.
* Logging:
* Các log của backend được ghi vào
backend/app/logs/error.log và
backend/app/logs/info.log. Kiểm tra các file này để
tìm lỗi.
* CSRF Protection:
* Flask-WTF CSRFProtect được sử dụng. Đảm bảo rằng các
request từ frontend đến backend có chứa CSRF token
hợp lệ (đặc biệt là các request
POST/PUT/PATCH/DELETE).
* Các API endpoint công khai (như đăng ký merchant)
được miễn trừ CSRF (@csrf.exempt).
* Cập nhật Frontend sau thay đổi Backend:
* Mỗi khi bạn thay đổi code backend (API), bạn cần khởi
động lại các ứng dụng Flask.
* Mỗi khi bạn thay đổi code frontend (React), bạn cần
chạy lại npm run build và đảm bảo web server tĩnh
phục vụ các file mới nhất.
7. Phát triển & Mở rộng
* Thêm tính năng: Dễ dàng thêm các tính năng mới bằng cách
tạo các endpoint API mới ở backend và các component/trang
mới ở frontend.
* Mở rộng Database: Thêm các model mới vào
backend/app/models/ và cập nhật
backend/app/database/database.py để tích hợp chúng.
* CI/CD: Cân nhắc thiết lập CI/CD pipeline (ví dụ: sử dụng
GitHub Actions, GitLab CI/CD) để tự động hóa quá trình
build, test và triển khai.
* Containerization: Đóng gói ứng dụng bằng Docker để dễ
dàng triển khai và quản lý trên các môi trường khác nhau.
* Monitoring & Alerting: Tích hợp các công cụ giám sát để
theo dõi hiệu suất ứng dụng và thiết lập cảnh báo khi có
sự cố.
---