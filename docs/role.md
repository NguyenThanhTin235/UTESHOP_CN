# Danh sách chức năng theo Role - UTEShop

Hệ thống UTEShop bao gồm 4 vai trò chính với các chức năng cụ thể như sau:

---

## 1. Admin (Quản trị viên)
*Vai trò tối cao, quản lý toàn bộ vận hành của hệ thống.*

- **Quản lý người dùng (`Users`):**
    - Xem danh sách, thay đổi trạng thái (`pending`, `active`, `locked`, `inactive`).
    - Quản lý cơ chế bảo mật: Phê duyệt mở khóa tài khoản thủ công (`lockout_until`) hoặc đặt lại số lần nhập sai (`failed_login_attempts`).
    - Thay đổi vai trò của người dùng (nâng cấp lên Shipper hoặc thay đổi Admin khác).
    - Quản lý thông tin định danh: `student_id`, `faculty` (Khoa/Phòng ban).
- **Quản lý Cửa hàng (`Shop`):**
    - Cấu hình thông tin duy nhất của Shop: Tên, địa chỉ, hotline, logo và mô tả.
- **Quản lý Sản phẩm & Danh mục:**
    - Duyệt sản phẩm mới từ Vendor.
    - Quản lý cây danh mục (`Categories`): Thêm/sửa/xóa, quản lý cấp cha-con (`parent_id`).
    - Quản lý toàn bộ `Products` và `Product Variants` (Size, Màu sắc, giá cộng thêm).
- **Quản lý đơn hàng (`Orders`):**
    - Xem toàn bộ danh sách đơn hàng và lịch sử trạng thái (`Order_Status_History`).
    - **Điều phối vận chuyển:** Phân công Shipper (`shipper_id`) và ghi nhận thời điểm phân công (`assigned_at`).
    - Xử lý khiếu nại, can thiệp hủy đơn (`Order_Cancellations`) và ghi chú lý do.
- **Quản lý khuyến mãi & Marketing:**
    - Thiết lập **Chiến dịch (`Campaigns`)**: Banner, thời gian hiệu lực (`start_at`, `end_at`), loại chiến dịch.
    - Phân loại đối tượng mục tiêu (`Campaign_Targets`): Nhắm mục tiêu theo sản phẩm, khoa (`faculty`), hoặc năm sinh viên.
    - Quản lý mã giảm giá (`Coupons`): Thiết lập mức giảm (`percent`, `fixed_amount`), giới hạn sử dụng (`usage_limit`), và giá trị đơn hàng tối thiểu.
- **Quản lý Tài chính & Xu:**
    - Theo dõi lịch sử thanh toán (`Payments`): Phương thức (`vnpay`, `momo`, `cod`), mã giao dịch và trạng thái.
    - Điều chỉnh và kiểm soát luồng Xu (`Coin_Transactions`): Tặng xu, thu hồi hoặc điều chỉnh số dư.
- **Báo cáo & Thống kê:**
    - Thống kê doanh thu, số lượng đơn hàng, hiệu quả chiến dịch.
    - Thống kê tồn kho theo từng biến thể sản phẩm (tồn kho chỉ quản lý ở biến thể).

---

## 2. Vendor (Người bán kiêm Nhà cung cấp)
*Người quản lý trực tiếp hàng hóa, kho bãi và xử lý đơn hàng phía bán.*

- **Quản lý thông tin Shop:** Cập nhật thông tin định danh của cửa hàng trên hệ thống.
- **Quản lý sản phẩm & Kho:**
    - Thêm sản phẩm (`Products`), thiết lập SKU và mô tả chuẩn SEO.
    - Quản lý chi tiết biến thể (`Product Variants`): Gán giá cộng thêm (`additional_price`) và số lượng tồn kho riêng cho từng Size/Màu sắc (tồn kho chỉ theo biến thể).
    - Theo dõi đánh giá trung bình (`average_rating`) để cải thiện chất lượng.
- **Xử lý đơn hàng:**
    - Tiếp nhận đơn hàng, cập nhật trạng thái qua từng giai đoạn (`confirmed`, `processing`).
    - Ghi chú thông tin xử lý vào **Lịch sử trạng thái đơn hàng**.
    - **Chỉ định Shipper:** Chọn Shipper phù hợp để bàn giao đơn hàng.
    - Theo dõi lý do khách hàng hủy đơn để tối ưu quy trình.
- **Khuyến mãi:**
    - Tham gia các chiến dịch chung của Admin hoặc tạo Coupon riêng cho sản phẩm của mình.
