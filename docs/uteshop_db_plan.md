# Kế hoạch Thiết kế Cơ sở Dữ liệu UTEShop

Tài liệu này trình bày bản thảo thiết kế các thực thể (Entities) và thuộc tính (Attributes) cho hệ thống thương mại điện tử nội bộ UTEShop. Thiết kế tuân thủ các tiêu chuẩn chuẩn hóa (3NF) và các best practices từ bộ kỹ năng `database-schema-designer`.

---

## 1. Thực thể Hệ thống (Core Entities)

### 1.1 Người dùng (Users)
Quản lý tài khoản cho tất cả các vai trò (Admin, Vendor, Customer, Shipper).

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, Auto Increment | |
| `full_name` | VARCHAR(100) | NOT NULL | |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | Dùng để đăng nhập |
| `password` | VARCHAR(255) | NOT NULL | Lưu hash bcrypt |
| `phone` | VARCHAR(15) | | |
| `role` | ENUM | NOT NULL | admin, vendor, customer, shipper |
| `student_id` | VARCHAR(20) | | Dùng cho sinh viên |
| `faculty` | VARCHAR(100) | | Khoa/Phòng ban |
| `avatar_url` | VARCHAR(255) | | |
| `status` | ENUM | DEFAULT 'pending'| pending, active, locked, inactive |
| `failed_login_attempts`| INT | DEFAULT 0 | Số lần nhập sai mật khẩu |
| `lockout_until` | DATETIME | | Thời gian bị khóa đến |
| `email_verified_at` | DATETIME | | Thời điểm xác thực email |
| `coin_balance` | INT | DEFAULT 0 | Số dư xu hiện tại |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

### 1.2 Hồ sơ Shipper (Shipper_Profiles)
Lưu thông tin chi tiết cho người dùng có vai trò là Shipper.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `vehicle_type` | VARCHAR(50) | | Loại xe (Xe máy, Xe điện...) |
| `license_plate`| VARCHAR(20) | | Biển số xe |
| `driver_license`| VARCHAR(50) | | Số bằng lái xe |
| `is_available` | BOOLEAN | DEFAULT TRUE | Trạng thái sẵn sàng nhận đơn |
| `created_at` | TIMESTAMP | | |

### 1.2 Địa chỉ (Addresses)
Lưu danh sách địa chỉ nhận hàng của khách hàng.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `label` | VARCHAR(50) | | "Nhà riêng", "KTX A"... |
| `recipient_name`| VARCHAR(100) | NOT NULL | |
| `recipient_phone`| VARCHAR(15) | NOT NULL | |
| `street_address`| TEXT | NOT NULL | |
| `city` | VARCHAR(50) | DEFAULT 'TP.HCM' | |
| `is_default` | BOOLEAN | DEFAULT FALSE | |

### 1.3 Xác thực OTP (OTP_Verifications)
Lưu mã xác thực gửi qua Email để đăng ký hoặc đổi mật khẩu.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `email` | VARCHAR(150) | NOT NULL | Email nhận mã |
| `otp_code` | VARCHAR(10) | NOT NULL | |
| `otp_type` | ENUM | NOT NULL | register, reset_password... |
| `expired_at` | DATETIME | NOT NULL | |
| `is_verified` | BOOLEAN | DEFAULT FALSE | |
| `created_at` | TIMESTAMP | | |

### 1.4 Danh mục (Categories)
Quản lý cây danh mục sản phẩm (Đồng phục, Giáo trình...).

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `name` | VARCHAR(100) | NOT NULL | |
| `slug` | VARCHAR(120) | UNIQUE | Dùng cho URL |
| `parent_id` | BIGINT | FK (Categories.id) | Tạo danh mục cha-con |
| `description` | TEXT | | |

---

## 2. Thực thể Sản phẩm (Product Entities)

### 2.1 Cửa hàng (Shop)
Vì hệ thống chỉ có 1 shop duy nhất, bảng này lưu thông tin định danh và cấu hình của Shop.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `name` | VARCHAR(200) | NOT NULL | Tên cửa hàng |
| `address` | TEXT | | Địa chỉ shop |
| `phone` | VARCHAR(15) | | |
| `logo_url` | VARCHAR(255) | | |
| `description` | TEXT | | |

### 2.2 Sản phẩm (Products)
Thông tin chính của hàng hóa.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `shop_id` | BIGINT | FK (Shop.id) | Luôn trỏ về shop duy nhất |
| `category_id` | BIGINT | FK (Categories.id) | |
| `name` | VARCHAR(200) | NOT NULL | |
| `slug` | VARCHAR(220) | UNIQUE | |
| `description` | TEXT | | |
| `base_price` | DECIMAL(12,2) | NOT NULL | |
| `sku` | VARCHAR(50) | UNIQUE | |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `average_rating`| DECIMAL(3,2) | DEFAULT 0 | |

