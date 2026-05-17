# Kế hoạch Thiết kế Cơ sở Dữ liệu UTEShop

Tài liệu này trình bày bản thảo thiết kế các thực thể (Entities) và thuộc tính (Attributes) cho hệ thống thương mại điện tử UTEShop theo mô hình sàn đa Seller. Thiết kế tuân thủ chuẩn hóa (3NF) và tập trung vào khả năng mở rộng.

---

## 1. Thực thể Hệ thống (Core Entities)

### 1.1 Người dùng (Users)
Quản lý tài khoản cho tất cả vai trò (Admin, Manager, Seller, Customer).

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, Auto Increment | |
| `full_name` | VARCHAR(100) | NOT NULL | |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | Dùng để đăng nhập |
| `password` | VARCHAR(255) | NOT NULL | Lưu hash bcrypt |
| `phone` | VARCHAR(15) | | |
| `avatar_url` | VARCHAR(255) | | |
| `status` | ENUM | DEFAULT 'pending' | pending, active, locked, inactive |
| `failed_login_attempts` | INT | DEFAULT 0 | Số lần nhập sai mật khẩu |
| `lockout_until` | DATETIME | | Thời gian bị khóa đến |
| `email_verified_at` | DATETIME | | Thời điểm xác thực email |
| `coin_balance` | INT | DEFAULT 0 | Số dư xu hiện tại |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

### 1.1b Phân quyền (RBAC - Role Based Access Control)
Thay thế trường Role ENUM bằng hệ thống bảng linh hoạt.

**Bảng: Roles**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `name` | VARCHAR(50) | UNIQUE | ADMIN, MANAGER, SELLER, CUSTOMER |
| `description` | VARCHAR(255) | | |

**Bảng: Permissions**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `name` | VARCHAR(100) | UNIQUE | e.g., "PRODUCT_APPROVE", "FINANCE_MANAGE" |
| `module` | VARCHAR(50) | | |

**Bảng: Role_Permissions**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `role_id` | BIGINT | FK (Roles.id) | |
| `permission_id` | BIGINT | FK (Permissions.id) | |

**Bảng: User_Roles**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `user_id` | BIGINT | FK (Users.id) | |
| `role_id` | BIGINT | FK (Roles.id) | |

### 1.2 Hồ sơ Seller (Seller_Profiles)
Lưu thông tin bắt buộc của Seller để đối soát và duyệt.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `gst_number` | VARCHAR(50) | | Mã số thuế |
| `bank_name` | VARCHAR(100) | | |
| `bank_account_name` | VARCHAR(100) | | |
| `bank_account_number` | VARCHAR(30) | | |
| `pickup_address` | TEXT | | Địa chỉ lấy hàng |
| `status` | ENUM | DEFAULT 'pending' | pending, active, rejected, suspended |
| `rejection_reason` | TEXT | | |
| `approved_by` | BIGINT | FK (Users.id) | Admin/Manager |
| `approved_at` | DATETIME | | |
| `created_at` | TIMESTAMP | | |

### 1.3 Cửa hàng (Shops)
Mỗi Seller sở hữu một hoặc nhiều shop.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `owner_user_id` | BIGINT | FK (Users.id) | Seller sở hữu |
| `name` | VARCHAR(200) | NOT NULL | |
| `slug` | VARCHAR(220) | UNIQUE | |
| `address` | TEXT | | |
| `phone` | VARCHAR(15) | | |
| `logo_url` | VARCHAR(255) | | |
| `banner_url` | VARCHAR(255) | | |
| `description` | TEXT | | |
| `status` | ENUM | DEFAULT 'active' | active, inactive, suspended |
| `created_at` | TIMESTAMP | | |

### 1.4 Địa chỉ (Addresses)
Lưu danh sách địa chỉ nhận hàng của khách hàng.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `label` | VARCHAR(50) | | "Nhà riêng", "Cơ quan"... |
| `recipient_name` | VARCHAR(100) | NOT NULL | |
| `recipient_phone` | VARCHAR(15) | NOT NULL | |
| `street_address` | TEXT | NOT NULL | |
| `city` | VARCHAR(50) | | |
| `is_default` | BOOLEAN | DEFAULT FALSE | |

