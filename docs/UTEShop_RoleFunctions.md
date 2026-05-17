# Danh sách Chức năng theo Vai trò (Role-Based Function List) - UTEShop

Tài liệu này liệt kê các chức năng chi tiết cho từng tác nhân (Role) trong hệ thống thương mại điện tử UTEShop, dựa trên tài liệu Đặc tả chức năng.

---

## 1. Khách vãng lai (Guest)
*Tác nhân chưa đăng nhập hệ thống.*

| STT | Chức năng | Mô tả chi tiết |
| :-- | :--- | :--- |
| 1 | **Xem Trang chủ** | Xem Banner, Deals, danh mục nổi bật và sản phẩm hot. |
| 2 | **Tìm kiếm & Lọc sản phẩm** | Tìm theo từ khóa, lọc theo giá, màu, thương hiệu, danh mục (3 cấp). |
| 3 | **Xem Chi tiết sản phẩm** | Xem ảnh, giá, mô tả, thuộc tính (size/color) và sản phẩm liên quan. |
| 4 | **Xem thông tin tĩnh** | Đọc tin tức, bài viết, FAQ, chính sách giao hàng/hoàn trả. |
| 5 | **Xem Đánh giá (Review)** | Xem số sao và nội dung bình luận của khách mua trước (chỉ đọc). |
| 6 | **Đăng ký / Đăng nhập** | Tạo tài khoản hoặc đăng nhập qua OTP Email để mua hàng. |

---

## 2. Khách hàng (Customer)
*Người dùng đã đăng nhập, thực hiện mua sắm.*

| STT | Chức năng | Mô tả chi tiết |
| :-- | :--- | :--- |
| 1 | **Xác thực OTP** | Đăng nhập/Đăng ký bảo mật qua mã 6 số gửi về Email. |
| 2 | **Tương tác Chatbot AI** | Hỏi đáp về đơn hàng, sản phẩm, khuyến mãi bằng ngôn ngữ tự nhiên. |
| 3 | **Quản lý Giỏ hàng** | Thêm/sửa/xóa sản phẩm, tự động tách đơn theo Seller (Split Order). |
| 4 | **Quản lý Danh sách yêu thích** | Lưu lại (thả tim) các sản phẩm ưng ý để xem sau. |
| 5 | **Đặt hàng & Thanh toán** | Thanh toán gộp (Stripe/VnPay/COD), áp dụng Coupon và Xu. |
| 6 | **Theo dõi đơn hàng** | Tra cứu tiến trình vận chuyển real-time qua thanh Stepper. |
| 7 | **Đánh giá gộp** | Đánh giá Sản phẩm, Shop và ĐVVC trên cùng một form sau khi nhận hàng. |
| 8 | **Yêu cầu Trả hàng/Hoàn tiền** | Gửi yêu cầu trong vòng 7 ngày kèm bằng chứng hình ảnh/video. |
| 9 | **Khiếu nại (Dispute)** | Gửi yêu cầu Admin phân xử nếu Seller từ chối hoàn tiền. |
| 10 | **Quản lý Ví Xu (Reward)** | Tích lũy xu khi mua hàng và sử dụng xu để giảm giá đơn sau. |
| 11 | **Chat với Người bán** | Nhắn tin trực tiếp (WebSockets) để nhận tư vấn sản phẩm. |
| 12 | **Quản lý Sổ địa chỉ** | Thêm/Sửa/Xóa nhiều địa chỉ giao hàng (Nhà riêng, Cơ quan). |
| 13 | **Quản lý Hồ sơ cá nhân** | Cập nhật họ tên, số điện thoại, ảnh đại diện. |

---

## 3. Nhà bán hàng (Seller)
*Chủ gian hàng, quản lý kinh doanh trên sàn.*