### 2.2 Biến thể sản phẩm (Product Variants)
Dành cho sản phẩm có Size/Màu sắc khác nhau.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `product_id` | BIGINT | FK (Products.id) | |
| `variant_name` | VARCHAR(50) | | "Size", "Màu"... |
| `variant_value` | VARCHAR(50) | | "XL", "Xanh"... |
| `additional_price`| DECIMAL(12,2) | DEFAULT 0 | Giá cộng thêm |
| `stock_quantity`| INT | DEFAULT 0 | Kho theo biến thể |
| `sku` | VARCHAR(50) | UNIQUE | |

### 2.3 Đa phương tiện sản phẩm (Product_Media)
Lưu ảnh/video cho sản phẩm.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `product_id` | BIGINT | FK (Products.id) | |
| `media_type` | ENUM | NOT NULL | image, video |
| `media_url` | VARCHAR(255) | NOT NULL | |
| `sort_order` | INT | DEFAULT 0 | Thứ tự hiển thị |

---

## 3. Thực thể Kinh doanh (Business Entities)

### 3.1 Chiến dịch Khuyến mãi (Campaigns)
Quản lý các chương trình khuyến mãi theo thời điểm.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `name` | VARCHAR(200) | NOT NULL | |
| `slug` | VARCHAR(220) | UNIQUE | |
| `description` | TEXT | | |
| `banner_url` | VARCHAR(255) | | |
| `view_count` | INT | DEFAULT 0 | |
| `start_at` | DATETIME | NOT NULL | |
| `end_at` | DATETIME | NOT NULL | |
| `status` | TINYINT/ENUM | | Trạng thái hoạt động |
| `type` | VARCHAR(50) | | Loại chiến dịch |
| `value` | DECIMAL(12,2) | | Giá trị giảm giá |

### 3.2 Đối tượng chiến dịch (Campaign_Targets)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `campaign_id` | BIGINT | FK (Campaigns.id) | |
| `product_id` | BIGINT | FK (Products.id) | Nhắm mục tiêu sản phẩm |
| `target_type` | VARCHAR(50) | | 'faculty', 'student_year'... |
| `created_at` | TIMESTAMP | | |

### 3.3 Mã giảm giá (Coupons)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `campaign_id` | BIGINT | FK (Campaigns.id) | |
| `code` | VARCHAR(20) | UNIQUE | |
| `type` | VARCHAR(50) | NOT NULL | percent, fixed_amount |
| `value` | DECIMAL(12,2) | NOT NULL | |
| `max_discount` | DECIMAL(12,2) | | |
| `min_order_total`| DECIMAL(12,2) | | |
| `start_at` | DATETIME | | |
| `end_at` | DATETIME | | |
| `usage_limit` | INT | DEFAULT 1 | Mặc định mã dùng 1 lần |
| `used_count` | INT | DEFAULT 0 | |
| `status` | TINYINT/ENUM | | |
| `created_at` | TIMESTAMP | | |

### 3.3 Đơn hàng (Orders)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `order_code` | VARCHAR(50) | NOT NULL, UNIQUE | |
| `customer_id` | BIGINT | FK (Users.id) | |
| `shipper_id` | BIGINT | FK (Users.id) | Người được phân công |
| `assigned_at` | TIMESTAMP | | Thời điểm phân công Shipper |
| `coupon_id` | BIGINT | FK (Coupons.id) | |
| `status` | ENUM | NOT NULL | Trạng thái hiện tại |
| `total_base` | DECIMAL(12,2) | NOT NULL | |
| `shipping_fee` | DECIMAL(12,2) | | |
| `discount_total`| DECIMAL(12,2) | | |
| `total_final` | DECIMAL(12,2) | NOT NULL | |
| `payment_status`| ENUM | NOT NULL | Trạng thái tổng, tự set khi có lịch sử mới |
| `coin_spent` | INT | DEFAULT 0 | Số xu đã dùng cho đơn |
| `coin_earned` | INT | DEFAULT 0 | Số xu tích lũy từ đơn |

### 3.4 Lịch sử trạng thái đơn hàng (Order_Status_History)
Lưu vết các bước xử lý đơn hàng (Timeline).

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `order_id` | BIGINT | FK (Orders.id) | |
| `status` | ENUM | NOT NULL | Trạng thái cập nhật |
| `note` | TEXT | | Lý do hoặc ghi chú |
| `updated_by` | BIGINT | FK (Users.id) | Người cập nhật |
| `created_at` | TIMESTAMP | | |