### 1.5 Xác thực OTP (OTP_Verifications)
Lưu mã xác thực gửi qua Email để đăng ký/đăng nhập/quên mật khẩu.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `email` | VARCHAR(150) | NOT NULL | Email nhận mã |
| `otp_code` | VARCHAR(10) | NOT NULL | |
| `otp_type` | ENUM | NOT NULL | register, login, reset_password |
| `expired_at` | DATETIME | NOT NULL | |
| `is_verified` | BOOLEAN | DEFAULT FALSE | |
| `created_at` | TIMESTAMP | | |

### 1.6 Danh mục (Categories)
Quản lý cây danh mục sản phẩm theo 3 cấp.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `name` | VARCHAR(100) | NOT NULL | |
| `slug` | VARCHAR(120) | UNIQUE | Dùng cho URL |
| `parent_id` | BIGINT | FK (Categories.id) | Tạo danh mục cha-con |
| `description` | TEXT | | |

---

## 2. Thực thể Sản phẩm (Product Entities)

### 2.1 Sản phẩm (Products)
Thông tin chính của hàng hóa.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `shop_id` | BIGINT | FK (Shops.id) | |
| `category_id` | BIGINT | FK (Categories.id) | |
| `name` | VARCHAR(200) | NOT NULL | |
| `slug` | VARCHAR(220) | UNIQUE | |
| `description` | TEXT | | |
| `mrp_price` | DECIMAL(12,2) | NOT NULL | Giá gốc |
| `selling_price` | DECIMAL(12,2) | NOT NULL | Giá bán |
| `sku` | VARCHAR(50) | UNIQUE | |
| `approval_status` | ENUM | DEFAULT 'pending' | pending, approved, rejected |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `average_rating` | DECIMAL(3,2) | DEFAULT 0 | |
| `created_at` | TIMESTAMP | | |

### 2.2 Lịch sử duyệt sản phẩm (Product_Approvals)
Lưu lịch sử duyệt theo Manager.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `product_id` | BIGINT | FK (Products.id) | |
| `approver_id` | BIGINT | FK (Users.id) | Manager |
| `action` | ENUM | NOT NULL | approved, rejected |
| `reason` | TEXT | | |
| `created_at` | TIMESTAMP | | |

### 2.3 Biến thể sản phẩm (Product_Variants)
Dành cho sản phẩm có Size/Màu sắc khác nhau.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `product_id` | BIGINT | FK (Products.id) | |
| `attributes` | JSON | NOT NULL | Lưu {"color": "Red", "size": "XL"} |
| `additional_price` | DECIMAL(12,2) | DEFAULT 0 | Giá cộng thêm |
| `stock_quantity` | INT | DEFAULT 0 | Kho theo biến thể |
| `sku` | VARCHAR(50) | UNIQUE | |

### 2.4 Đa phương tiện sản phẩm (Product_Media)
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
| `min_order_total` | DECIMAL(12,2) | | |
| `start_at` | DATETIME | | |
| `end_at` | DATETIME | | |
| `usage_limit` | INT | DEFAULT 1 | Mặc định mã dùng 1 lần |
| `used_count` | INT | DEFAULT 0 | |
| `status` | TINYINT/ENUM | | |
| `created_at` | TIMESTAMP | | |

### 3.3b Lịch sử sử dụng mã (Coupon_Redemptions)
Lưu lịch sử mỗi lần người dùng áp dụng coupon.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `coupon_id` | BIGINT | FK (Coupons.id) | |
| `user_id` | BIGINT | FK (Users.id) | |
| `order_id` | BIGINT | FK (Orders.id) | |
| `used_at` | DATETIME | | UNIQUE (coupon_id, user_id) |

