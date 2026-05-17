# Đặc tả Chi tiết Màn hình Giao diện (Detailed UI Specification) - UTEShop

Tài liệu này chi tiết hóa các thành phần (Components) và trường thông tin (Fields) cho từng màn hình trong hệ thống UTEShop, đảm bảo bao phủ toàn bộ các chức năng đã đặc tả.

---

## 1. Khách vãng lai (Guest)

### 1.1. Trang chủ (Homepage)
*   **Thanh điều hướng (Navbar):**
    *   **Logo:** Logo sàn UTEShop kết nối về trang chủ.
    *   **Thanh tìm kiếm:** Ô nhập từ khóa, nút tìm kiếm, hỗ trợ gợi ý từ khóa (Suggestions).
    *   **Giỏ hàng:** Icon giỏ hàng kèm số lượng (Badge) nhảy số real-time.
    *   **Thông báo:** Icon chuông nhận thông báo về khuyến mãi/đơn hàng.
    *   **Tài khoản:** Nút Đăng nhập/Đăng ký (nếu Guest) hoặc Avatar + Menu Dropdown (nếu User).
    *   **Link phụ:** "Kênh Người Bán", "Tải ứng dụng", "Kết nối fanpage".
*   **Khối Banner & Menu:**
    *   **Banner Slider:** Chạy ảnh khuyến mãi tự động (Carousel).
    *   **Cây Danh mục:** Menu dọc hoặc lưới Icon danh mục Level 1.
*   **Khối Flash Deals:**
    *   **Timer:** Đồng hồ đếm ngược (Giờ : Phút : Giây).
    *   **Sản phẩm:** Danh sách sản phẩm giảm giá mạnh, thanh Progress Bar "Đã bán X%".
*   **Lưới Sản phẩm gợi ý (Product Feed):** 
    *   **Tabs:** "Gợi ý cho bạn", "Bán chạy", "Hàng mới về".
    *   **Product Card:** Ảnh, nhãn "Yêu thích/Mall", tên sản phẩm (Line-clamp 2), giá bán, số lượng đã bán, địa điểm shop.
*   **Chatbot AI (Floating Widget):**
    *   Nút bong bóng ở góc dưới bên phải.
    *   Cửa sổ chat nhỏ: Tin nhắn chào mừng, các câu hỏi gợi ý (Vd: "Đơn hàng của tôi ở đâu?", "Lấy mã giảm giá").

### 1.2. Kết quả Tìm kiếm & Danh mục (Search & Listing)
*   **Bộ lọc Sidebar:** Theo danh mục 3 cấp, Khoảng giá (Min-Max), Màu sắc, Kích cỡ, Đánh giá (4 sao trở lên).
*   **Thanh Sắp xếp:** Theo Mới nhất, Bán chạy, Giá (Thấp -> Cao, Cao -> Thấp).
*   **Lưới Sản phẩm:** Các thẻ sản phẩm kèm nút "Yêu thích nhanh".

### 1.3. Chi tiết Sản phẩm (Product Detail)
*   **Bộ sưu tập ảnh (Image Gallery):** Ảnh chính lớn và các ảnh thumbnail bên dưới. Hỗ trợ phóng to (Zoom) và xem Video.
*   **Thông tin bán hàng:** Tên sản phẩm, Giá MRP (gạch ngang), Giá bán hiện tại, Nhãn giảm giá (%), SKU.
*   **Lựa chọn biến thể:** Các nút chọn Màu sắc (Color), chọn Kích cỡ (Size).
*   **Số lượng:** Nút tăng/giảm (+/-) và số lượng tồn kho hiển thị bên cạnh.
*   **Thông tin Shop (Shop Widget):** Tên shop, Rating shop, Nút "Xem shop", Nút "Chat ngay".
*   **Mô tả sản phẩm:** Nội dung chi tiết (Rich text), Thông số kỹ thuật.
*   **Đánh giá & Nhận xét:** Tổng số sao, Lọc đánh giá theo số sao (5-4-3-2-1), Danh sách bình luận kèm ảnh/video thực tế.

### 1.4. Các trang tĩnh (Static Pages)
*   **Tin tức/Blog (Post List):** Danh sách bài viết về xu hướng thời trang, mẹo phối đồ.
*   **Chi tiết bài viết:** Nội dung văn bản, hình ảnh, sản phẩm liên quan đính kèm.
*   **FAQ & Chính sách:** Câu hỏi thường gặp, Chính sách bảo mật, Chính sách vận chuyển/hoàn tiền.