| STT | Chức năng | Mô tả chi tiết |
| :-- | :--- | :--- |
| 1 | **Quản lý Hồ sơ gian hàng** | Cập nhật Logo, Banner, MST, thông tin ngân hàng và địa chỉ kho. |
| 2 | **Quản lý Sản phẩm** | Đăng sản phẩm với biến thể JSON (Attributes), quản lý tồn kho, giá bán. |
| 3 | **Xử lý Đơn hàng** | Xác nhận đơn, "Đẩy đơn" sang ĐVVC (GHTK/Grab) tự động qua API. |
| 4 | **In Vận đơn (Shipping Label)** | Xuất file PDF mã vạch vận chuyển để dán lên gói hàng. |
| 5 | **Quản lý Ví Seller** | Theo dõi 3 loại số dư: Tổng (Total), Đóng băng (Pending), Khả dụng (Available). |
| 6 | **Rút tiền doanh thu** | Tạo lệnh rút tiền từ Available Balance về ngân hàng cá nhân. |
| 7 | **Xử lý Trả hàng/Hoàn tiền** | Xem bằng chứng khách gửi, chấp nhận hoặc từ chối yêu cầu hoàn trả. |
| 8 | **Thống kê & Báo cáo** | Xem biểu đồ doanh thu, tổng đơn, tỷ lệ hủy/hoàn tiền. |
| 9 | **Xuất báo cáo Excel** | Kết xuất lịch sử giao dịch và đối soát ra file .xlsx. |
| 10 | **Chat với Khách hàng** | Hỗ trợ khách hàng trực tuyến, tư vấn chốt đơn. |

---

## 4. Nhân viên Quản lý (Manager)
*Nhân sự chuyên trách nội dung và kiểm duyệt hàng hóa.*

| STT | Chức năng | Mô tả chi tiết |
| :-- | :--- | :--- |
| 1 | **Kiểm duyệt Seller** | Phê duyệt/Từ chối hồ sơ đăng ký mở gian hàng mới. |
| 2 | **Kiểm duyệt Sản phẩm** | Kiểm tra hình ảnh, mô tả sản phẩm thời trang trước khi cho hiển thị (Publish). |
| 3 | **Xử lý vi phạm nội dung** | Ẩn sản phẩm vi phạm, tạm đình chỉ (Suspend) gian hàng sai phạm. |
| 4 | **Tra cứu Hệ thống** | Tìm kiếm, xem danh sách Seller và Sản phẩm thuộc phạm vi quản lý. |

---

## 5. Quản trị viên (Admin)
*Quyền cao nhất, quản lý tài chính và vận hành toàn sàn.*

| STT | Chức năng | Mô tả chi tiết |
| :-- | :--- | :--- |
| 1 | **Quản lý Tài chính** | Duyệt lệnh rút tiền Seller, chuyển khoản thực tế và đối soát. |
| 2 | **Giải quyết Khiếu nại** | Làm trọng tài phân xử Dispute, quyết định hoàn tiền cho Khách hoặc trả tiền cho Shop. |
| 3 | **Cấu hình Hệ thống** | Thiết lập phí sàn (% Platform fee), tỷ lệ tích/tiêu Xu, hạn mức Xu. |
| 4 | **Quản lý Danh mục (3 cấp)** | Xây dựng và điều chỉnh cấu trúc ngành hàng (Level 1, 2, 3). |
| 5 | **Quản lý Giao diện** | Tùy biến trang chủ: Thay Banner, cấu hình lưới danh mục nổi bật. |
| 6 | **Quản lý Khuyến mãi sàn** | Tạo mã giảm giá (Coupons) và chiến dịch hạ giá (Deals) toàn sàn. |
| 7 | **Quản lý RBAC (Phân quyền)** | Tạo tài khoản Manager, thiết lập tập hợp Permissions cho từng Role. |
| 8 | **Quản lý Người dùng** | Xem danh sách, khóa (Ban) vĩnh viễn tài khoản vi phạm chính sách. |
| 9 | **Quản lý ĐVVC** | Bật/Tắt các đối tác vận chuyển (GHTK, Grab, GHN...). |
| 10 | **Theo dõi Nhật ký (Audit Log)** | Truy xuất lịch sử mọi thao tác thay đổi dữ liệu quan trọng của Admin/Manager. |
| 11 | **Phân bổ giảm giá** | Tự động tính toán chia sẻ phí giảm giá Coupon/Xu sàn cho các Seller (Discount Allocation). |