### 3.4 Đơn thanh toán tổng (Payment_Orders)
Đại diện cho 1 lần thanh toán gộp, có thể bao gồm nhiều đơn con theo Seller.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `payment_code` | VARCHAR(50) | NOT NULL, UNIQUE | |
| `customer_id` | BIGINT | FK (Users.id) | |
| `coupon_id` | BIGINT | FK (Coupons.id) | |
| `coin_spent_total` | INT | DEFAULT 0 | Tổng xu dùng |
| `subtotal_amount` | DECIMAL(12,2) | NOT NULL | Tổng trước giảm |
| `discount_amount` | DECIMAL(12,2) | DEFAULT 0 | Tổng giảm |
| `shipping_amount` | DECIMAL(12,2) | DEFAULT 0 | Tổng phí vận chuyển |
| `final_amount` | DECIMAL(12,2) | NOT NULL | Tổng thanh toán |
| `payment_method` | ENUM | | vnpay, momo, cod |
| `payment_status` | ENUM | NOT NULL | pending, success, failed |
| `transaction_id` | VARCHAR(100) | | Mã giao dịch từ cổng |
| `created_at` | TIMESTAMP | | |

### 3.5 Đơn hàng (Orders)
Mỗi Order thuộc một Seller (Shop) và gắn với Payment_Order.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `order_code` | VARCHAR(50) | NOT NULL, UNIQUE | |
| `payment_order_id` | BIGINT | FK (Payment_Orders.id) | |
| `customer_id` | BIGINT | FK (Users.id) | |
| `shop_id` | BIGINT | FK (Shops.id) | |
| `status` | ENUM | NOT NULL | pending, confirmed, shipped, delivered, canceled, disputed, refunded |
| `subtotal_amount` | DECIMAL(12,2) | NOT NULL | |
| `shipping_fee` | DECIMAL(12,2) | DEFAULT 0 | |
| `coupon_discount` | DECIMAL(12,2) | DEFAULT 0 | Phân bổ từ PaymentOrder |
| `coin_discount` | DECIMAL(12,2) | DEFAULT 0 | Phân bổ từ PaymentOrder |
| `platform_fee_rate` | DECIMAL(5,2) | | Lưu % phí sàn lúc đặt hàng |
| `platform_fee_amount` | DECIMAL(12,2) | | Giá trị phí sàn thu của seller |
| `total_final` | DECIMAL(12,2) | NOT NULL | |
| `payment_status` | ENUM | NOT NULL | pending, success, failed |
| `coin_earned` | INT | DEFAULT 0 | |
| `created_at` | TIMESTAMP | | |

### 3.6 Lịch sử trạng thái đơn hàng (Order_Status_History)
Lưu vết các bước xử lý đơn hàng (Timeline).

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `order_id` | BIGINT | FK (Orders.id) | |
| `status` | ENUM | NOT NULL | Trạng thái cập nhật |
| `note` | TEXT | | Lý do hoặc ghi chú |
| `updated_by` | BIGINT | FK (Users.id) | Người cập nhật |
| `created_at` | TIMESTAMP | | |

### 3.7 Thông tin hủy đơn (Order_Cancellations)
Lưu chi tiết lý do và người thực hiện hủy đơn.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `order_id` | BIGINT | FK (Orders.id) | Duy nhất cho mỗi Order |
| `user_id` | BIGINT | FK (Users.id) | Người thực hiện hủy |
| `reason` | TEXT | NOT NULL | |
| `cancelled_at` | TIMESTAMP | | |

### 3.8 Chi tiết đơn hàng (Order_Items)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `order_id` | BIGINT | FK (Orders.id) | |
| `product_id` | BIGINT | FK (Products.id) | |
| `variant_id` | BIGINT | FK (Product_Variants.id) | |
| `quantity` | INT | NOT NULL | |
| `price_at_buy` | DECIMAL(12,2) | NOT NULL | Lưu giá tại thời điểm mua |

### 3.9 Thanh toán (Payments)
Lưu lịch sử thanh toán gắn với Payment_Order.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `payment_order_id` | BIGINT | FK (Payment_Orders.id) | |
| `payment_method` | ENUM | NOT NULL | vnpay, momo, cod |
| `transaction_id` | VARCHAR(100) | | Mã giao dịch từ cổng |
| `amount` | DECIMAL(12,2) | NOT NULL | |
| `status` | ENUM | NOT NULL | success, failed, pending |
| `payment_date` | DATETIME | | |
| `response_data` | JSON/TEXT | | Lưu raw response |

### 3.10 Giỏ hàng (Carts)
Quản lý giỏ hàng duy nhất cho mỗi người dùng.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | Duy nhất cho mỗi User |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