- **Báo cáo bán hàng:**
    - Theo dõi doanh thu thực tế, số lượng Xu đã tích lũy/khấu trừ cho khách hàng.

---

## 3. Customer (Người mua hàng)
*Sinh viên, giảng viên hoặc cán bộ trường UTE sử dụng hệ thống để mua sắm.*

- **Tài khoản & Hồ sơ (`Users`, `Addresses`):**
    - Đăng ký, đăng nhập và xác thực OTP qua Email (`register`, `reset_password`).
    - Quản lý nhiều địa chỉ nhận hàng (`Addresses`), thiết lập địa chỉ mặc định.
    - Theo dõi số dư Xu (`coin_balance`) hiện có.
- **Trải nghiệm mua sắm:**
    - Duyệt sản phẩm theo danh mục, tìm kiếm và lọc theo nhu cầu.
    - Quản lý **Danh sách yêu thích (`Wishlist`)**.
    - Sử dụng **Giỏ hàng (`Carts`, `Cart_Items`)**: Thêm sản phẩm, chọn biến thể, để lại ghi chú (`note`) cho từng món.
- **Đặt hàng & Thanh toán:**
    - Đặt hàng, áp dụng Coupon, chọn phương thức thanh toán (`Payments`).
    - Sử dụng Xu để giảm trừ trực tiếp vào giá trị đơn hàng; hệ thống ghi nhận số xu đã dùng và xu tích lũy theo từng đơn.
- **Quản lý đơn hàng & Tương tác:**
    - Theo dõi lộ trình đơn hàng qua **Timeline** (`Order_Status_History`).
    - Nhận thông báo (`Notifications`) về trạng thái đơn hàng, khuyến mãi mới.
    - Hủy đơn hàng: Gửi yêu cầu hủy kèm lý do (`Order_Cancellations`), nhận hoàn xu tự động (`Coin_Transactions`).
    - **Đánh giá sản phẩm (`Reviews`):** Gửi đánh giá sao, bình luận và đính kèm đa phương tiện (`Review_Media` - Ảnh/Video).

---

## 4. Shipper (Nhân viên giao hàng)
*Chịu trách nhiệm vận chuyển và cập nhật trạng thái đơn hàng tại hiện trường.*

- **Hồ sơ Shipper (`Shipper_Profiles`):**
    - Cập nhật thông tin phương tiện: Loại xe, biển số, bằng lái.
    - Bật/tắt trạng thái sẵn sàng nhận đơn (`is_available`).
- **Nghiệp vụ giao vận:**
    - Tiếp nhận đơn hàng được phân công.
    - Xem thông tin chi tiết người nhận: Tên, SĐT, địa chỉ (từ bảng `Addresses`).
    - Cập nhật trạng thái giao hàng: Đang giao (`shipping`), Giao thành công (`delivered`) hoặc Thất bại (kèm ghi chú chi tiết vào Timeline).

## 5. Tính năng chung (General Features)
*Các tính năng cơ bản áp dụng cho mọi loại tài khoản trên hệ thống.*

- **Xác thực & Bảo mật:**
    - Đăng ký tài khoản (mặc định là Customer).
    - Đăng nhập / Đăng xuất.
    - Đổi mật khẩu.
    - Quên mật khẩu (Khôi phục qua Email).
- **Quản lý thông tin cá nhân:**
    - Cập nhật thông tin hồ sơ (Họ tên, Số điện thoại, Ảnh đại diện).
    - Xem lịch sử hoạt động cơ bản.
- **Hệ thống thông báo (Notifications):**
    - Nhận thông báo qua Email khi có thay đổi quan trọng (Đặt hàng thành công, Trạng thái đơn hàng cập nhật).
    - Thông báo tức thời trong ứng dụng (In-app notifications) cho các sự kiện: Hoàn xu, Chiến dịch mới, Nhắc nhở giỏ hàng.
    - Phân loại thông báo: `order`, `promotion`, `system`.
- **Trải nghiệm người dùng:**
    - Tìm kiếm sản phẩm (Full-text search).
    - Lọc sản phẩm theo tiêu chí (Danh mục, Giá).
    - Chế độ hiển thị (Sáng/Tối - Dark mode).
    - Đa ngôn ngữ (Tiếng Việt / Tiếng Anh).
- **Hỗ trợ & Liên hệ:**
    - Xem thông tin giới thiệu về UTEShop.
    - Gửi yêu cầu hỗ trợ hoặc báo lỗi hệ thống.

---

*Tài liệu này được trích xuất từ file yêu cầu chính thức của dự án UTEShop.*