---

## 2. Khách hàng (User/Customer)

### 2.1. Đăng ký & Đăng nhập
*   **Đăng ký:** Họ tên, Email, Mật khẩu, Nhập lại mật khẩu.
*   **Xác thực OTP:** Ô nhập 6 mã số, Nút "Gửi lại mã" (kèm bộ đếm ngược 60s).
*   **Đăng nhập:** Email, Mật khẩu. Link "Quên mật khẩu".
*   **Quên mật khẩu:** Nhập Email -> Xác thực OTP -> Form đặt lại mật khẩu mới.

### 2.2. Giỏ hàng (Cart)
*   **Nhóm theo Shop:** Mỗi shop là một block riêng, có checkbox chọn tất cả sản phẩm của shop đó.
*   **Item Card:** Ảnh, Tên, Biến thể đã chọn, Giá, Số lượng (có thể chỉnh sửa), Ghi chú sản phẩm (Note), Nút Xóa.
*   **Thanh Tổng kết (Sticky Bottom):** Tổng tiền hàng, Số lượng chọn, Nút "Thanh toán".

### 2.3. Thanh toán (Checkout)
*   **Địa chỉ nhận hàng:** Tên người nhận, SĐT, Địa chỉ chi tiết (có nút "Thay đổi").
*   **Danh sách sản phẩm:** Liệt kê lại các món đã chọn theo từng Shop.
*   **Mã giảm giá:** Ô nhập mã Voucher hoặc Nút "Chọn Voucher sàn/shop".
*   **Ví Xu:** Toggle "Sử dụng Xu" và số tiền được trừ tương ứng.
*   **Phương thức thanh toán:** Radio button (VnPay, MoMo, COD).
*   **Tổng thanh toán:** Tiền hàng + Phí ship - Giảm giá - Xu = Tổng tiền cuối cùng.

### 2.4. Quản lý Tài khoản (Profile Dashboard)
*   **Hồ sơ cá nhân:** Avatar (Upload), Họ tên, Email (Read-only), SĐT, Giới tính, Ngày sinh.
*   **Sổ địa chỉ:** Danh sách địa chỉ đã lưu. Form Thêm/Sửa địa chỉ (Nhãn, Tên, SĐT, Tỉnh/Huyện/Xã, Địa chỉ cụ thể, Checkbox "Mặc định").
*   **Đổi mật khẩu:** Mật khẩu cũ, Mật khẩu mới, Xác nhận mật khẩu mới.
*   **Danh sách yêu thích (Wishlist):** Lưới sản phẩm đã "thả tim", nút "Bỏ thích".

### 2.5. Đơn hàng & Tương tác
*   **Lịch sử Đơn hàng:** Tab Trạng thái (Tất cả, Chờ xác nhận, Chờ lấy hàng, Đang giao, Đã giao, Đã hủy, Trả hàng/Hoàn tiền).
*   **Chi tiết Đơn hàng:** 
    *   Tiến trình (Stepper).
    *   Thông tin vận chuyển (Mã vận đơn, Nhật ký hành trình).
    *   Chi tiết giá (Tổng tiền, Giảm giá, Xu đã dùng, Xu tích lũy).
*   **Trả hàng/Hoàn tiền (Return Request):** Chọn lý do (Sai hàng, Hỏng, Khác), Tải ảnh/video bằng chứng, Ghi chú chi tiết.
*   **Khiếu nại (Dispute):** Form gửi yêu cầu Admin phân xử khi Seller từ chối hoàn tiền.
*   **Trung tâm tin nhắn (Chat):** Danh sách hội thoại bên trái, Cửa sổ chat bên phải (Gửi text, ảnh, link sản phẩm).

### 2.6. Ví Xu & Thông báo
*   **Ví Xu:** Tổng số dư xu, Lịch sử biến động xu (Nhận từ đơn hàng, Dùng mua hàng).
*   **Thông báo:** Danh sách thông báo chia theo loại (Đơn hàng, Khuyến mãi, Hệ thống).

---

## 3. Nhà bán hàng (Vendor/Seller)

### 3.1. Kênh Người bán (Seller Center Dashboard)
*   **Bento Stats:** Doanh thu hôm nay, Đơn hàng mới, Sản phẩm hết hàng, Tỷ lệ phản hồi chat.
*   **Biểu đồ:** Doanh thu theo ngày/tuần/tháng (Line/Bar Chart).