### 3.11 Chi tiết giỏ hàng (Cart_Items)
Lưu các sản phẩm trong giỏ hàng.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `cart_id` | BIGINT | FK (Carts.id) | |
| `product_id` | BIGINT | FK (Products.id) | UNIQUE với `variant_id` trong cùng `cart_id` |
| `variant_id` | BIGINT | FK (Product_Variants.id) | Có thể NULL |
| `quantity` | INT | NOT NULL | |
| `note` | TEXT | | |
| `created_at` | TIMESTAMP | | |

### 3.12 Ví Seller (Seller_Wallets)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `shop_id` | BIGINT | FK (Shops.id) | |
| `total_balance` | DECIMAL(12,2) | DEFAULT 0 | Tổng tiền đang có |
| `pending_balance` | DECIMAL(12,2) | DEFAULT 0 | Tiền chờ đối soát (7 ngày) |
| `available_balance` | DECIMAL(12,2) | DEFAULT 0 | Tiền thực tế có thể rút |
| `updated_at` | TIMESTAMP | | |

### 3.13 Giao dịch ví Seller (Seller_Wallet_Transactions)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `shop_id` | BIGINT | FK (Shops.id) | |
| `order_id` | BIGINT | FK (Orders.id) | Có thể NULL |
| `type` | ENUM | NOT NULL | earning, fee, refund, adjust |
| `amount` | DECIMAL(12,2) | NOT NULL | |
| `balance_before` | DECIMAL(12,2) | NOT NULL | |
| `balance_after` | DECIMAL(12,2) | NOT NULL | |
| `created_at` | TIMESTAMP | | |

### 3.14 Yêu cầu rút tiền (Withdraw_Requests)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `shop_id` | BIGINT | FK (Shops.id) | |
| `amount` | DECIMAL(12,2) | NOT NULL | |
| `status` | ENUM | NOT NULL | pending, approved, rejected, paid |
| `approved_by` | BIGINT | FK (Users.id) | Admin |
| `approved_at` | DATETIME | | |
| `note` | TEXT | | |
| `created_at` | TIMESTAMP | | |

### 3.15 Cấu hình phí sàn (Platform_Fee_Settings)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `fee_percent` | DECIMAL(5,2) | NOT NULL | |
| `effective_from` | DATETIME | NOT NULL | |
| `effective_to` | DATETIME | | |
| `created_by` | BIGINT | FK (Users.id) | |
| `created_at` | TIMESTAMP | | |

### 3.16 Cấu hình Xu (Coin_Settings) (Tuy chon)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `earn_rate` | DECIMAL(10,4) | NOT NULL | VD: 0.01 |
| `spend_rate` | DECIMAL(10,4) | NOT NULL | VD: 1 Xu = 1d |
| `max_usage_percent` | DECIMAL(5,2) | NOT NULL | VD: 50 |
| `effective_from` | DATETIME | NOT NULL | |
| `effective_to` | DATETIME | | |
| `created_by` | BIGINT | FK (Users.id) | |

---

## 4. Vận chuyển, đổi trả, tranh chấp

### 4.1 Đơn vị vận chuyển (Shipping_Partners)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `name` | VARCHAR(100) | NOT NULL | GHTK, Grab |
| `code` | VARCHAR(50) | UNIQUE | |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `created_at` | TIMESTAMP | | |

### 4.2 Lô vận chuyển (Shipments)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `order_id` | BIGINT | FK (Orders.id) | |
| `shipping_partner_id` | BIGINT | FK (Shipping_Partners.id) | |
| `tracking_code` | VARCHAR(100) | | |
| `status` | ENUM | NOT NULL | created, picked, in_transit, delivered, failed |
| `label_url` | VARCHAR(255) | | Link PDF vận đơn |
| `created_at` | TIMESTAMP | | |

### 4.3 Nhật ký vận chuyển (Shipment_Events)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `shipment_id` | BIGINT | FK (Shipments.id) | |
| `status` | VARCHAR(50) | | |
| `location` | VARCHAR(150) | | |
| `event_time` | DATETIME | | |
| `raw_payload` | JSON/TEXT | | Webhook raw |

