# Tài liệu Yêu cầu Nghiệp vụ (Business Requirements Document - BRD)
## Dự án: Hệ thống Thương mại Điện tử Nội bộ UTEShop

| Thông tin | Chi tiết |
| :--- | :--- |
| **Phiên bản** | 1.0 |
| **Trạng thái** | Hoàn thiện |
| **Ngày tạo** | 06/05/2026 |
| **Người soạn thảo** | Antigravity (Senior Business Analyst) |

---

## 1. Giới thiệu dự án
### 1.1 Mục tiêu
Xây dựng một nền tảng thương mại điện tử nội bộ dành riêng cho cộng đồng trường Đại học Sư phạm Kỹ thuật (UTE), hỗ trợ việc mua bán giáo trình, đồng phục, dụng cụ học tập và các dịch vụ tiện ích khác một cách an toàn, nhanh chóng và minh bạch.

### 1.2 Phạm vi
Hệ thống bao gồm ứng dụng web/mobile cho khách hàng, bảng điều khiển cho người bán (Vendor), hệ thống quản trị (Admin) và công cụ tác nghiệp cho nhân viên giao hàng (Shipper).

---

## 2. Các đối tượng liên quan (Stakeholders)
1. **Ban quản lý UTEShop (Admin):** Kiểm soát toàn bộ hệ thống.
2. **Đối tác cung cấp (Vendor):** Các đơn vị, cá nhân kinh doanh trong trường.
3. **Sinh viên/Giảng viên (Customer):** Người mua hàng chính.
4. **Đội ngũ giao hàng (Shipper):** Sinh viên hoặc nhân viên vận chuyển nội bộ.

---

## 3. Yêu cầu Chức năng (Functional Requirements)

### 3.1 Quản lý Tài khoản và Bảo mật
- **Đăng ký/Đăng nhập:** Hỗ trợ xác thực OTP qua Email trường.
- **Phân quyền:** 4 vai trò rõ rệt (Admin, Vendor, Customer, Shipper).
- **Cơ chế chống Brute-force:** Tự động khóa tài khoản sau N lần nhập sai mật khẩu; Admin có quyền mở khóa thủ công.
- **Hồ sơ cá nhân:** Quản lý thông tin định danh (MSSV, Khoa), địa chỉ nhận hàng (nhiều địa chỉ) và ảnh đại diện.
- **Xác thực Email:** Ghi nhận thời điểm email được xác thực để bật các nghiệp vụ cần thiết.

### 3.2 Quản lý Sản phẩm và Danh mục
- **Cấu trúc danh mục:** Hỗ trợ danh mục đa cấp (Cha-Con).
- **Sản phẩm & Biến thể:** Quản lý sản phẩm với nhiều biến thể (Size, Màu sắc) có giá chênh lệch và SKU riêng.
- **Đa phương tiện sản phẩm:** Lưu ảnh/video sản phẩm và thứ tự hiển thị.
- **Kiểm soát chất lượng:** Admin duyệt sản phẩm từ Vendor trước khi hiển thị công khai.
- **Kho hàng:** Tồn kho theo từng biến thể; tự động trừ khi có đơn và hoàn tồn khi hủy hợp lệ.

### 3.3 Quy trình Đơn hàng và Vận chuyển
- **Giỏ hàng & Đặt hàng:** Khách hàng có thể thêm sản phẩm, áp dụng mã giảm giá và ghi chú cho từng món; nếu sản phẩm/biến thể đã có trong giỏ thì tăng số lượng.
- **Thanh toán:** Tích hợp thanh toán đa phương thức (VNPAY, MoMo, COD) và sử dụng Xu tích lũy.
- **Điều phối giao hàng:** Admin hoặc Vendor chỉ định Shipper cho đơn hàng.
- **Theo dõi lộ trình (Timeline):** Cập nhật trạng thái thời gian thực (Chờ duyệt, Đang xử lý, Đang giao, Thành công, Đã hủy).
- **Hủy đơn:** Quy trình hủy đơn kèm lý do và cơ chế hoàn xu tự động cho khách hàng.
- **Xu theo đơn:** Lưu số xu đã dùng và xu tích lũy từ mỗi đơn hàng.

### 3.4 Chương trình Khuyến mãi và Xu (Coin)
- **Hệ thống Xu:**
    - Tích lũy xu khi mua hàng thành công.
    - Sử dụng xu để giảm trừ trực tiếp vào đơn hàng.
    - Hoàn xu khi đơn hàng bị hủy do lỗi người bán hoặc hệ thống.
- **Chiến dịch Marketing:** Tạo banner, chương trình giảm giá theo thời điểm.
- **Mã giảm giá (Coupon):** Thiết lập mức giảm, giá trị đơn hàng tối thiểu, giới hạn sử dụng và nhắm đối tượng mục tiêu (theo Khoa hoặc năm học). Mặc định mỗi mã dùng 1 lần.

### 3.5 Tương tác và Thông báo
- **Đánh giá & Phản hồi:** Khách hàng gửi đánh giá kèm hình ảnh/video sau khi nhận hàng.
- **Hệ thống thông báo:**
    - Thông báo tức thời (In-app) về trạng thái đơn hàng và khuyến mãi.
    - Gửi Email xác nhận cho các giao dịch quan trọng.
- **Tìm kiếm & Lọc:** Tìm kiếm toàn văn (Full-text search) và lọc sản phẩm theo giá, danh mục, đánh giá.

---

## 4. Yêu cầu Phi chức năng (Non-Functional Requirements)

### 4.1 Hiệu năng
- Thời gian phản hồi trang web không quá 2 giây cho các thao tác thông thường.
- Hỗ trợ ít nhất 1000 người dùng truy cập đồng thời trong các đợt cao điểm (đăng ký đồng phục, giáo trình).

### 4.2 Bảo mật
- Mã hóa mật khẩu bằng thuật toán Bcrypt.
- Toàn bộ giao diện API phải được bảo vệ bằng JWT (JSON Web Token).
- Tuân thủ quy định bảo mật dữ liệu cá nhân của sinh viên.

### 4.3 Khả năng mở rộng
- Hệ thống thiết kế theo kiến trúc module, dễ dàng tích hợp thêm các cổng thanh toán hoặc dịch vụ vận chuyển bên thứ ba trong tương lai.

---

## 5. Các Quy tắc Nghiệp vụ (Business Rules)
1. **Quy tắc Xu:** 1000 VNĐ chi tiêu tương đương với 1 Xu tích lũy (Có thể cấu hình lại bởi Admin).
2. **Quy tắc Hủy đơn:** Khách hàng chỉ được hủy đơn khi đơn hàng đang ở trạng thái "Chờ duyệt" hoặc "Đã xác nhận" (chưa bàn giao cho Shipper).
3. **Quy tắc Giao hàng:** Shipper phải cập nhật ghi chú chi tiết nếu giao hàng thất bại.
4. **Quy tắc Khóa tài khoản:** Tài khoản bị khóa 30 phút sau 5 lần đăng nhập sai liên tiếp.

---

## 6. Sơ đồ Thực thể (Data Overview)
Dữ liệu được tổ chức xoay quanh các bảng cốt lõi: `Users`, `Products`, `Orders`, `Coin_Transactions`, `Campaigns`, `Notifications`. Mối quan hệ chính là 1-N giữa người dùng và các thực thể giao dịch.

---

> [!IMPORTANT]
> Bản yêu cầu này là tài liệu sống (living document) và cần được cập nhật khi có thay đổi về quy trình vận hành thực tế tại trường.