### 3.2. Quản lý Sản phẩm
*   **Danh sách:** Lọc trạng thái (Đang bán, Chờ duyệt, Vi phạm, Hết hàng).
*   **Form Thêm/Sửa:**
    *   Thông tin cơ bản (Tên, Danh mục 3 cấp, Thương hiệu, Mô tả).
    *   Bảng Biến thể: Map Màu sắc x Kích cỡ -> SKU, Giá, Tồn kho.
    *   Media: Upload ảnh/video.
*   **Lịch sử Duyệt:** Xem lý do nếu sản phẩm bị Manager từ chối.

### 3.3. Xử lý Đơn hàng & Vận chuyển
*   **Danh sách đơn hàng:** Tìm kiếm theo mã đơn, SĐT khách.
*   **Thao tác đơn:** Nút "Xác nhận", "Chuẩn bị hàng", "In vận đơn" (Xuất file PDF nhãn dán).
*   **Vận chuyển:** Theo dõi trạng thái đơn từ phía ĐVVC qua API.

### 3.4. Tài chính & Ví Seller
*   **Số dư Ví:** Hiển thị 3 loại: Tổng số dư, Đóng băng (Pending), Khả dụng (Available).
*   **Lịch sử giao dịch:** Danh sách cộng/trừ tiền chi tiết theo mã đơn.
*   **Rút tiền:** Form chọn ngân hàng, nhập số tiền, xem phí rút. Danh sách lịch sử lệnh rút tiền (Pending, Success, Failed).

### 3.5. Chăm sóc khách hàng
*   **Chat Center:** Giao diện chat đa nhiệm (WebSockets) hỗ trợ gửi mã giảm giá nhanh cho khách.
*   **Quản lý Trả hàng:** Xem bằng chứng khách gửi, Nút "Chấp nhận hoàn tiền" hoặc "Từ chối & Gửi bằng chứng đối ứng".

---

## 4. Quản trị viên & Quản lý (Admin/Manager)

### 4.1. Dashboard Tổng quan (Admin CMS)
*   Thống kê toàn sàn: GMV, Số lượng User mới, Số lượng Shop mới, Sản phẩm vi phạm.

### 4.2. Quản lý Vận hành (Dành cho Manager)
*   **Duyệt Shop:** Danh sách hồ sơ đăng ký mới, xem tài liệu pháp lý (MST), Nút Duyệt/Từ chối.
*   **Duyệt Sản phẩm:** Kiểm duyệt nội dung/hình ảnh sản phẩm mới đăng của Seller.
*   **Quản lý Vi phạm:** Danh sách báo cáo vi phạm, Nút Ẩn sản phẩm hoặc Khóa Shop tạm thời.

### 4.3. Quản trị Hệ thống (Dành cho Admin)
*   **Phân quyền (RBAC):** 
    *   Quản lý Role (Admin, Manager...).
    *   Ma trận Permission: Gán quyền cho từng Role trên từng Module.
*   **Cấu hình Tài chính:** % Phí sàn, Cấu hình tích/tiêu Xu, Hạn mức rút tiền tối thiểu.
*   **Quản lý ĐVVC:** Bật/Tắt đối tác, Cấu hình API Key/Secret của GHTK, GHN, Grab...
*   **Cấu hình Giao diện:** Quản lý Banner trang chủ, Sắp xếp thứ tự các Section (Flash Deal, Category Grid).
*   **Quản lý Ngành hàng:** Trình chỉnh sửa cây danh mục 3 cấp (Thêm/Sửa/Xóa/Di chuyển).
*   **Chiến dịch & Khuyến mãi:** Tạo Coupon toàn sàn, thiết lập chương trình hạ giá đồng loạt.

### 4.4. Tài chính & Đối soát
*   **Phê duyệt Rút tiền:** Danh sách lệnh rút tiền từ Seller, Nút "Xác nhận đã chuyển khoản" kèm mã tham chiếu ngân hàng.
*   **Phân xử Khiếu nại (Dispute Resolution):** 
    *   Giao diện so sánh bằng chứng 2 bên (Khách vs Shop).
    *   Ghi chú nội bộ.
    *   Nút phán quyết: Hoàn tiền (Refund) hoặc Trả tiền cho Shop (Release Funds).

### 4.5. Bảo mật & Nhật ký
*   **Quản lý Người dùng:** Xem danh sách, tìm kiếm theo Email/SĐT, xem lịch sử mua hàng, Nút Khóa (Ban) tài khoản.
*   **Audit Logs:** Xem nhật ký thao tác của Admin/Manager (Ai làm gì, lúc nào, thay đổi dữ liệu gì).