### 4.4 Yêu cầu trả hàng (Return_Requests)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `order_item_id` | BIGINT | FK (Order_Items.id) | |
| `customer_id` | BIGINT | FK (Users.id) | |
| `status` | ENUM | NOT NULL | requested, accepted, rejected, received, refunded |
| `reason` | TEXT | | |
| `created_at` | TIMESTAMP | | |

### 4.5 Minh chứng trả hàng (Return_Evidence_Media)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `return_request_id` | BIGINT | FK (Return_Requests.id) | |
| `media_type` | ENUM | NOT NULL | image, video |
| `media_url` | VARCHAR(255) | NOT NULL | |

### 4.6 Tranh chấp (Disputes)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `return_request_id` | BIGINT | FK (Return_Requests.id) | |
| `status` | ENUM | NOT NULL | open, resolved, rejected |
| `resolved_by` | BIGINT | FK (Users.id) | Admin |
| `resolution_note` | TEXT | | |
| `created_at` | TIMESTAMP | | |

### 4.7 Hoàn tiền (Refunds)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `order_id` | BIGINT | FK (Orders.id) | |
| `return_request_id` | BIGINT | FK (Return_Requests.id) | |
| `refund_cash_amount` | DECIMAL(12,2) | DEFAULT 0 | Số tiền hoàn về bank/gate |
| `refund_coin_amount` | INT | DEFAULT 0 | Số xu hoàn về ví xu |
| `total_refund_amount` | DECIMAL(12,2) | NOT NULL | |
| `status` | ENUM | NOT NULL | pending, success, failed |
| `created_at` | TIMESTAMP | | |

### 4.8 Giao dịch hoàn tiền (Refund_Transactions)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `refund_id` | BIGINT | FK (Refunds.id) | |
| `payment_gateway` | VARCHAR(50) | | |
| `transaction_id` | VARCHAR(100) | | |
| `response_data` | JSON/TEXT | | |
| `created_at` | TIMESTAMP | | |

---

## 5. Thực thể Tương tác (Interaction Entities)

### 5.1 Đánh giá sản phẩm (Product_Reviews)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `product_id` | BIGINT | FK (Products.id) | |
| `order_item_id` | BIGINT | FK (Order_Items.id) | UNIQUE với user_id |
| `rating` | INT | 1-5 | |
| `comment` | TEXT | | |
| `created_at` | TIMESTAMP | | |

### 5.2 Ảnh/video đánh giá sản phẩm (Product_Review_Media)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `product_review_id` | BIGINT | FK (Product_Reviews.id) | |
| `media_type` | ENUM | NOT NULL | image, video |
| `media_url` | VARCHAR(255) | NOT NULL | |

### 5.3 Đánh giá shop (Shop_Reviews)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `order_id` | BIGINT | FK (Orders.id) | UNIQUE với user_id |
| `shop_id` | BIGINT | FK (Shops.id) | |
| `rating` | INT | 1-5 | |
| `comment` | TEXT | | |

### 5.4 Đánh giá vận chuyển (Shipping_Reviews)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `order_id` | BIGINT | FK (Orders.id) | UNIQUE với user_id |
| `shipping_partner_id` | BIGINT | FK (Shipping_Partners.id) | |
| `rating` | INT | 1-5 | |
| `comment` | TEXT | | |

### 5.5 Thông báo (Notifications)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `title` | VARCHAR(200) | NOT NULL | |
| `content` | TEXT | NOT NULL | |
| `type` | ENUM | | order, promotion, system |
| `is_read` | BOOLEAN | DEFAULT FALSE | |
| `link` | VARCHAR(255) | | |
| `created_at` | TIMESTAMP | | |

### 5.6 Danh sách yêu thích (Wishlist)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `product_id` | BIGINT | FK (Products.id) | UNIQUE với `user_id` |
| `created_at` | TIMESTAMP | | |

### 5.7 Giao dịch Xu (Coin_Transactions)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | |
| `order_id` | BIGINT | FK (Orders.id) | Có thể NULL |
| `amount` | INT | NOT NULL | Số xu (âm hoặc dương) |
| `type` | ENUM | NOT NULL | earn, spend, refund |
| `description` | TEXT | | |
| `balance_before` | INT | NOT NULL | |
| `balance_after` | INT | NOT NULL | |
| `created_at` | TIMESTAMP | | |

---

## 6. Chat & Chatbot