### 3.5 Thông tin hủy đơn (Order_Cancellations)
Lưu chi tiết lý do và người thực hiện hủy đơn.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `order_id` | BIGINT | FK (Orders.id) | Duy nhất cho mỗi Order |
| `user_id` | BIGINT | FK (Users.id) | Người thực hiện hủy |
| `reason` | TEXT | NOT NULL | Lý do hủy |
| `cancelled_at` | TIMESTAMP | | |

### 3.6 Thanh toán (Payments)
Lưu lịch sử các lần thanh toán cho đơn hàng.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `order_id` | BIGINT | FK (Orders.id) | |
| `payment_method`| ENUM | NOT NULL | vnpay, momo, cod... |
| `transaction_id`| VARCHAR(100) | | Mã giao dịch từ cổng thanh toán |
| `amount` | DECIMAL(12,2) | NOT NULL | |
| `status` | ENUM | NOT NULL | success, failed, pending |
| `payment_date` | DATETIME | | |
| `response_data` | JSON/TEXT | | Lưu raw response từ cổng thanh toán |

### 3.3 Chi tiết đơn hàng (Order Items)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `order_id` | BIGINT | FK (Orders.id) | |
| `product_id` | BIGINT | FK (Products.id) | |
| `variant_id` | BIGINT | FK (Product_Variants.id)| |
| `quantity` | INT | NOT NULL | |
| `price_at_buy` | DECIMAL(12,2) | NOT NULL | Lưu giá tại thời điểm mua |

### 3.6 Giỏ hàng (Carts)
Quản lý giỏ hàng của người dùng.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | Duy nhất cho mỗi User |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

### 3.7 Chi tiết giỏ hàng (Cart_Items)
Lưu các sản phẩm cụ thể trong giỏ hàng; nếu sản phẩm/biến thể đã có thì tăng số lượng.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `cart_id` | BIGINT | FK (Carts.id) | |
| `product_id` | BIGINT | FK (Products.id) | UNIQUE với `variant_id` trong cùng `cart_id` |
| `variant_id` | BIGINT | FK (Product_Variants.id)| Có thể NULL |
| `quantity` | INT | NOT NULL | |
| `note` | TEXT | | Ghi chú cho sản phẩm |
| `created_at` | TIMESTAMP | | |

---

## 4. Thực thể Tương tác (Interaction Entities)

### 4.1 Đánh giá (Reviews)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `product_id` | BIGINT | FK (Products.id) | |
| `order_id` | BIGINT | FK (Orders.id) | |
| `rating` | INT | 1-5 | |
| `comment` | TEXT | | |

### 4.2 Đa phương tiện đánh giá (Review_Media)
Lưu danh sách ảnh và video cho mỗi đánh giá.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `review_id` | BIGINT | FK (Reviews.id) | |
| `media_type` | ENUM | NOT NULL | 'image', 'video' |
| `media_url` | VARCHAR(255) | NOT NULL | |

### 4.3 Thông báo (Notifications)
Lưu các thông báo gửi đến người dùng.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | Người nhận |
| `title` | VARCHAR(200) | NOT NULL | |
| `content` | TEXT | NOT NULL | |
| `type` | ENUM | | order, promotion, system |
| `is_read` | BOOLEAN | DEFAULT FALSE | |
| `link` | VARCHAR(255) | | Link điều hướng |
| `created_at` | TIMESTAMP | | |

### 4.4 Danh sách yêu thích (Wishlist)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `product_id` | BIGINT | FK (Products.id) | UNIQUE với `user_id` |
| `created_at` | TIMESTAMP | | |

### 4.5 Giao dịch Xu (Coin_Transactions)
Lưu lịch sử tích lũy, sử dụng và hoàn xu.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `order_id` | BIGINT | FK (Orders.id) | Có thể NULL |
| `amount` | INT | NOT NULL | Số xu (âm hoặc dương) |
| `type` | ENUM | NOT NULL | earn, spend, refund... |
| `description` | TEXT | | |
| `balance_before` | INT | NOT NULL | Số dư trước giao dịch |
| `balance_after` | INT | NOT NULL | Số dư sau giao dịch |
| `created_at` | TIMESTAMP | | |

---

## 5. Các mối quan hệ chính (Relationships)

- **1-n**: User → Addresses
- **1-n**: Category → Products
- **1-n**: Vendor (User) → Products
- **1-n**: Product → Product_Variants
- **1-n**: Customer (User) → Orders
- **1-n**: Order → Order_Items
- **1-n**: Product → Reviews

---

> [!NOTE]
> Bạn có thể góp ý trực tiếp vào các bảng trên. Ví dụ: cần thêm thuộc tính cho "Đồng phục" (như Niên khóa) hay các ràng buộc về thanh toán.