### 6.1 Hội thoại (Conversations)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `customer_id` | BIGINT | FK (Users.id) | |
| `shop_id` | BIGINT | FK (Shops.id) | |
| `order_id` | BIGINT | FK (Orders.id) | Có thể NULL |
| `created_at` | TIMESTAMP | | |

### 6.2 Tin nhắn (Messages)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `conversation_id` | BIGINT | FK (Conversations.id) | |
| `sender_id` | BIGINT | FK (Users.id) | |
| `message_type` | ENUM | | text, image, file |
| `content` | TEXT | | |
| `created_at` | TIMESTAMP | | |

### 6.3 Chatbot sessions (Chatbot_Sessions)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `user_id` | BIGINT | FK (Users.id) | Có thể NULL cho Guest |
| `session_token` | VARCHAR(100) | UNIQUE | |
| `created_at` | TIMESTAMP | | |

### 6.4 Chatbot messages (Chatbot_Messages)
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `session_id` | BIGINT | FK (Chatbot_Sessions.id) | |
| `sender` | ENUM | | user, bot |
| `content` | TEXT | | |
| `created_at` | TIMESTAMP | | |

---

## 7. CMS Trang chủ & Trang tĩnh

### 7.1 Banners
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `title` | VARCHAR(200) | | |
| `image_url` | VARCHAR(255) | NOT NULL | |
| `link` | VARCHAR(255) | | |
| `sort_order` | INT | DEFAULT 0 | |
| `is_active` | BOOLEAN | DEFAULT TRUE | |

### 7.2 Homepage_Sections
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `title` | VARCHAR(200) | | |
| `type` | VARCHAR(50) | | category_grid, deals, featured |
| `sort_order` | INT | DEFAULT 0 | |
| `is_active` | BOOLEAN | DEFAULT TRUE | |

### 7.3 Featured_Categories
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `section_id` | BIGINT | FK (Homepage_Sections.id) | |
| `category_id` | BIGINT | FK (Categories.id) | |
| `sort_order` | INT | DEFAULT 0 | |

### 7.4 Posts
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `title` | VARCHAR(200) | NOT NULL | |
| `slug` | VARCHAR(220) | UNIQUE | |
| `content` | TEXT | | |
| `author_id` | BIGINT | FK (Users.id) | |
| `status` | ENUM | | draft, published |
| `created_at` | TIMESTAMP | | |

### 7.5 Static_Pages
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `title` | VARCHAR(200) | NOT NULL | |
| `slug` | VARCHAR(220) | UNIQUE | |
| `content` | TEXT | | |
| `page_type` | VARCHAR(50) | | faq, policy, terms |
| `updated_at` | TIMESTAMP | | |

---

## 8. Audit Logs

### 8.1 Audit_Logs
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | |
| `actor_id` | BIGINT | FK (Users.id) | |
| `action` | VARCHAR(100) | NOT NULL | |
| `entity_type` | VARCHAR(50) | NOT NULL | |
| `entity_id` | BIGINT | | |
| `metadata` | JSON/TEXT | | |
| `created_at` | TIMESTAMP | | |

---

## 9. Các mối quan hệ chính (Relationships)

- **RBAC**: Users ↔ User_Roles ↔ Roles ↔ Role_Permissions ↔ Permissions
- **1-n**: Users → Addresses
- **1-n**: Users → Seller_Profiles
- **1-n**: Users → Shops (owner_user_id)
- **1-n**: Categories → Products
- **1-n**: Shops → Products
- **1-n**: Products → Product_Variants (Lưu attributes dạng JSON)
- **1-n**: Products → Product_Media
- **1-n**: Customer (Users) → Payment_Orders
- **1-n**: Payment_Orders → Orders (Tách đơn theo Seller, phân bổ Discount)
- **1-n**: Orders → Order_Items
- **1-n**: Orders → Shipments
- **1-n**: Orders → Return_Requests
- **1-n**: Orders → Product_Reviews/Shop_Reviews/Shipping_Reviews (Liên kết qua order_id)

---

> [!NOTE]
> Bạn có thể góp ý trực tiếp vào các bảng trên. Nếu cần, mình sẽ bổ sung các ràng buộc chi tiết (unique/index) theo từng use case.
