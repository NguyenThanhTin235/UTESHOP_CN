

# Xây dựng Website Thời trang UTESHOP

## 1. KHẢO SÁT HIỆN TRẠNG VÀ XÁC ĐỊNH YÊU CẦU

### 1.1. Phân tích hiện trạng

Trong bối cảnh thương mại điện tử phát triển mạnh mẽ, việc xây dựng một nền tảng bán hàng không chỉ dừng lại ở mô hình một cửa hàng mà đang chuyển dịch sang mô hình sàn giao dịch thương mại điện tử đa nhà cung cấp.

Hiện tại, người tiêu dùng cần một nền tảng tích hợp nơi họ có thể tìm kiếm, lọc, sắp xếp sản phẩm từ nhiều nhà bán hàng khác nhau, quản lý giỏ hàng mượt mà, thanh toán trực tuyến an toàn và tương tác qua Chatbot AI. Về phía người bán, họ thiếu một công cụ tập trung để đăng bán sản phẩm, theo dõi đơn hàng, cập nhật kho và thống kê doanh thu qua biểu đồ trực quan. Về phía quản trị viên, cần có một hệ thống toàn diện để kiểm duyệt người bán, quản lý mã giảm giá, các chương trình khuyến mãi và tùy biến giao diện trang chủ động.

Việc xây dựng một hệ thống E-commerce đa nhà cung cấp là giải pháp hoàn chỉnh, tự động hóa quy trình giao dịch, quản lý tài chính thông qua tích hợp cổng thanh toán và nâng cao trải nghiệm người dùng.

### 1.2. Phân tích yêu cầu

#### 1.2.1. Yêu cầu chức năng

##### Yêu cầu chức năng nghiệp vụ

**Bảng yêu cầu chức năng nghiệp vụ**


**Bộ phận: Khách vãng lai**  
Mã số: GUEST

|**STT**|**Công việc**|**Loại công việc**|**Quy định/Công thức liên quan**|**Biểu mẫu liên quan**|**Ghi chú**|
| :- | :- | :- | :- | :- | :- |
|**1**|Xem giao diện Trang chủ|Tra cứu|QĐ\_KVL1||Hiển thị các Banner, Deals, Lưới danh mục.|
|**2**|Tìm kiếm, lọc sản phẩm|Tra cứu|QĐ\_KVL2||Lọc theo giá, màu, thương hiệu, danh mục.|
|**3**|Xem chi tiết sản phẩm và Sản phẩm có liên quan|Tra cứu|QĐ\_KVL3||Xem ảnh, giá, mô tả, tồn kho và các gợi ý sản phẩm cùng danh mục.|
|**4**|Xem các trang thông tin tĩnh (Xem bài viết, tin tức, FAQ, Chính sách giao hàng, Chính sách hoàn trả).|Tra cứu|QĐ\_KVL4||Đọc tin tức từ hệ thống hoặc gian hàng. Xem FAQ, Chính sách giao hàng, Chính sách hoàn trả.|
|**5**|Xem đánh giá (Review)|Tra cứu|QĐ\_KVL5||Chỉ xem, không được viết đánh giá.|
|**6**|Đăng ký / Đăng nhập|Tương tác|QĐ\_KVL6||Yêu cầu bắt buộc để tiến hành mua hàng.|


**Bảng 1.1: Bảng yêu cầu chức năng nghiệp vụ Khách vãng lai**

|**STT**|**Mã số**|**Tên Quy định/ Công thức**|**Mô tả chi tiết**|**Ghi chú**|
| :- | :- | :- | :- | :- |
|**1**|QĐ\_KVL1|Quy định hiển thị Trang chủ|Dữ liệu trang chủ (Homepage data) được hệ thống public mở hoàn toàn, Khách vãng lai không cần truyền JWT Token vẫn có thể tải được danh sách Deals, Grid Category và các sản phẩm nổi bật.|API public|
|**2**|QĐ\_KVL2|Quy định tìm kiếm và lọc|Hỗ trợ tìm kiếm bằng từ khóa. Lọc nâng cao theo: Danh mục 3 cấp (Level 1, 2, 3), mức giá (Min/Max), % giảm giá tối thiểu, màu sắc và sắp xếp (Giá từ thấp đến cao/Cao xuống thấp).||
|**3**|QĐ\_KVL3|Quy định xem chi tiết sản phẩm|Khách vãng lai được xem toàn bộ thông tin công khai của sản phẩm bao gồm: Giá niêm yết (MRP Price), Giá bán (Selling Price), % giảm giá, hình ảnh (từ Cloudinary), màu sắc và thông tin Cửa hàng (Seller). Ở cuối trang chi tiết, hệ thống tự động hiển thị danh sách các "Sản phẩm liên quan" (Related products) dựa trên cùng Category Level 3 để tăng trải nghiệm mua sắm.||
|**4**|QĐ\_KVL4|Quy định xem bài viết, tin tức|Khách vãng lai có thể truy cập đọc các bài viết quảng bá, tin tức sự kiện do Admin phát hành trên toàn sàn hoặc bài viết nội bộ của từng gian hàng Seller, các trang thông tin tĩnh (Static pages) như FAQ, Điều khoản dịch vụ được public hoàn toàn để khách hàng tìm hiểu trước khi đăng ký.||
|**5**|QĐ\_KVL5|Quy định giới hạn đánh giá|Khách vãng lai chỉ có quyền ĐỌC các số sao (Rating) và nội dung bình luận (Review) của các sản phẩm. Tuyệt đối không được phép GỬI đánh giá mới.||
|**6**|QĐ\_KVL6|Quy định giới hạn nghiệp vụ Mua sắm|Khách vãng lai **không có giỏ hàng (Cart)** và **không có Danh sách yêu thích (Wishlist)**. Nếu cố tình nhấn nút "Thêm vào giỏ" hoặc "Mua ngay", hệ thống (React Router) bắt buộc chuyển hướng (Redirect) sang trang Đăng nhập / Đăng ký qua OTP.||

**Bảng 1.2: Bảng yêu quy định/ công thức liên quan Khách vãng lai**


**Bộ phận: Quản trị viên**  
Mã số: ADMIN

|**STT**|**Công việc**|**Loại công việc**|**Quy định/Công thức liên quan**|**Biểu mẫu liên quan**|**Ghi chú**|
| :- | :- | :- | :- | :- | :- |
|**1**|Quản lý kiểm duyệt Seller|Tra cứu/Lưu trữ|QĐ\_AD1||Thay đổi trạng thái tài khoản|
|**2**|Quản lý danh mục sản phẩm|Tra cứu/Lưu trữ|QĐ\_AD2||Quản lý cấu trúc 3 cấp|
|**3**|Quản lý trang chủ (Homepage)|Lưu trữ/Cập nhật|QĐ\_AD3||Banner, lưới danh mục|
|**4**|Quản lý khuyến mãi (Deals & Coupons)|Tra cứu/Lưu trữ|QĐ\_AD4||Áp dụng toàn sàn|
|**5**|Quản lý tài khoản toàn hệ thống|Tra cứu/Lưu trữ|QĐ\_AD5|||
|**6**|Quản lý khiếu nại (Disputes)|Tra cứu/Xử lý|QĐ\_AD6||Quyết định cuối cùng giữa Khách và Seller.|
|**7**|Xử lý Hoàn tiền|Tính toán/Xử lý|QĐ\_AD7|||
|**8**|Cấu hình hệ thống Xu (Coins)|Lưu trữ/Cập nhật|QĐ\_AD8||Thiết lập tỉ lệ quy đổi và hạn mức sử dụng Xu.|
|**9**|Đối soát doanh thu Seller|Tính toán/Kết xuất|CT\_AD1||Quản lý dòng tiền và tính toán phí nền tảng.|
|**10**|Quản lý đơn vị vận chuyển|Tra cứu/Lưu trữ|QĐ\_AD10|||
|**11**|Kiểm duyệt Sản phẩm|Tra cứu/Xử lý|QĐ\_AD11||Phê duyệt (Approve) hoặc Từ chối (Reject) sản phẩm mới do Seller đăng tải.|
|**12**|Quản lý Cấu hình Phí nền tảng|Cập nhật|QĐ\_AD12||Giao diện cấu hình % Platform fee thu từ Seller.|


**Bảng 1.3: Bảng yêu cầu chức năng nghiệp vụ Admin**

|**STT**|**Mã số**|**Tên Quy định/ Công thức**|**Mô tả chi tiết**|**Ghi chú**|
| :- | :- | :- | :- | :- |
|**1**|QĐ\_AD1|Quy định kiểm duyệt Seller|Khi Seller đăng ký (Cung cấp GST, thông tin ngân hàng), tài khoản ở trạng thái PENDING. Admin kiểm duyệt và chuyển thành ACTIVE. Nếu vi phạm, Admin có thể SUSPEND hoặc BAN.||
|**2**|QĐ\_AD2|Quy định quản lý danh mục|Danh mục được tổ chức theo 3 cấp độ (Level 1, Level 2, Level 3).||
|**3**|QĐ\_AD3|Quy định quản lý trang chủ|Admin được phép thiết lập lưới danh mục hiển thị, danh mục đồ điện tử, nội thất và cập nhật các hình ảnh hiển thị trên trang chủ.||
|**4**|QĐ\_AD4|Quy định quản lý khuyến mãi|Admin tạo Deal giảm giá cho các danh mục hoặc phát hành Coupon chung (yêu cầu mã code, phần trăm giảm, thời hạn, giá trị tối thiểu).||
|**5**|QĐ\_AD5|Quy định quản lý tài khoản|Quản lý quyền truy cập và thông tin của tất cả Customer và Seller.||
|**6**|QĐ\_AD6|Quy định xử lý khiếu nại|Đối với các đơn hàng DISPUTED, Admin đóng vai trò trọng tài xem xét bằng chứng của cả Khách hàng và Seller. Phán quyết của Admin (Chấp nhận hoàn tiền hoặc Không chấp nhận) là quyết định cuối cùng.||
|**7**|QĐ\_AD7|Quy định hoàn tiền|Khi yêu cầu hoàn tiền được duyệt (bởi Seller hoặc Admin), hệ thống Back-end tự động gọi API Refund của cổng thanh toán để trả tiền về tài khoản ngân hàng gốc của khách hàng. Trạng thái đơn chuyển thành REFUNDED||
|**8**|QĐ\_AD8|Quy định cấu hình Xu|<p>Admin thiết lập 3 thông số chính:</p><p>1\. **Tỉ lệ kiếm xu** (VD: 1000đ = 1 Xu).</p><p>2\. **Tỉ giá tiêu xu** (VD: 1 Xu = 1đ).</p><p>3\. **Hạn mức thanh toán** (VD: Xu chỉ thanh toán tối đa 50% giá trị đơn hàng).</p>||
|**9**|CT\_AD1|Công thức đối soát doanh thu Seller|<p>Doanh thu Seller thực nhận = Tổng Selling Price - Phí nền tảng (Áp dụng theo % được cấu hình tại QĐ\_AD12).</p><p>*Lưu ý:* Phần tiền mà khách hàng đã dùng Xu để trừ thẳng vào đơn hàng sẽ do Admin bù lại vào ví của Seller trong quá trình đối soát để không làm thiệt hại đến doanh thu của Seller.</p>|Yêu cầu đối soát dòng tiền minh bạch.|
|**10**|QĐ\_AD10|<p>Quy định Quản lý Đơn vị Vận chuyển</p><p></p>|Admin có quyền quản lý danh sách các đối tác vận chuyển trên sàn. Cho phép Thêm mới, Cập nhật thông tin, hoặc Bật/Tắt (Active/Deactive) các ĐVVC. Chỉ các ĐVVC ở trạng thái Active mới được phép hiển thị ở bước xử lý đơn hàng của Seller và Khách hàng.||
|**11**|QĐ\_AD11|Quy định kiểm duyệt sản phẩm|Để bảo vệ nền tảng khỏi hàng giả/hàng cấm, các sản phẩm do Seller đăng tải sẽ ở trạng thái chờ duyệt. Admin xem xét thông tin và Approve (cho phép hiển thị) hoặc Reject (yêu cầu sửa đổi).||
|**12**|QĐ\_AD12|Quy định thiết lập phí sàn|Admin có quyền thiết lập tỷ lệ Phần trăm Phí nền tảng (Platform fee) áp dụng cho các giao dịch thành công thông qua giao diện cấu hình động, không fix cứng trong mã nguồn.||
|**13**|QĐ\_AD13|Quy định RBAC (Phân quyền linh hoạt)|Hệ thống sử dụng mô hình Role-Based Access Control. Quyền hạn không fix cứng theo vai trò mà được gán linh hoạt thông qua bảng Permissions. Admin có thể tạo Role mới và gán tập hợp các Permission tương ứng.||
|**14**|CT\_AD2|Công thức phân bổ giảm giá (Discount Allocation)|Khi một PaymentOrder có Coupon/Xu toàn sàn, số tiền giảm giá được phân bổ cho từng Order của Seller theo công thức: <br>`Allocated_Discount = (Order_Subtotal / Total_PaymentOrder_Subtotal) * Total_Discount_Amount`. <br>Phần lẻ sẽ được làm tròn và bù trừ vào đơn hàng có giá trị lớn nhất.||

**Bảng 1.4: Bảng yêu quy định/ công thức liên quan Admin**


**Bộ phận: Nhà cung cấp (Seller)**  
Mã số: SL

|**STT**|**Công việc**|**Loại công việc**|**Quy định/Công thức liên quan**|**Biểu mẫu liên quan**|**Ghi chú**|
| :- | :- | :- | :- | :- | :- |
|**1**|Cập nhật hồ sơ & thanh toán|Lưu trữ|QĐ\_SL1||Cung cấp GST, Ngân hàng|
|**2**|Quản lý sản phẩm|Lưu trữ/Cập nhật|QĐ\_SL2||Thêm biến thể, giá bán|
|**3**|Xử lý đơn hàng|Cập nhật|QĐ\_SL3||Tự động hóa qua API GHTK/Grab.|
|**4**|In phiếu giao hàng (Vận đơn)|Kết xuất|QĐ\_SL4||Mã vạch/QR code để dán lên gói hàng.|
|**5**|Báo cáo doanh thu & Thống kê|Kết xuất|CT\_SL1||Xem biểu đồ doanh số|
|**6**|Xử lý Yêu cầu trả hàng/Hoàn tiền|Tra cứu/Xử lý|QĐ\_SL5||Phê duyệt hoặc từ chối yêu cầu từ khách.|
|**7**|Cập nhật thống kê hoàn tiền|Kết xuất|CT\_SL2||Tự động cập nhật vào Total Refund|
|**8**|Chat trực tuyến (Real-time)|Tương tác|QĐ\_SL6||<br>Nhắn tin hỗ trợ trực tiếp Khách hàng.|
|**9**|Xuất báo cáo Excel|Kết xuất|QĐ\_SL7||Kết xuất dữ liệu đối soát ra file .xlsx.|


**Bảng 1.5: Bảng yêu cầu chức năng nghiệp vụ Seller**
---
<!-- Các phần tiếp theo giữ nguyên nội dung, chỉ chuẩn hóa tiêu đề, bảng, danh sách, thêm dòng trống giữa các đoạn, loại bỏ thẻ HTML không cần thiết. Nếu có đoạn mã code, đặt trong khối ``` để dễ đọc. -->

|**STT**|**Mã số**|**Tên Quy định/ Công thức**|**Mô tả chi tiết**|**Ghi chú**|
| :- | :- | :- | :- | :- |
|**1**|QĐ\_SL1|Quy định cập nhật hồ sơ|Seller phải cung cấp mã số thuế doanh nghiệp (GST), địa chỉ kho hàng (Pickup address), và thông tin ngân hàng hợp lệ để đối soát.||
|**2**|QĐ\_SL2|Quy định đăng tải sản phẩm|Mỗi sản phẩm phải thuộc 1 danh mục Level 3. Bắt buộc có Giá gốc (MRP) và Giá bán thực tế (Selling Price). Hệ thống tự động tính % Discount. Hình ảnh lưu qua Cloudinary.||
|**3**|QĐ\_SL3|Quy định xử lý đơn hàng & Vận chuyển|Khi đơn hàng có trạng thái CONFIRMED, Seller sử dụng chức năng **"Đẩy đơn vận chuyển"**. Hệ thống Back-end tự động gọi API của ĐVVC (GHTK/Grab) để lấy Mã vận đơn. Các trạng thái tiếp theo (SHIPPED, DELIVERED) sẽ do **Webhook của ĐVVC tự động cập nhật về hệ thống**, Seller không cần thao tác tay.|Đồng bộ Real-time|
|**4**|CT\_SL1|Tính toán báo cáo doanh thu|Báo cáo tự động tổng hợp: Tổng thu nhập (Total Earning), Tổng số đơn (Total Orders), Đơn bị hủy (Canceled Orders) và thể hiện qua biểu đồ trực quan.||
|**5**|**QĐ\_SL4**|Quy định in vận đơn|Sau khi đẩy đơn thành công, Seller được phép kết xuất và in Phiếu giao hàng chứa Mã vận đơn (Tracking Code) định dạng PDF để đóng gói.||
|**6**|QĐ\_SL5|<p><br>Quy định xử lý yêu cầu trả hàng</p><p></p>|<p>Xử lý yêu cầu trả hàng | Khi nhận được yêu cầu RETURN\_REQUESTED, Seller có tối đa 3 ngày để phản hồi.</p><p>- Nếu **Chấp nhận**: Chờ nhận lại hàng, sau đó xác nhận để hệ thống hoàn tiền.</p><p>- Nếu **Từ chối**: Phải ghi rõ lý do từ chối.</p>||
|**7**|CT\_SL2|Cập nhật tổng hoàn tiền (Total Refund).|Khi một đơn hàng hoàn tiền thành công, số tiền này bị trừ khỏi tổng thu nhập (Total Earning) và được cộng dồn vào thống kê Total Refund trên Seller Dashboard||
|**8**|QĐ\_SL6|Quy định hệ thống chat trực tuyến|Hệ thống cung cấp công cụ Chat Real-time (sử dụng WebSockets) giúp Seller giải đáp thắc mắc của khách hàng về sản phẩm/đơn hàng ngay lập tức để tăng tỷ lệ chốt Sale.||
|**9**|QĐ\_SL7|Quy định xuất báo cáo |Cho phép Seller trích xuất toàn bộ dữ liệu Lịch sử giao dịch (Transactions) và Doanh thu ra tệp tin Excel (.xlsx) để phục vụ nghiệp vụ đối soát và kế toán nội bộ.||
|**10**|QĐ\_SL8|Quy định dòng tiền Ví Seller|Số dư ví Seller được chia làm 3 loại:<br>1. **Total Balance**: Tổng số dư.<br>2. **Pending Balance**: Tiền từ đơn DELIVERED nhưng chưa qua 7 ngày (đang đóng băng).<br>3. **Available Balance**: Tiền thực tế có thể rút (đơn đã quá 7 ngày và không có tranh chấp).||
<a name="_toc212033559"></a>**Bảng **1****4**: Bảng yêu quy định/ công thức liên quan Nhân viên**

**Bộ phận: Khách hàng (Customer)           	Mã số: KH**

|**STT**|**Công việc**|**Loại công việc**|**Quy định/Công thức liên quan**|**Biểu mẫu liên quan**|**Ghi chú**|
| :- | :- | :- | :- | :- | :- |
|**1**|Xác thực tài khoản bằng OTP|Tương tác/Xác thực|QĐ\_KH1|||
|**2**|Tương tác Chatbot AI|Tra cứu|QĐ\_KH2||Hỏi đáp tự động.|
|**3**|Tìm kiếm, lọc sản phẩm|Tra cứu|QĐ\_KH3||Lọc theo giá, màu, danh mục.|
|**4**|Quản lý giỏ hàng & Wishlist|Tương tác/Lưu trữ|QĐ\_KH4|||
|**5**|Đặt hàng & thanh toán|Xử lý/Tính toán|QĐ\_KH5||Thanh toán qua Stripe/Razorpay.|
|**6**|Theo dõi & quản lý đơn hàng|Tra cứu|QĐ\_KH6||Xem trạng thái đơn hàng.|
|**7**|Đánh giá & Phản hồi|Kết xuất|QĐ\_KH7||Rating 1-5 sao, kèm ảnh thực tế.|
|**8**|Nhận thông báo, ưu đãi, hỗ trợ|Tra cứu/Tương tác|QĐ\_KH8||Hỗ trợ qua chat, email hoặc hotline.|
|**9**|Yêu cầu trả hàng & hoàn tiền|Tương tác/Cập nhật|QĐ\_KH9||Chỉ áp dụng cho đơn đã giao thành công.|
|**10**|Khiếu nại lên Admin (Dispute)|Tương tác/Xử lý|QĐ\_KH10||Dùng khi Seller từ chối yêu cầu trả hàng.|
|**11**|Quản lý ví Xu (Reward Coins)|Tra cứu|QĐ\_KH11||Xem số dư xu hiện tại và lịch sử nhận/tiêu xu.|
|**12**|Áp dụng Xu khi thanh toán|Tính toán/Xử lý|QĐ\_KH12||Trừ tiền tương ứng với số xu khách muốn sử dụng.|
|**13**|Chat trực tuyến với Người bán (Real-time|Tương tác|QĐ\_KH13||Nhắn tin trực tiếp theo thời gian thực (WebSockets) với Seller để nhận tư vấn cụ thể về món hàng.|
|**14**|Quản lý đa địa chỉ giao hàng|Cập nhật/Lưu trữ|QĐ\_KH14||Thêm mới, cập nhật, xóa các địa chỉ trong Sổ địa chỉ.|

<a name="_toc212033560"></a>**Bảng **1****5**: Bảng yêu cầu chức năng nghiệp vụ Khách hàng**

|**STT**|**Mã số**|**Tên Quy định/ Công thức**|**Mô tả chi tiết**|**Ghi chú**|
| :- | :- | :- | :- | :- |
|**1**|QĐ\_KH1|Quy định đăng nhập bằng OTP|Xác thực thông qua email sử dụng Java Mail Sender. Hệ thống gửi OTP gồm 6 chữ số để đăng ký/đăng nhập, thời gian hiệu lực giới hạn.||
|**2**|QĐ\_KH2|Quy định tương tác Chatbot AI|Chatbot có khả năng truy xuất cơ sở dữ liệu để trả lời các câu hỏi về: Tình trạng đơn hàng, tổng tiền giỏ hàng, thông tin chi tiết sản phẩm và khuyến mãi.||
|**3**|QĐ\_KH3|Quy định tìm kiếm và lọc|Hỗ trợ tìm kiếm theo từ khóa. Lọc nâng cao theo: Danh mục, mức giá (Min/Max), % giảm giá tối thiểu, màu sắc và sắp xếp (Giá từ thấp đến cao/Cao xuống thấp).||
|**4**|QĐ\_KH4|Quy định tách đơn hàng giỏ hàng|**Nghiệp vụ cốt lõi:** Một giỏ hàng có thể chứa sản phẩm từ nhiều Seller. Khi Checkout, hệ thống nhóm các món hàng theo Seller ID thành các Orders riêng biệt tương ứng với từng Seller, nhưng gộp chung vào 1 PaymentOrder duy nhất để thanh toán 1 lần.|Tính toán tổng tiền: CT\_KH1|
|**5**|QĐ\_KH5|Quy định thanh toán quốc tế/nội địa|Hỗ trợ cổng thanh toán VnPay, SePay hoặc Momo. Thanh toán thành công sẽ đổi trạng thái PaymentOrder thành SUCCESS và tự động trừ hàng trong kho.||
|6|QĐ\_KH6|Quy định theo dõi & quản lý đơn hàng|Khách hàng tra cứu nhật ký vận chuyển **trực tiếp ngay trên giao diện website** thông qua thanh tiến trình (Order Stepper). Hệ thống liên tục đồng bộ và hiển thị chi tiết các mốc thời gian, vị trí và trạng thái giao hàng từ Đơn vị vận chuyển (GHTK/Grab). Khách hàng được cung cấp Mã vận đơn để đối chiếu nếu cần, nhưng không bắt buộc phải rời khỏi sàn để tra cứu. Lịch sử đơn hàng được lưu trữ tối thiểu 12 tháng.|Giao tiếp qua API ĐVVC|
|**7**|QĐ\_KH7|Quy định đánh giá (Review)|Chỉ được đánh giá sản phẩm sau khi đã nhận hàng (DELIVERED). Chấm điểm từ 1 đến 5 sao, kèm bình luận và cho phép đính kèm hình ảnh thực tế sản phẩm.||
|**8**|QĐ\_KH8|Quy định nhận thông báo, ưu đãi, hỗ trợ|Hệ thống gửi thông báo về đơn hàng, khuyến mãi, sự kiện. Hỗ trợ khách hàng qua chat, email hoặc hotline.||
|**9**|QĐ\_KH9|Quy định yêu cầu trả hàng/hoàn tiền|Khách hàng chỉ được gửi yêu cầu trả hàng/hoàn tiền đối với đơn hàng có trạng thái là DELIVERED (Đã giao) trong vòng **7 ngày** kể từ ngày nhận. Bắt buộc phải cung cấp lý do (hàng lỗi, sai mẫu...) và đính kèm hình ảnh/video minh chứng. Trạng thái đơn hàng chuyển sang RETURN\_REQUESTED.||
|**10**|QĐ\_KH10|Quy định khiếu nại (Escalate)|Nếu Người bán từ chối yêu cầu trả hàng, Khách hàng có quyền nhấn nút "Khiếu nại lên Admin". Đơn hàng chuyển sang trạng thái DISPUTED (Đang tranh chấp) để Admin can thiệp.||
|**11**|QĐ\_KH11|Quy định Tích xu|Tích điểm (hoặc xu) cho khách hàng dựa trên lịch sử mua hàng. Khi đơn hàng đạt trạng thái DELIVERED, hệ thống tự động cộng số Xu = Final Payment Amount \* Tỉ lệ tích xu (VD: 1%).||
|**12**|QĐ\_KH12|Quy định Tiêu xu|Khách hàng có thể dùng Xu ở bước Thanh toán. Số tiền giảm được trừ trực tiếp vào Final Payment Amount. Có thể kết hợp sử dụng Xu và Mã giảm giá (Coupon) cùng lúc.||
|**13**|CT\_KH1|Công thức tính tiền Giỏ hàng |<p>Tổng giá bán (Total Selling Price) = ∑ (Giá bán × Số lượng)</p><p>Giảm giá Coupon = Total Selling Price × (% Coupon / 100)</p><p>Giảm giá Xu = Số Xu sử dụng × Tỉ giá</p><p>Phí vận chuyển (Dynamic Shipping Fee): Được Back-end gọi API bên thứ 3 tính toán tự động dựa trên khoảng cách địa chỉ Kho Seller và Khách nhận.</p><p>Tổng thanh toán (Final Payment) = Total Selling Price - Coupon - Xu + Phí vận chuyển.</p>|Công thức tổng quát áp dụng tại bước Checkout, tự động đối soát cả Mã giảm giá và Xu thưởng.|
|**14**|QĐ\_KH13|Quy định Chat trực tuyến với Seller|Khách hàng được cung cấp khung Chat để trò chuyện trực tiếp với Người bán (Seller) của sản phẩm đó. Tin nhắn phải được cập nhật ngay lập tức (Real-time) ở cả 2 phía mà không cần tải lại trang|Yêu cầu tích hợp WebSockets.|
|**15**|QĐ\_KH14|Quy định quản lý địa chỉ giao hàng|Khách hàng có quyền tạo và quản lý nhiều địa chỉ giao hàng khác nhau (Nhà riêng, Cơ quan) trong Hồ sơ cá nhân. Tại bước Thanh toán (Checkout), khách hàng có thể chọn nhanh địa chỉ đã lưu hoặc tạo địa chỉ mới.||
|**16**|QĐ\_KH15|Quy định Đánh giá gộp|Hệ thống cho phép khách hàng đánh giá Sản phẩm, Shop và ĐVVC trên cùng một form. Các bản ghi Review sẽ được liên kết với nhau thông qua `order_id` để quản lý theo phiên.||
<a name="_toc212033561"></a>**Bảng **1****6**: Bảng yêu quy định/ công thức liên quan Khách hàng**

**Bộ phận: Quản lý (Manager)	Mã số: KH**

|**STT**|**Công việc**|**Loại công việc**|**Quy định/Công thức liên quan**|**Biểu mẫu liên quan**|**Ghi chú**|
| :- | :- | :- | :- | :- | :- |
|1|Kiểm duyệt hồ sơ gian hàng (Vendor)|Xử lý/Cập nhật|QĐ\_MNG1||Phê duyệt hoặc từ chối yêu cầu đăng ký mở shop của Vendor.|
|2|Kiểm duyệt sản phẩm thời trang|Xử lý/Cập nhật|QĐ\_MNG2||Kiểm tra hình ảnh, form dáng, mô tả sản phẩm trước khi cho phép hiển thị (Publish) lên sàn.|
|3|Xử lý vi phạm nội dung|Tương tác/Xử lý|QĐ\_MNG3||Ẩn các sản phẩm thời trang vi phạm (phản cảm, sai sự thật) hoặc khóa gian hàng tạm thời.|
|4|Tìm kiếm, tra cứu Vendor và Sản phẩm|Tra cứu|QĐ\_MNG4||Xem danh sách tổng hợp, lọc trạng thái hoạt động của các gian hàng và sản phẩm thuộc thẩm quyền.|

**Bảng **1****5**: Bảng yêu cầu chức năng nghiệp vụ Quản lý**

|**STT**|**Mã số**|**Tên Quy định/ Công thức**|**Mô tả chi tiết**|**Ghi chú**|
| :- | :- | :- | :- | :- |
|1|QĐ\_MNG1|Quy định kiểm duyệt Vendor|Khi Vendor mới đăng ký, tài khoản ở trạng thái PENDING. Manager có trách nhiệm kiểm tra thông tin cơ bản và giấy tờ. Nhấn "Approve" để Vendor được phép bắt đầu bán hàng, hoặc "Reject" nếu thông tin cung cấp bị sai lệch.||
|2|QĐ\_MNG2|Quy định kiểm duyệt Sản phẩm|Mọi sản phẩm thời trang do Vendor đăng lên đều mặc định ở trạng thái PENDING (chờ duyệt). Manager phải kiểm tra tính thẩm mỹ của hình ảnh, sự rõ ràng về biến thể (màu sắc, size, chất liệu) và mô tả đúng chuẩn thời trang rồi mới duyệt thành PUBLISHED.||
|3|QĐ\_MNG3|Phạm vi xử lý vi phạm|Manager có quyền ẩn (ẩn hiển thị) các sản phẩm thời trang vi phạm hoặc đình chỉ (Suspend) hoạt động của shop nếu phát hiện sai phạm về nội dung.|Manager KHÔNG có quyền can thiệp tài chính, xử lý khiếu nại (Dispute) hay cấm vĩnh viễn (Ban).|
|4|QĐ\_MNG4|Quy định phân quyền tra cứu|Manager được cung cấp giao diện Dashboard với các bộ lọc tìm kiếm tương tự Admin, nhưng dữ liệu truy xuất bị giới hạn chỉ hiển thị trong phạm vi thực thể là Seller và Product.||

1. # <a name="_toc211893881"></a><a name="_toc212033335"></a><a name="_toc212060771"></a>**MÔ HÌNH HÓA YÊU CẦU**
   1. ## <a name="_toc211893882"></a><a name="_toc212033336"></a><a name="_toc212060772"></a>**Nhận diện tác nhân và chức năng trong sơ đồ Use case**
      `	`Các Usecase đang được thiết kế khóa tổng quát, như các usecase Quản lý bao gồm tra cứu, thêm, xóa, sửa. Có thể tách usecase ra riêng nhưng rất dài

      |**Tác nhân (Actor)**|**Mã UC**|**Tên Use Case (User Goal)**|**Mô tả**|
      | :-: | :-: | :-: | :-: |
      |**Khách vãng lai (Guest)**|**UC01**|**Khám phá nền tảng**|Xem trang chủ (Banner, Deals), tìm kiếm, lọc sản phẩm nâng cao. Xem chi tiết sản phẩm, gợi ý sản phẩm liên quan và đọc các trang thông tin tĩnh (FAQ, Chính sách).|
      ||**UC02**|**Đăng ký tài khoản**|Khách vãng lai đăng ký tài khoản qua Email và xác thực bằng mã OTP để trở thành Khách hàng chính thức.|
      |**Khách hàng (Customer)**|**UC03**|**Quản lý Giỏ hàng (Cart)**|Thêm sản phẩm vào giỏ, cập nhật số lượng hoặc xóa sản phẩm. Tự động tính toán lại tổng tiền và % giảm giá.|
      ||**UC04**|**Quản lý Danh sách yêu thích**|Thêm các sản phẩm ưng ý vào Wishlist để lưu trữ cho các lần mua sắm sau và xóa sản phẩm khỏi danh sách.|
      ||**UC05**|**Đặt hàng và Thanh toán**|Chọn địa chỉ giao hàng, hệ thống tự động tách đơn theo Seller (Split Order), áp dụng Coupon/Xu, và thanh toán qua cổng điện tử.|
      ||**UC06**|**Theo dõi & Quản lý đơn hàng**|Xem lịch sử mua hàng, tra cứu tiến trình vận chuyển theo thời gian thực và hủy đơn khi còn ở trạng thái "Mới đặt".|
      ||**UC07**|**Tương tác Chatbot AI**|Nhắn tin hỏi đáp tự động bằng ngôn ngữ tự nhiên để tra cứu thông tin sản phẩm, đơn hàng, và giỏ hàng.|
      ||**UC08**|**Đánh giá sản phẩm**|Chấm điểm (1-5 sao), viết bình luận và đính kèm hình ảnh thực tế sau khi đơn hàng đã "Đã giao".|
      ||**UC09**|**Yêu cầu Trả hàng & Hoàn tiền**|Tạo yêu cầu đổi/trả hàng kèm minh chứng. Có quyền Khiếu nại (Dispute) lên Admin nếu bị Seller từ chối.|
      ||**UC10**|**Cập nhật thông tin cá nhân**|Khách hàng xem và chỉnh sửa các thông tin liên lạc cơ bản (Họ tên, Số điện thoại) để hệ thống cập nhật hồ sơ người dùng.|
      ||**UC11**|**Quản lý Địa chỉ**|Khách hàng thực hiện thêm mới, chỉnh sửa hoặc xóa các địa chỉ giao nhận hàng hóa (nhà riêng, cơ quan) lưu trong sổ địa chỉ.|
      ||**UC12**|**Theo dõi ví xu**|Khách hàng tra cứu tổng số dư Ví xu hiện tại và xem lại nhật ký chi tiết các lần được cộng/trừ xu qua từng đơn hàng.|
      |**Khách hàng & Người bán**|**UC13**|**Chat trực tuyến** |Luồng giao tiếp dùng chung kết nối người mua và người bán thông qua kiến trúc WebSockets để trao đổi, tư vấn trực tiếp về sản phẩm/đơn hàng.|
      |**Người bán (Seller)**|**UC14**|**Quản lý Hồ sơ và Gian hàng**|Cập nhật thông tin doanh nghiệp (GST), tài khoản ngân hàng đối soát, địa chỉ kho lấy hàng và trang trí Banner gian hàng.|
      ||**UC15**|**Quản lý Kho sản phẩm**|Đăng tải sản phẩm mới (chờ duyệt), tải ảnh qua Cloudinary, cập nhật giá bán/tồn kho và cấu hình màu sắc/kích cỡ.|
      ||**UC16**|**Xử lý Đơn hàng & Vận chuyển**|Tiếp nhận đơn, xác nhận, tự động đẩy đơn sang API hãng vận chuyển (GHTK/Grab) và kết xuất in Phiếu giao hàng.|
      ||<br>**UC17**|**Rút tiền Ví điện tử (Wallet)**|Quản lý số dư từ doanh thu bán hàng. Tạo Lệnh rút tiền thực tế từ Ví điện tử về tài khoản ngân hàng cá nhân, chờ Admin chuyển khoản đối soát.|
      ||**UC18**|**Xử lý Yêu cầu Hoàn trả**|Xem xét lý do và minh chứng từ Khách hàng để đưa ra quyết định Chấp nhận (cho phép hoàn tiền) hoặc Từ chối.|
      ||**UC19**|**Theo dõi Đối soát & Doanh thu**|Xem biểu đồ doanh thu tổng quan, theo dõi dòng tiền đối soát và thực hiện Xuất báo cáo dữ liệu ra file Excel.|
      |**Quản lý (Manager) & Quản trị viên (Admin)**|**UC20**|**Kiểm duyệt Người bán**|Xét duyệt hồ sơ đăng ký gian hàng (Active), hoặc tạm đình chỉ (Suspend), cấm vĩnh viễn (Ban) tài khoản vi phạm.|
      ||**UC21**|**Kiểm duyệt Sản phẩm**|Xem xét thông tin các sản phẩm mới do Seller đăng tải để Phê duyệt (cho phép hiển thị công khai) hoặc Từ chối.|
      ||**UC22**|**Xử lý vi phạm nội dung**|Tùy biến linh hoạt giao diện trang chủ, cập nhật Banner, cấu hình lưới danh mục nổi bật mà không cần can thiệp code.|
      |**Quản trị viên (Admin)**|**UC23**|**Quản lý Phân quyền (Roles)**|Tạo tài khoản, cấp quyền truy cập cho Manager và Quản lý danh sách toàn bộ User trên hệ thống.|
      ||<br>**UC24**|**Quản lý Tài chính & Đối soát**|Chuyển khoản thực tế và duyệt Lệnh rút tiền của Seller. Cấu hình tỉ lệ quy đổi Xu thưởng, hạn mức tiêu Xu và % phí nền tảng.|
      ||**UC25**|**Giải quyết khiếu nại (Disputes)**|Xem xét các đơn hàng có tranh chấp, đưa ra phán quyết cuối cùng và tự động gọi API hoàn tiền cho Khách hàng qua VNPay.|
      ||<br>**UC26**|**Quản lý Giao diện** |Tùy biến linh hoạt giao diện trang chủ, cập nhật Banner, cấu hình lưới danh mục nổi bật mà không cần can thiệp code.|
      ||**UC27**|Quản lý Chiến dịch Khuyến mãi|Phát hành, cập nhật hoặc xóa các chiến dịch Marketing chung toàn sàn bao gồm Khuyến mãi (Deals) và Mã giảm giá (Coupons).|
      ||**UC28**|**Quản lý Khách hàng**|Xem danh sách khách hàng, theo dõi thông tin tài khoản và thực hiện khóa (Ban) các tài khoản vi phạm chính sách.|
      ||**UC29**|**Theo dõi Nhật ký (Audit Log)**|Truy xuất lịch sử các thao tác thay đổi dữ liệu quan trọng trên hệ thống (kiểm duyệt, duyệt rút tiền, xóa dữ liệu) để kiểm toán.|
      |**Mọi Tác nhân**|**UC30**|**Đăng nhập**|Người dùng xác thực danh tính qua Email/Mật khẩu (đối với Admin) hoặc đăng nhập không mật khẩu qua mã OTP (đối với Khách hàng, Người bán). Hệ thống cấp phiên làm việc và điều hướng theo phân quyền.|
      ||<br>**UC31**|**Đăng xuất**|Người dùng chủ động kết thúc phiên làm việc. Hệ thống tiến hành hủy xóa khỏi Local Storage thiết bị và điều hướng người dùng về trang chủ mặt tiền một cách an toàn.|
      ||**UC32**|**Đổi / Quên mật khẩu**|Hỗ trợ người dùng yêu cầu thiết lập lại mật khẩu khi quên hoặc chủ động đổi mật khẩu để bảo vệ tài khoản. Quá trình này bắt buộc phải xác thực bảo mật thông qua mã OTP gửi về Email đã đăng ký.|

   **Mô tả chi tiết từng tác nhân**

      |**Tên tác nhân**|**Công việc/vai trò**|
      | :-: | :-: |
      |**Khách vãng lai (Guest)**|Người dùng truy cập vào hệ thống nhưng chưa có tài khoản hoặc chưa đăng nhập. Họ có quyền tự do tham quan trang chủ, tìm kiếm và lọc sản phẩm thời trang, đọc chi tiết mô tả hàng hóa, xem các sản phẩm liên quan và đọc tin tức/chương trình khuyến mãi. Tuy nhiên, họ không được phép thao tác đặt hàng, thêm giỏ hàng hay đánh giá. Muốn thực hiện giao dịch, họ buộc phải đăng ký/đăng nhập và xác thực bằng mã OTP.|
      |**Khách hàng (Customer)**|Là Khách vãng lai đã đăng ký và đăng nhập thành công. Họ có toàn quyền thực hiện các luồng mua sắm: thêm sản phẩm vào giỏ, tương tác Chatbot, đặt hàng, thanh toán (trực tuyến qua VNPay hoặc COD), theo dõi tiến trình giao hàng (qua API hãng vận chuyển), tích lũy/sử dụng ví xu thưởng. Sau khi nhận hàng thành công, họ có quyền gửi yêu cầu trả hàng/hoàn tiền và thực hiện quy trình đánh giá gộp (Sản phẩm, Shop và Đơn vị vận chuyển).|
      |**Người bán (Seller)**|Cá nhân/doanh nghiệp sở hữu gian hàng thời trang trên hệ thống. Đóng vai trò là nhà cung cấp hàng hóa, chịu trách nhiệm đăng tải sản phẩm (thiết lập các biến thể màu sắc, kích cỡ), trang trí gian hàng, tiếp nhận và xử lý đơn (hệ thống tự động đẩy đơn qua API GHTK/GHN). Đặc biệt, Seller quản lý Ví điện tử của shop để tạo lệnh rút doanh thu thực tế về tài khoản ngân hàng cá nhân.|
      |**Quản lý (Manager)**|*(Vai trò mới)* Là nhân sự cấp trung gian, cấp dưới của Admin. Đóng vai trò chuyên trách về mặt "Nội dung & Hàng hóa" của sàn: Thực hiện rà soát và kiểm duyệt hồ sơ đăng ký mở shop của Seller, kiểm duyệt tính thẩm mỹ/mô tả của các sản phẩm thời trang trước khi cho phép hiển thị, và xử lý vi phạm nội dung (ẩn sản phẩm vi phạm, tạm đình chỉ gian hàng).|
      |**Quản trị viên (Admin)**|Người quản lý cấp cao nhất của hệ thống nền tảng (Super Admin), kế thừa toàn bộ quyền hạn của Manager nhưng tập trung chuyên sâu vào mặt "Tài chính, Phân quyền & Trọng tài". Đóng vai trò quản lý vĩ mô: Quản lý tài chính (duyệt lệnh rút tiền của Seller, cấu hình phí sàn, tỷ lệ Xu), giải quyết tranh chấp (trọng tài khiếu nại giữa Khách và Seller), quản lý phân quyền (tạo tài khoản/cấp quyền cho Manager, khóa User), cấu hình giao diện/khuyến mãi toàn sàn và theo dõi nhật ký kiểm toán (Audit Log).|

      1. ### ***Use case 1***

         |**Thành phần**|**Chi tiết đặc tả**|
         | :- | :- |
         |**Use Case ID**|UC01|
         |**Use Case Name**|Khám phá nền tảng|
         |**Description**|Là một Người dùng (Khách vãng lai hoặc Khách hàng), tôi muốn tham quan trang chủ, tìm kiếm, lọc theo các thuộc tính thời trang và xem chi tiết sản phẩm để tìm được món hàng ưng ý.|
         |**Actor(s)**|Khách vãng lai (Guest), Khách hàng (Customer)|
         |**Priority**|Must Have|
         |**Trigger**|Người dùng truy cập vào URL của hệ thống UTEShop thông qua trình duyệt web.|
         |**Pre-Condition(s)**|Thiết bị của người dùng có kết nối Internet.|
         |**Post-Condition(s)**|Người dùng xem được các thông tin sản phẩm công khai trên nền tảng.|
         |**Basic Flow**|1\. Người dùng truy cập vào nền tảng.<br>2. Hệ thống hiển thị Trang chủ với các chiến dịch Khuyến mãi (Deals), Banner quảng cáo và Lưới danh mục thời trang nổi bật.<br>3. Người dùng nhập từ khóa vào thanh tìm kiếm hoặc sử dụng bộ lọc nâng cao (khoảng giá, màu sắc, kích cỡ, danh mục).<br>4. Hệ thống truy xuất dữ liệu và trả về danh sách các sản phẩm đáp ứng tiêu chí.<br>5. Người dùng nhấp chọn một sản phẩm cụ thể.<br>6. Hệ thống hiển thị màn hình Chi tiết sản phẩm bao gồm: hình ảnh, giá gốc, giá bán, mô tả, đánh giá (chỉ đọc) và danh sách các "Sản phẩm liên quan" ở cuối trang.|
         |**Alternative Flow**|**3a. Người dùng nhấp vào các liên kết thông tin tĩnh.**<br>3a1. Hệ thống điều hướng và hiển thị nội dung các trang: FAQ, Tin tức, Chính sách giao hàng, Chính sách hoàn trả.<br>*Use Case kết thúc.*|
         |**Exception Flow**|**4a. Hệ thống không tìm thấy sản phẩm nào khớp với từ khóa/bộ lọc.**<br>4a1. Hệ thống hiển thị thông báo "Không tìm thấy sản phẩm phù hợp" và gợi ý xóa bộ lọc.<br>*Use Case quay lại bước 3.*<br><br>**6b. Khách vãng lai (Guest) cố tình nhấn nút "Thêm vào giỏ hàng" hoặc "Mua ngay".**<br>6b1. Hệ thống chặn thao tác và hiển thị yêu cầu đăng nhập/đăng ký (bằng mã OTP qua Google Mail API).<br>*Use Case dừng lại.*|
         |**Business Rules**|- **BR01-1:** Mục "Sản phẩm liên quan" ở cuối trang bắt buộc phải truy xuất các sản phẩm có cùng danh mục (Level 3 Category) với sản phẩm đang xem.<br>- **BR01-2:** Khách vãng lai tuyệt đối không có quyền tạo Giỏ hàng, Wishlist hay Gửi đánh giá.|
         |**Non-Functional Requirement**|- **NFR01-1:** Tốc độ tải Trang chủ và Trang chi tiết sản phẩm phải dưới 2 giây dù có lưu lượng truy cập lớn.|

      2. ### ***Use case 2***

         |**Thành phần**|**Chi tiết đặc tả**|
         | :- | :- |
         |**Use Case ID**|UC02|
         |**Use Case Name**|Đăng ký tài khoản|
         |**Description**|Là một Khách vãng lai, tôi muốn đăng ký tài khoản thành viên và xác thực thông qua mã OTP (gửi qua Google Mail API) để có thể thực hiện các nghiệp vụ mua sắm trên sàn UTEShop.|
         |**Actor(s)**|Khách vãng lai (Guest)|
         |**Priority**|Must Have|
         |**Trigger**|Người dùng nhấn nút "Đăng ký" trên giao diện nền tảng.|
         |**Pre-Condition(s)**|Người dùng chưa đăng nhập. Thiết bị có kết nối Internet.|
         |**Post-Condition(s)**|Tài khoản được tạo thành công trong MongoDB, người dùng chuyển sang vai trò Khách hàng (ROLE\_CUSTOMER), được cấp JWT Token và điều hướng đến /user/profile hoặc Trang chủ.|
         |**Basic Flow**|1\. Người dùng chọn lệnh "Đăng ký".<br>2. Hệ thống hiển thị biểu mẫu yêu cầu cung cấp thông tin: Họ tên, Email, Mật khẩu.<br>3. Người dùng điền thông tin và nhấn "Đăng ký / Gửi mã OTP".<br>4. Hệ thống (NodeJS) kiểm tra **Validation** (Email chưa tồn tại, mật khẩu đủ mạnh) và **Rate Limiting** (để chống spam request).<br>5. Nếu hợp lệ, hệ thống tạo một tài khoản ở trạng thái *Inactive*, sinh mã OTP ngẫu nhiên lưu vào CSDL, và gọi **Google Mail API** gửi OTP về Email người dùng.<br>6. Hệ thống chuyển sang màn hình nhập mã xác thực.<br>7. Người dùng mở Email, lấy mã OTP nhập lên giao diện và nhấn "Xác nhận".<br>8. Hệ thống xác thực OTP. Nếu khớp, chuyển trạng thái tài khoản sang *Active*, cấp **JWT Token**.<br>9. Hệ thống thông báo thành công và tự động điều hướng người dùng (URL: /user/profile).|
         |**Alternative Flow**|**3a. Người dùng chọn lệnh "Đã có tài khoản? Đăng nhập":**<br>3a1. Hệ thống chuyển đổi biểu mẫu sang màn hình Đăng nhập.<br>*Use Case chuyển tiếp sang UC29 (Đăng nhập).*<br><br>**7a. Người dùng không nhận được Email và nhấn "Gửi lại mã OTP":**<br>7a1. Hệ thống kiểm tra Rate Limiting.<br>7a2. Hệ thống sinh mã OTP mới, hủy mã cũ và gọi lại Google Mail API.<br>*Use Case tiếp tục bước 6.*|
         |**Exception Flow**|**4a. Dữ liệu không hợp lệ hoặc bị chặn bởi Rate Limiting:**<br>4a1. Hệ thống báo lỗi (VD: "Email đã được sử dụng" hoặc "Thao tác quá nhanh, thử lại sau").<br>*Use Case dừng lại ở bước 3.*<br><br>**8b. Người dùng nhập sai OTP hoặc OTP đã hết hạn:**<br>8b1. Hệ thống hiển thị cảnh báo "Mã OTP không chính xác hoặc đã hết hạn".<br>*Use Case yêu cầu nhập lại ở bước 7.*|
         |**Business Rules**|- **BR02-1:** Mã OTP chỉ bao gồm 6 chữ số ngẫu nhiên và có thời gian hiệu lực giới hạn (VD: 5 phút).<br>- **BR02-2:** Địa chỉ Email đăng ký phải là duy nhất (Unique) trên toàn hệ thống.|
         |**Non-Functional Requirement**|- **NFR02-1:** Mật khẩu của người dùng bắt buộc phải được băm (Hash) một chiều (ví dụ dùng thư viện bcrypt) trước khi lưu vào MongoDB.<br>- **NFR02-2:** Quá trình gọi Google Mail API để gửi thư không được làm treo giao diện, thời gian phản hồi yêu cầu gửi mail phải dưới 5 giây.<br>- **NFR02-3:** Thiết lập Rate Limit chặn tối đa 3 lần yêu cầu gửi OTP / 1 địa chỉ Email / 15 phút để chống phá hoại (DDoS/Spam thư).|
      3. ### ***Use case 3***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC03|
         |**Use Case Name**|Quản lý Giỏ hàng|
         |**Description**|Là một Khách hàng, tôi muốn thêm sản phẩm thời trang (cùng lựa chọn về màu sắc, kích cỡ), thay đổi số lượng hoặc loại bỏ sản phẩm khỏi giỏ hàng để chuẩn bị cho bước thanh toán.|
         |**Actor(s)**|Khách hàng (Customer)|
         |**Priority**|Must Have|
         |**Trigger**|Khách hàng nhấn nút "Thêm vào giỏ" trên thẻ sản phẩm hoặc bấm vào biểu tượng Giỏ hàng ở góc màn hình.|
         |**Pre-Condition(s)**|Khách hàng đã đăng nhập vào hệ thống.|
         |**Post-Condition(s)**|Giỏ hàng được cập nhật chính xác số lượng món đồ và tổng số tiền cần thanh toán.|
         |**Basic Flow**|1\. Khách hàng chọn kích cỡ, màu sắc của một sản phẩm và nhấn "Thêm vào giỏ", hoặc truy cập thẳng vào trang Giỏ hàng để tăng/giảm số lượng món đồ đã chọn.<br>2. Hệ thống tự động kiểm tra xem sản phẩm đó trong kho của gian hàng có còn đủ số lượng hay không.<br>3. Nếu kho còn hàng, hệ thống cập nhật món đồ vào giỏ.<br>4. Hệ thống tự động tính toán lại tổng tiền hàng và tổng số lượng sản phẩm.<br>5. Hệ thống hiển thị thông báo nhỏ "Đã cập nhật giỏ hàng thành công" và màn hình giỏ hàng thay đổi ngay lập tức để khách hàng nhìn thấy kết quả.|
         |**Alternative Flow**|**1a. Khách hàng muốn xóa sản phẩm:**<br>1a1. Khách hàng nhấn vào biểu tượng thùng rác cạnh sản phẩm trong giỏ.<br>1a2. Hệ thống loại bỏ món hàng đó và tính lại tổng tiền.|
         |**Exception Flow**|**2a. Sản phẩm đã hết hàng hoặc không đủ số lượng:**<br>2a1. Khi khách hàng nhấn thêm hoặc tăng số lượng, hệ thống hiển thị thông báo cảnh báo "Rất tiếc, sản phẩm này chỉ còn lại X chiếc" hoặc "Đã hết hàng".<br>2a2. Hệ thống chặn thao tác thêm hàng vào giỏ.<br>*Use Case dừng lại.*|
         |**Business Rules**|- **BR03-1:** Mỗi khách hàng chỉ có duy nhất một giỏ hàng xuyên suốt quá trình sử dụng.<br>- **BR03-2:** Giỏ hàng có thể chứa nhiều sản phẩm từ nhiều gian hàng khác nhau.|
         |**Non-Functional Requirement**|- **NFR03-1:** Trải nghiệm thay đổi số lượng (+/-) hoặc xóa sản phẩm phải diễn ra vô cùng mượt mà, tổng tiền thay đổi ngay lập tức trên màn hình mà người dùng không cần phải chờ trang web tải lại.|
      4. ### ***Use case 4***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC04|
         |**Use Case Name**|Quản lý Danh sách yêu thích|
         |**Description**|Là một Khách hàng, tôi muốn thả tim (lưu lại) các sản phẩm thời trang mà tôi ưng ý vào một danh sách riêng để dễ dàng tìm lại và cân nhắc mua sắm trong tương lai.|
         |**Actor(s)**|Khách hàng (Customer)|
         |**Priority**|Should Have|
         |**Trigger**|Khách hàng nhấn vào biểu tượng "Trái tim" trên ảnh sản phẩm hoặc truy cập vào trang "Danh sách yêu thích".|
         |**Pre-Condition(s)**|Khách hàng đã đăng nhập vào hệ thống.|
         |**Post-Condition(s)**|Sản phẩm được lưu lại thành công hoặc gỡ bỏ khỏi danh sách yêu thích cá nhân.|
         |**Basic Flow**|1\. Khách hàng nhìn thấy một sản phẩm ưng ý và nhấn vào biểu tượng "Trái tim".<br>2. Hệ thống kiểm tra và ghi nhận sản phẩm này vào danh mục yêu thích của khách hàng.<br>3. Biểu tượng trái tim trên màn hình lập tức đổi sang màu nổi bật (ví dụ: màu đỏ) để đánh dấu thao tác thành công, kèm theo dòng chữ thông báo nhỏ "Đã lưu sản phẩm".|
         |**Alternative Flow**|**1a. Gỡ bỏ sản phẩm khỏi danh sách (từ trang sản phẩm):**<br>1a1. Khách hàng nhấn thêm một lần nữa vào biểu tượng trái tim đã đổi màu.<br>1a2. Hệ thống hiểu đây là lệnh gỡ bỏ, đưa trái tim về màu xám ban đầu và báo "Đã gỡ sản phẩm".<br>**1b. Quản lý trong trang Danh sách yêu thích:**<br>1b1. Khách hàng vào trang "Danh sách yêu thích" để xem toàn bộ các món đồ đã lưu.<br>1b2. Khách hàng nhấn dấu "X" góc màn hình sản phẩm để gỡ bỏ.|
         |**Exception Flow**|**2a. Kết nối mạng của khách hàng bị gián đoạn:**<br>2a1. Hệ thống báo lỗi "Không thể lưu sản phẩm lúc này, vui lòng kiểm tra kết nối mạng".|
         |**Business Rules**|- **BR04-1:** Mỗi sản phẩm chỉ xuất hiện đúng một lần trong danh sách yêu thích của khách hàng.|
         |**Non-Functional Requirement**|- **NFR04-1:** Thao tác "thả tim" phải mang lại cảm giác phản hồi ngay lập tức cho người dùng, tạo trải nghiệm tương tác tự nhiên và thích thú.|
      5. ### ***Use case 5***

         |**Thành phần**|**Chi tiết đặc tả**|
         | :- | :- |
         |**Use Case ID**|UC05|
         |**Use Case Name**|Đặt hàng và Thanh toán|
         |**Description**|Là một Khách hàng, tôi muốn chọn địa chỉ nhận hàng, phương thức thanh toán an toàn, và được hệ thống tự động áp dụng mã giảm giá tốt nhất để hoàn tất việc mua sắm một cách nhanh chóng.|
         |**Actor(s)**|Khách hàng (Customer)|
         |**Priority**|Must Have|
         |**Trigger**|Khách hàng nhấn nút "Tiến hành đặt hàng" tại trang Giỏ hàng.|
         |**Pre-Condition(s)**|Khách hàng đã đăng nhập và giỏ hàng đang có ít nhất 1 sản phẩm.|
         |**Post-Condition(s)**|Đơn đặt hàng được tạo thành công, hàng trong kho được giữ lại cho khách, và hệ thống thông báo đơn hàng cho các gian hàng tương ứng.|
         |**Basic Flow**|1\. Khách hàng bắt đầu bước thanh toán. Màn hình hiện ra với các khu vực: Chọn địa chỉ nhận hàng, Chọn phương thức thanh toán (Thẻ/VNPay hoặc Tiền mặt khi nhận hàng), và Danh sách món đồ.<br>2. Khách hàng lựa chọn một địa chỉ sẵn có và chọn cách thức thanh toán mong muốn.<br>3. Dựa trên tổng tiền và phí giao hàng, hệ thống tự động tìm và áp dụng mã giảm giá mang lại lợi ích lớn nhất cho khách hàng.<br>4. Khách hàng nhập số lượng Ví Xu muốn sử dụng để được trừ tiền trực tiếp.<br>5. Hệ thống hiển thị rành mạch tổng số tiền cuối cùng cần thanh toán.<br>6. Khách hàng nhấn nút "Xác nhận và Thanh toán".<br>7. Hệ thống tự động phân tách giỏ hàng thành các gói hàng nhỏ tương ứng với từng gian hàng (để các chủ gian hàng tự đóng gói).<br>8. Khách hàng hoàn tất việc chuyển tiền (qua màn hình an toàn của VNPay) hoặc xác nhận trả tiền mặt (COD).<br>9. Hệ thống hiển thị màn hình chúc mừng "Bạn đã đặt hàng thành công" và cung cấp mã theo dõi đơn hàng.|
         |**Alternative Flow**|**2a. Khách hàng muốn giao hàng tới địa chỉ khác:**<br>2a1. Khách hàng chọn "Thêm địa chỉ mới" ngay tại trang thanh toán.<br>2a2. Khách hàng điền thông tin và lưu lại. Hệ thống tự động chọn địa chỉ mới này và tính lại phí giao hàng.<br>**3a. Khách hàng muốn tự đổi mã giảm giá khác:**<br>3a1. Khách hàng nhấn "Chọn mã giảm giá khác", chọn một mã từ danh sách hoặc tự gõ mã ưu đãi vào và ấn Áp dụng.|
         |**Exception Flow**|**3a2. Khách hàng nhập sai mã giảm giá hoặc mã đã hết hạn:**<br>3a2.1. Hệ thống báo đỏ "Mã không hợp lệ hoặc chưa đủ điều kiện" và không cho áp dụng.<br>**8a. Thanh toán trực tuyến bị lỗi hoặc khách hàng tự ý thoát lúc đang quét mã VNPay:**<br>8a1. Hệ thống ghi nhận chưa nhận được tiền, thông báo giao dịch thất bại và đưa khách hàng quay lại màn hình đặt hàng để thử lại.|
         |**Business Rules**|- **BR05-1:** Mặc dù khách hàng mua đồ của nhiều gian hàng khác nhau trong cùng một giỏ, hệ thống vẫn chỉ yêu cầu khách thanh toán gộp 1 lần duy nhất cho tiện lợi. Việc chia đơn và chia tiền cho người bán sẽ do hệ thống tự lo liệu.<br>- **BR05-2:** Xu thưởng không được phép dùng để trả phí vận chuyển, chỉ được trừ vào tiền sản phẩm.|
         |**Non-Functional Requirement**|- **NFR05-1:** Trải nghiệm đặt hàng phải trơn tru, việc hệ thống tự tính lại tiền khi khách đổi địa chỉ hay nhập xu phải diễn ra tức thì, không có độ trễ gây khó chịu.<br>- **NFR05-2:** Quá trình thanh toán trực tuyến phải đảm bảo tiêu chuẩn bảo mật tuyệt đối, khách hàng luôn cảm thấy an tâm khi thao tác.|
      6. ### ***Use case 6***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC06|
         |**Use Case Name**|Theo dõi & Quản lý đơn hàng|
         |**Description**|Là một Khách hàng, tôi muốn xem lại danh sách các món đồ đã mua, biết được gói hàng của mình đang đi đến đâu, hoặc có thể hủy đơn nếu tôi lỡ đặt nhầm.|
         |**Actor(s)**|Khách hàng (Customer)|
         |**Priority**|Must Have|
         |**Trigger**|Khách hàng nhấn vào mục "Đơn hàng của tôi" trên menu cá nhân.|
         |**Pre-Condition(s)**|Khách hàng đã đăng nhập vào hệ thống.|
         |**Post-Condition(s)**|Khách hàng nắm rõ tình trạng món hàng. Nếu khách hủy đơn, hệ thống ghi nhận đơn đã bị hủy và trả lại số lượng áo quần vào kho của shop.|
         |**Basic Flow**|1\. Khách hàng vào mục "Đơn hàng của tôi".<br>2. Hệ thống hiển thị danh sách tất cả các đơn hàng cũ và mới, có thể chọn bộ lọc (Chờ lấy hàng, Đang giao, Đã giao, Đã hủy).<br>3. Khách hàng nhấn vào một đơn hàng đang chờ giao để xem chi tiết.<br>4. Hệ thống hiển thị một "Thanh tiến trình" trực quan với các mốc thời gian rõ ràng (Ví dụ: Đã đặt hàng -> Shop đang chuẩn bị -> Đã giao cho shipper -> Đang trên đường tới nhà bạn).<br>5. Khách hàng dễ dàng hình dung gói hàng đang ở giai đoạn nào mà không cần phải gọi điện hỏi shop.|
         |**Alternative Flow**|**3a. Khách hàng muốn hủy đơn hàng vừa đặt:**<br>3a1. Tại màn hình chi tiết đơn, khách hàng nhấn nút "Hủy đơn hàng".<br>3a2. Hệ thống hiện bảng hỏi "Bạn có chắc chắn muốn hủy đơn này không?".<br>3a3. Khách hàng nhấn "Đồng ý". Hệ thống lập tức đổi trạng thái sang "Đã hủy" và hiện thông báo thành công.|
         |**Exception Flow**|**3a1.1. Đơn hàng đã được shop giao cho shipper:**<br>3a1.2. Màn hình chi tiết đơn hàng sẽ tự động làm mờ (hoặc giấu đi) nút "Hủy đơn hàng". Khách hàng không thể bấm hủy được nữa vì hàng đã lên xe.|
         |**Business Rules**|- **BR06-1:** Trạng thái trên thanh tiến trình được hệ thống tự động lấy từ các đối tác giao hàng (như Giao Hàng Tiết Kiệm) về để hiển thị. Khách hàng cứ ở yên trên web của mình là xem được, không cần sang trang web khác.<br>- **BR06-2:** Chỉ cho phép khách tự bấm hủy đơn khi shop chưa gói xong hàng.|
         |**Non-Functional Requirement**|- **NFR06-1:** Lịch sử đơn hàng phải được lưu lại đầy đủ kể cả những đơn từ vài năm trước, để khách hàng muốn tìm mua lại món đồ cũ thì vẫn có thể xem lại dễ dàng.|
      7. ### ***Use case 7***

         |**Trường**|**Nội dung**|
         | - | - |
         |**Use Case ID**|UC07|
         |**Use Case Name**|Tương tác Chatbot AI|
         |**Description**|Là một Người dùng, tôi muốn chat bằng ngôn ngữ tự nhiên với trợ lý ảo AI để tìm hiểu tổng quan về hệ thống, xu hướng sản phẩm, hoặc tra cứu tình trạng đơn hàng/giỏ hàng cá nhân.|
         |**Actor(s)**|Khách vãng lai (Guest), Khách hàng (Customer)|
         |**Priority**|Should Have|
         |**Trigger**|Người dùng nhấp vào biểu tượng Chatbot nổi ở góc màn hình.|
         |**Pre-Condition(s)**|Hệ thống AI Server đang hoạt động bình thường.|
         |**Post-Condition(s)**|Người dùng nhận được câu trả lời chính xác dựa trên kho dữ liệu và ngữ cảnh định danh của hệ thống.|
         |**Basic Flow**|<p>1\. Người dùng mở khung Chatbot AI.</p><p>2\. Người dùng nhập câu hỏi bằng ngôn ngữ tự nhiên (Ví dụ: *"Nền tảng này bán gì?", "Sản phẩm nào đang hot nhất?",* hoặc *"Đơn hàng của tôi đâu?"*).</p><p>3\. Khách hàng nhấn Gửi.</p><p>4\. Hệ thống tiếp nhận, AI phân tích ý định (intent) của câu hỏi.</p><p>5\. Hệ thống nhận diện trạng thái đăng nhập và truy xuất dữ liệu phù hợp để trả lời.</p><p>6\. Chatbot phản hồi lại tin nhắn cho người dùng kèm theo thông tin chi tiết.</p>|
         |**Alternative Flow**|<p>2a. Người dùng đang ở trong trang Chi tiết Sản phẩm và mở Chatbot hỏi về sản phẩm đó (Ví dụ: *"Sản phẩm này tôi được giảm giá bao nhiêu?"*).</p><p>2a1. Hệ thống AI tự động bắt ngữ cảnh của ID sản phẩm đang xem và trả về đúng thông số % giảm giá, màu sắc của sản phẩm đó.</p>|
         |**Exception Flow**|<p>5a. Phân quyền dữ liệu cá nhân:</p><p>5a1. Khách vãng lai (Guest) đặt câu hỏi liên quan đến dữ liệu cá nhân (Giỏ hàng, Đơn hàng, Ví xu).</p><p>5a2. Chatbot từ chối trả lời, yêu cầu Người dùng phải Đăng nhập và hiển thị kèm nút "Đi đến trang Đăng nhập".</p><p>5b. AI không hiểu câu hỏi:</p><p>5b1. Câu hỏi nằm ngoài phạm vi dữ liệu hệ thống (Ví dụ: Hỏi về thời tiết).</p><p>5b2. Hệ thống phản hồi lại thông báo từ chối khéo léo và hướng dẫn khách hàng hỏi lại các vấn đề liên quan đến mua sắm.</p>|
         |**Business Rules**|<p>- **BR07-1:** Nếu là Khách vãng lai, Chatbot chỉ được phép truy xuất kho dữ liệu Public (Tổng quan hệ thống, FAQ, Sản phẩm tìm kiếm nhiều nhất, Khuyến mãi).</p><p>- **BR07-2:** Nếu là Khách hàng (đã đăng nhập), Chatbot được cấp thêm quyền truy xuất dữ liệu Private (Đơn hàng, Giỏ hàng, Lịch sử) thuộc sở hữu của chính User đó.</p>|
         |**Non-Functional Requirement**|- **NFR07-1:** Thời gian phản hồi của Chatbot AI (AI processing time) không được vượt quá 3 giây để đảm bảo tính thời gian thực.|
      8. ### ***Use case 8***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC08|
         |**Use Case Name**|Đánh giá gộp đơn hàng|
         |**Description**|Là một Khách hàng, sau khi nhận hàng xong, tôi muốn để lại nhận xét (từ chất vải, form dáng đến thái độ của shop và shipper) trên cùng một biểu mẫu duy nhất cho tiện lợi.|
         |**Actor(s)**|Khách hàng (Customer)|
         |**Priority**|High|
         |**Trigger**|Khách hàng nhấn nút "Viết đánh giá" kế bên món hàng vừa nhận.|
         |**Pre-Condition(s)**|Khách hàng đã đăng nhập và hệ thống ghi nhận gói hàng đã giao thành công.|
         |**Post-Condition(s)**|Bài đánh giá được đăng lên mạng, điểm số uy tín của shop và sản phẩm được hệ thống cập nhật mới.|
         |**Basic Flow**|1\. Khách hàng nhấn "Viết đánh giá".<br>2. Màn hình hiện ra một trang Đánh giá gộp duy nhất chia làm 3 khu vực rõ ràng.<br>3. Ở khu vực Sản phẩm: Khách hàng bấm chọn số sao (từ 1 đến 5), gõ vài dòng nhận xét về chất liệu/màu sắc, và bấm nút tải lên vài tấm ảnh mình mặc thử đồ.<br>4. Ở khu vực Shop: Khách chọn sao đánh giá khâu đóng gói và chăm sóc của shop.<br>5. Ở khu vực Vận chuyển: Khách chọn sao đánh giá sự nhiệt tình của shipper.<br>6. Khách hàng nhấn "Gửi đánh giá".<br>7. Hệ thống hiện màn hình cảm ơn vì đã để lại nhận xét.|
         |**Alternative Flow**|*Quy trình đi thẳng từ đầu đến cuối trên một màn hình để mang lại trải nghiệm nhanh gọn nhất cho khách hàng.*|
         |**Exception Flow**|**6a. Khách hàng quên chọn số sao mà đã bấm Gửi:**<br>6a1. Khung đánh giá chưa chọn sao sẽ bị bôi đỏ kèm dòng chữ "Bạn quên chọn số sao đánh giá phần này rồi nè!". Màn hình tự động cuộn đến chỗ bị thiếu để khách chọn bổ sung.<br>**6b. Hình ảnh tải lên quá nặng:**<br>6b1. Hệ thống báo khéo "Tấm ảnh này hơi nặng, bạn chọn ảnh khác nhỏ hơn nhé" và không cho tải ảnh đó lên.|
         |**Business Rules**|- **BR08-1:** Chỉ khi shipper giao hàng thành công, nút "Viết đánh giá" mới sáng lên. Tránh việc khách chưa cầm đồ trên tay mà đã vào chê bai.<br>- **BR08-2:** Khách hàng chỉ được đánh giá mỗi món đồ đúng 1 lần.|
         |**Non-Functional Requirement**|- **NFR08-1:** Thao tác chọn sao, chèn ảnh phải rất mượt mà. Đánh giá gửi đi xong là ngay lập tức số sao trung bình trên trang sản phẩm được cộng trừ lại mà khách không cần đợi trang web tải lại.|
      9. ### ***Use case 9***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC09|
         |**Use Case Name**|Yêu cầu Trả hàng & Hoàn tiền|
         |**Description**|Là một Khách hàng, nếu lỡ nhận phải cái áo bị rách hay nhầm size, tôi muốn gửi yêu cầu trả hàng để lấy lại tiền, và có thể nhờ Ban quản lý can thiệp nếu shop cố tình trốn tránh.|
         |**Actor(s)**|Khách hàng (Customer)|
         |**Priority**|High|
         |**Trigger**|Khách hàng nhấn nút "Trả hàng/Hoàn tiền" ở đơn hàng bị lỗi.|
         |**Pre-Condition(s)**|Đơn hàng đã giao thành công và vẫn còn nằm trong thời hạn cho phép đổi trả (ví dụ: trong vòng 7 ngày).|
         |**Post-Condition(s)**|Đơn hàng chuyển sang trạng thái chờ giải quyết, số tiền mua hàng tạm thời bị giữ lại (chưa chuyển cho shop) để chờ làm rõ.|
         |**Basic Flow**|1\. Khách hàng vào lịch sử đơn hàng, chọn cái áo bị lỗi và nhấn "Trả hàng/Hoàn tiền".<br>2. Màn hình hiện ra một biểu mẫu yêu cầu.<br>3. Khách hàng tích chọn lý do (Ví dụ: "Hàng bị lỗi rách", "Giao sai màu"), gõ thêm vài dòng mô tả và bắt buộc tải lên video/hình ảnh lúc bóc gói hàng làm bằng chứng.<br>4. Khách hàng nhấn "Gửi yêu cầu".<br>5. Màn hình hiện thông báo đã gửi cho shop, dặn khách hàng giữ điện thoại chờ shop liên hệ lại.<br>6. (Khi shop đồng ý) Khách hàng nhận được thông báo gói hàng lại đưa cho shipper, tiền sẽ tự động được hoàn về tài khoản.|
         |**Alternative Flow**|**6a. Shop từ chối nhận lỗi (Khiếu nại lên Ban quản lý):**<br>6a1. Khách hàng nhận được thông báo shop từ chối trả hàng.<br>6a2. Ngay bên dưới có nút "Khiếu nại lên Quản trị viên". Khách hàng bực mình và bấm vào nút này.<br>6a3. Hệ thống báo: "Ban quản trị đã nhận được vụ việc của bạn. Chúng tôi sẽ xem xét bằng chứng và đưa ra quyết định cuối cùng sớm nhất!". Lúc này, admin sẽ nhảy vào làm trọng tài phân xử.|
         |**Exception Flow**|**1a. Đơn hàng đã nhận quá 7 ngày:**<br>1a1. Nút "Trả hàng/Hoàn tiền" biến mất hoàn toàn. Khách hàng không thể tạo yêu cầu được nữa.|
         |**Business Rules**|- **BR09-1:** Bắt buộc phải có ảnh hoặc video làm bằng chứng thì nút "Gửi yêu cầu" mới sáng lên cho bấm.<br>- **BR09-2:** Khi vụ việc đã đưa ra cho Ban quản lý (Admin) giải quyết, thì quyết định của Admin là phán quyết cuối cùng, khách hàng không thể khiếu nại thêm.|
         |**Non-Functional Requirement**|- **NFR09-1:** Do khách hàng phải tải lên video quay lại cảnh bóc hàng (thường khá nặng), màn hình phải có một thanh chạy báo % tải lên để khách biết mạng không bị đơ.|
      10. ### ***Use case 10***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC10|
         |**Use Case Name**|Cập nhật thông tin cá nhân|
         |**Description**|Là một Khách hàng, tôi muốn chỉnh sửa thông tin liên lạc của mình để hệ thống lưu giữ thông tin chính xác, hỗ trợ tốt cho việc nhận hàng và chăm sóc khách hàng.|
         |**Actor(s)**|Khách hàng (Customer)|
         |**Priority**|Must Have|
         |**Trigger**|Khách hàng mở mục "Tài khoản của tôi" và chọn phần "Hồ sơ cá nhân".|
         |**Pre-Condition(s)**|Khách hàng đã đăng nhập.|
         |**Post-Condition(s)**|Thông tin mới được lưu lại và hiển thị đồng bộ trên toàn bộ giao diện của khách hàng.|
         |**Basic Flow**|1\. Khách hàng vào phần "Hồ sơ cá nhân".<br>2. Màn hình hiện ra biểu mẫu chứa các thông tin hiện tại.<br>3. Khách hàng xóa thông tin cũ và gõ thông tin mới (Ví dụ: Đổi tên, đổi số điện thoại).<br>4. Khách hàng nhấn "Lưu thay đổi".<br>5. Hệ thống kiểm tra xem các thông tin nhập vào có hợp lệ không.<br>6. Hệ thống ghi nhận thông tin mới.<br>7. Màn hình hiện thông báo "Cập nhật thành công", tên mới của khách hàng lập tức thay đổi ở góc màn hình mà không cần tải lại trang.|
         |**Alternative Flow**|*(Khách hàng thao tác trực tiếp trên một biểu mẫu duy nhất, không có nhánh rẽ).*|
         |**Exception Flow**|**5a. Khách hàng để trống tên hoặc gõ sai định dạng số điện thoại:**<br>5a1. Ô nhập liệu bị khoanh đỏ kèm dòng chữ "Vui lòng nhập đúng số điện thoại" và hệ thống không cho phép lưu.<br>*Use Case yêu cầu nhập lại ở bước 3.*|
         |**Business Rules**|- **BR10-1:** Riêng ô Email sẽ bị làm mờ (không cho phép sửa) vì đây là thông tin cố định dùng để đăng nhập và nhận mã bảo mật.|
         |**Non-Functional Requirement**|- **NFR10-1:** Cảm giác sau khi bấm "Lưu thay đổi" phải mượt mà, tên người dùng thay đổi ngay lập tức ở mọi nơi trên giao diện.|
      11. ### ***Use case 11***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC11|
         |**Use Case Name**|Quản lý Địa chỉ|
         |**Description**|Là một Khách hàng, tôi muốn lưu sẵn nhiều địa chỉ nhận hàng (nhà riêng, cơ quan) vào sổ địa chỉ để khi mua sắm có thể chọn nhanh mà không phải gõ lại từ đầu.|
         |**Actor(s)**|Khách hàng (Customer)|
         |**Priority**|Must Have|
         |**Trigger**|Khách hàng vào mục "Sổ địa chỉ" trong phần quản lý tài khoản.|
         |**Pre-Condition(s)**|Khách hàng đã đăng nhập.|
         |**Post-Condition(s)**|Địa chỉ mới được lưu lại, cập nhật hoặc xóa thành công khỏi sổ.|
         |**Basic Flow**|1\. Khách hàng mở "Sổ địa chỉ".<br>2. Màn hình hiện ra các tấm thẻ ghi rõ các địa chỉ đã lưu.<br>3. Khách hàng nhấn "Thêm địa chỉ mới" (hoặc nhấn "Chỉnh sửa" trên một địa chỉ cũ).<br>4. Màn hình hiện ra biểu mẫu. Khách hàng chọn Tỉnh, Thành phố, Quận Huyện từ danh sách gợi ý có sẵn và gõ số nhà.<br>5. Khách nhấn "Lưu địa chỉ".<br>6. Hệ thống thêm tấm thẻ địa chỉ mới vào danh sách và báo thành công.|
         |**Alternative Flow**|**1a. Thêm địa chỉ lúc đang mua hàng:**<br>1a1. Khách hàng không cần vào Sổ địa chỉ mà có thể bấm "Thêm địa chỉ mới" ngay tại màn hình Đặt hàng và Thanh toán. Hệ thống vẫn lưu lại vào sổ cho các lần sau.|
         |**Exception Flow**|**3a. Khách hàng bấm xóa một địa chỉ đang được dùng cho đơn hàng chưa giao xong:**<br>3a1. Hệ thống hiện bảng cảnh báo: "Địa chỉ này đang có đơn hàng chờ giao, bạn không thể xóa lúc này" để đảm bảo shipper không bị mất thông tin giao hàng.|
         |**Business Rules**|- **BR11-1:** Khách hàng được phép lưu không giới hạn số lượng địa chỉ, nhưng luôn phải có 1 địa chỉ được đánh dấu là "Mặc định".|
         |**Non-Functional Requirement**|- **NFR11-1:** Khi khách hàng chọn Tỉnh/Thành phố, danh sách Quận/Huyện tương ứng phải hiện ra ngay lập tức mà không có độ trễ.|
      12. ### ***Use case 12***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC12|
         |**Use Case Name**|Theo dõi ví xu|
         |**Description**|Là một Khách hàng, tôi muốn xem mình đang có bao nhiêu xu và lịch sử nhận/tiêu xu để tính toán dùng cho lần mua sắm tiếp theo.|
         |**Actor(s)**|Khách hàng (Customer)|
         |**Priority**|Should Have|
         |**Trigger**|Khách hàng bấm vào mục "Ví Xu" trong tài khoản cá nhân.|
         |**Pre-Condition(s)**|Khách hàng đã đăng nhập.|
         |**Post-Condition(s)**|Khách hàng nắm rõ dòng tiền xu của mình.|
         |**Basic Flow**|1\. Khách hàng mở mục "Ví Xu".<br>2. Màn hình hiện ra một thẻ lớn ghi rõ "Tổng số dư Xu hiện tại".<br>3. Ngay bên dưới là một danh sách lịch sử. Khách hàng có thể đọc được ngày giờ, số xu được cộng (màu xanh) nhờ mua hàng, hoặc số xu đã trừ (màu đỏ) do dùng để giảm giá.<br>4. Khách hàng xem xong và chuyển sang màn hình khác.|
         |**Alternative Flow**|*(Chỉ là màn hình tra cứu, không có luồng thay thế).*|
         |**Exception Flow**|**2a. Khách hàng chưa từng mua hàng nên chưa có xu:**<br>2a1. Màn hình báo số dư "0" và hiện một hình ảnh vui nhộn kèm dòng chữ "Bạn chưa có xu nào, hãy mua sắm để tích lũy ngay nhé!".|
         |**Business Rules**|- **BR12-1:** Khách hàng chỉ được phép XEM lịch sử, hệ thống sẽ tự động làm nhiệm vụ cộng/trừ xu vào ví sau mỗi lần đơn hàng giao thành công hoặc thanh toán.|
         |**Non-Functional Requirement**|- **NFR12-1:** Lịch sử biến động ví xu phải luôn sắp xếp theo thứ tự thời gian từ mới nhất đến cũ nhất để khách dễ theo dõi.|
      13. ### ***Use case 13***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC13|
         |**Use Case Name**|Chat trực tuyến|
         |**Description**|Là một Khách hàng (hoặc Người bán), tôi muốn nhắn tin trực tiếp với đối phương để hỏi về size áo, chất vải hay tình trạng đóng gói đơn hàng một cách nhanh chóng.|
         |**Actor(s)**|Khách hàng, Người bán|
         |**Priority**|Must Have|
         |**Trigger**|Khách hàng nhấn "Chat với shop" ở góc màn hình, hoặc Chủ shop nhấn "Trả lời" trong bảng quản lý.|
         |**Pre-Condition(s)**|Cả hai bên đều đang có tài khoản và đăng nhập.|
         |**Post-Condition(s)**|Đoạn chat được lưu lại để có bằng chứng giải quyết khiếu nại sau này.|
         |**Basic Flow**|1\. Khách hàng bấm vào nút Chat. Một khung cửa sổ nhắn tin nhỏ hiện lên.<br>2. Khách hàng gõ câu hỏi: "Shop ơi áo này cao 1m6 mặc vừa không?" và bấm Gửi.<br>3. Ở phía bên kia, điện thoại/máy tính của Chủ shop ngay lập tức kêu "Ting" và hiện tin nhắn của khách.<br>4. Chủ shop bấm vào xem và gõ câu trả lời.<br>5. Trên màn hình của Khách hàng hiện dòng chữ "Shop đang gõ...".<br>6. Ngay sau đó, câu trả lời của Shop hiện lên màn hình khách hàng ngay lập tức mà khách không cần phải bấm làm mới trang web.|
         |**Alternative Flow**|**1a. Shop chủ động nhắn trước:**<br>1a1. Khi gói hàng phát hiện hết màu khách chọn, Chủ shop mở đơn hàng ra, bấm "Nhắn cho khách" và xin lỗi khách. Luồng trả lời của khách diễn ra y hệt bước 3, 4, 5, 6.|
         |**Exception Flow**|**2a. Mạng của khách hàng bị rớt khi đang nhắn:**<br>2a1. Khung chat hiện dòng chữ vàng "Đang mất mạng, chờ chút nhé...". Chữ khách vừa gửi sẽ mờ đi (chưa tới được shop).<br>2a2. Khi có mạng lại, hệ thống tự động gửi tin nhắn đi và chuyển sang màu rõ nét.|
         |**Business Rules**|- **BR13-1:** Cuộc trò chuyện là hoàn toàn riêng tư giữa khách và shop.|
         |**Non-Functional Requirement**|- **NFR13-1:** Cảm giác nhắn tin phải trơn tru, tức thì y hệt như đang sử dụng các ứng dụng chat phổ biến (như Zalo, Messenger), tuyệt đối không có độ trễ.|
      14. ### ***Use case 14***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC14|
         |**Use Case Name**|Quản lý Hồ sơ và Gian hàng|
         |**Description**|Là một Người bán, tôi muốn trang trí cho cửa hàng của mình (Logo, ảnh bìa) và khai báo đúng số tài khoản ngân hàng để hệ thống chuyển tiền bán hàng cho tôi.|
         |**Actor(s)**|Người bán (Seller)|
         |**Priority**|Must Have|
         |**Trigger**|Người bán mở mục "Hồ sơ gian hàng" trong Bảng quản lý.|
         |**Pre-Condition(s)**|Người bán đã đăng nhập.|
         |**Post-Condition(s)**|Thông tin cửa hàng được cập nhật để khách hàng có thể nhìn thấy, và hệ thống có cơ sở để trả tiền cho chủ shop.|
         |**Basic Flow**|1\. Chủ shop mở trang Hồ sơ gian hàng.<br>2. Màn hình hiện ra các khu vực nhập liệu: Tên Shop, Thông tin doanh nghiệp, Số tài khoản ngân hàng thụ hưởng, và Địa chỉ kho lấy hàng.<br>3. Chủ shop gõ các thông tin cần thiết vào ô trống.<br>4. Chủ shop bấm chọn tải lên một tấm ảnh làm Logo và một tấm làm Ảnh bìa (Banner) trang trí.<br>5. Chủ shop nhấn "Lưu thay đổi".<br>6. Hệ thống lưu lại các thông tin này và báo "Cập nhật shop thành công".|
         |**Alternative Flow**|**6a. Chủ shop muốn xem thử diện mạo cửa hàng:**<br>6a1. Chủ shop bấm nút "Xem thử cửa hàng". Màn hình sẽ hiển thị ra đúng giao diện mà khách hàng sẽ nhìn thấy khi ghé thăm shop (với logo và ảnh bìa vừa thay đổi).|
         |**Exception Flow**|**5a. Chủ shop bỏ trống phần Số tài khoản ngân hàng hoặc Địa chỉ kho:**<br>5a1. Hệ thống không cho lưu và cảnh báo: "Bạn phải nhập địa chỉ kho để shipper tới lấy hàng, và số tài khoản để sàn chuyển tiền cho bạn nhé!".|
         |**Business Rules**|- **BR14-1:** Thông tin ngân hàng và mã số thuế là bắt buộc phải có, nếu không hệ thống sẽ không cho phép rút tiền mặt từ Ví điện tử.|
         |**Non-Functional Requirement**|- **NFR14-1:** Giao diện tải ảnh logo và ảnh bìa phải cho phép chủ shop cắt, chỉnh khung hình (Crop) ngay trên web để ảnh hiển thị đẹp nhất.|
      15. ### ***Use case 15***

         |**Trường**|**Nội dung**|
         | - | - |
         |**Use Case ID**|UC15|
         |**Use Case Name**|Quản lý Kho sản phẩm|
         |**Description**|Là một Người bán, tôi muốn đăng tải sản phẩm mới hoặc cập nhật giá bán, số lượng tồn kho để hàng hóa có thể được hiển thị tới Khách hàng.|
         |**Actor(s)**|Người bán (Seller)|
         |**Priority**|Must Have|
         |**Trigger**|Người bán chọn "Add Product" (Thêm sản phẩm) hoặc "Update Stock" (Cập nhật kho) tại trang Quản lý sản phẩm.|
         |**Pre-Condition(s)**|Tài khoản Người bán phải ở trạng thái được phê duyệt (ACTIVE).|
         |**Post-Condition(s)**|Sản phẩm được lưu vào hệ thống và chuyển trạng thái thành chờ kiểm duyệt.|
         |**Basic Flow**|<p>1\. Người bán chọn lệnh "Thêm sản phẩm mới".</p><p>2\. Hệ thống hiển thị biểu mẫu thông tin Sản phẩm.</p><p>3\. Người bán chọn Danh mục phân cấp cho sản phẩm (Level 1, Level 2, Level 3).</p><p>4\. Người bán điền Tiền gốc (MRP) và Giá bán thực tế (Selling Price). Hệ thống tự động tính toán % Giảm giá dựa trên 2 mức giá này.</p><p>5\. Người bán cung cấp Tên sản phẩm, Mô tả, Kích cỡ, Màu sắc và Số lượng tồn kho (Quantity).</p><p>6\. Người bán tải lên các hình ảnh thực tế của sản phẩm (tối đa 4-5 ảnh).</p><p>7\. Người bán nhấn lệnh "Đăng sản phẩm".</p><p>8\. Hệ thống ghi nhận sản phẩm vào cơ sở dữ liệu. Sản phẩm mặc định được đẩy vào trạng thái "Chờ duyệt" (Pending Approval).</p>|
         |**Alternative Flow**|<p>**1a. Cập nhật tồn kho (Update Stock):**</p><p>1a1. Tại lưới danh sách Sản phẩm hiện có, Người bán chỉnh sửa trực tiếp con số tồn kho và nhấn icon "Update".</p><p>1a2. Hệ thống cập nhật nhanh tồn kho hiện tại (In-stock) và hiển thị lại lưới mà không cần tải trang.</p>|
         |**Exception Flow**|<p>**4a.** Người bán điền Giá bán thực tế (Selling Price) LỚN HƠN Giá gốc (MRP).</p><p>**4a1.** Hệ thống báo lỗi logic "Giá bán không được lớn hơn giá gốc" và chặn nút lưu.</p><p>**6a.** Quá trình upload ảnh lên máy chủ Cloudinary thất bại do lỗi mạng.<br>**6a1.** Vòng xoay tiến trình (Circular Progress) báo lỗi và yêu cầu Người bán chọn lại ảnh.</p>|
         |**Business Rules**|<p>- **BR15-1 (QĐ\_SL2):** Mỗi sản phẩm bắt buộc phải được gắn vào đúng 1 Cây danh mục Level 3 (Ví dụ: Men -> Topwear -> T-Shirt). Khách hàng sẽ dùng ID danh mục này để lọc sản phẩm tại Trang chủ (UC01).</p><p>- **BR15-2 (QĐ\_AD11):** Để bảo vệ nền tảng, mọi sản phẩm tạo mới đều ở trạng thái ẩn (PENDING). Chỉ khi Admin (Quản trị viên) phê duyệt ở UC20, sản phẩm mới được hiển thị công khai trên gian hàng.</p>|
         |**Non-Functional Requirement**|- **NFR15-1:** Khi người bán thay đổi giá tiền ở bước 4, % Giảm giá phải được tự động tính toán bằng JavaScript trên giao diện (Client-side) ngay lập tức theo thời gian thực.|
      16. ### ***Use case 16***

         |**Trường**|**Nội dung**|
         | - | - |
         |**Use Case ID**|UC16|
         |**Use Case Name**|Xử lý Đơn hàng & Vận chuyển|
         |**Description**|Là một Người bán, tôi muốn tiếp nhận đơn đặt hàng, xác nhận đóng gói và kết xuất mã vận đơn để tiến hành giao hàng cho khách.|
         |**Actor(s)**|Người bán (Seller)|
         |**Priority**|Must Have|
         |**Trigger**|Người bán truy cập vào tab "Orders" (Đơn hàng) để xem các đơn hàng vừa được khách đặt.|
         |**Pre-Condition(s)**|Có đơn hàng phát sinh thuộc về mã gian hàng của Seller đó.|
         |**Post-Condition(s)**|Trạng thái đơn hàng thay đổi, Mã vận đơn được sinh ra để hai bên cùng tra cứu.|
         |**Basic Flow**|<p>1\. Người bán truy cập tab Quản lý đơn hàng. Hệ thống hiển thị danh sách các đơn hàng theo lưới (Có thể phân bộ lọc: Mới đặt, Chờ lấy hàng, Đang giao...).</p><p>2\. Người bán nhấn vào một đơn hàng Mới (Trạng thái: PLACED) và chọn hành động "Xác nhận đơn" (Confirm).</p><p>3\. Trạng thái đơn hàng chuyển sang CONFIRMED (Đã xác nhận).</p><p>4\. Người bán tiến hành đóng gói, sau đó chọn lệnh "Đẩy đơn vận chuyển" (Ship Order).</p><p>5\. Hệ thống Back-end tự động gọi API giao tiếp với đối tác vận chuyển (VD: GHTK, Grab) truyền đi thông tin Khách hàng và Địa chỉ kho Seller (Pickup Address).</p><p>6\. API vận chuyển trả về Mã vận đơn (Tracking ID). Hệ thống lưu mã này vào Đơn hàng, đổi trạng thái thành SHIPPED (Đang giao).</p><p>7\. Người bán chọn lệnh "In phiếu giao hàng", hệ thống tự động kết xuất (Generate) tài liệu PDF mã vạch để Seller dán lên gói hàng.</p>|
         |**Alternative Flow**|6a. Cập nhật qua Webhook: Sau khi hàng được đẩy đi ở bước 6, người bán không cần tác động thủ công nữa. Khi Shipper giao hàng thành công, hệ thống của ĐVVC sẽ tự bắn API (Webhook) về máy chủ E-commerce để đổi trạng thái đơn hàng sang DELIVERED (Đã giao).|
         |**Exception Flow**|<p>5a. API kết nối với Đơn vị vận chuyển gặp sự cố (Timeout) hoặc Địa chỉ kho lấy hàng của Seller không hợp lệ.</p><p>5a1. Hệ thống báo lỗi "Kết nối hãng vận chuyển thất bại. Vui lòng thử lại sau" và giữ nguyên trạng thái đơn ở mức CONFIRMED.</p>|
         |**Business Rules**|<p>- **BR16-1 (QĐ\_SL3):** Việc kết nối tạo mã vận đơn (Tracking ID) là quy trình xử lý tự động (Automation). Seller không được tự nhập tay mã tracking để tránh gian lận đối soát phí ship.</p><p>- **BR16-2 (QĐ\_SL4):** Phiếu giao hàng (Vận đơn PDF) bắt buộc chứa Barcode/QR Code của ĐVVC để tài xế có thể dùng máy quét tít mã lấy hàng.</p>|
         |**Non-Functional Requirement**|- **NFR16-1:** Vì thao tác kết nối với hãng giao hàng có thể mất 1-2 giây, màn hình phải hiện vòng xoay "Đang xử lý..." để người bán không bấm liên tục nhiều lần sinh ra lỗi nhiều mã vận đơn cho 1 gói hàng.|
      17. ### ***Use case 17***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC17|
         |**Use Case Name**|Rút tiền Ví điện tử (Wallet)|
         |**Description**|Là một Người bán, sau khi các đơn hàng đã được giao thành công, tôi muốn rút số tiền mình kiếm được từ Ví điện tử về tài khoản ngân hàng cá nhân.|
         |**Actor(s)**|Người bán (Seller)|
         |**Priority**|High|
         |**Trigger**|Người bán nhấn nút "Rút tiền" trong khu vực Ví điện tử.|
         |**Pre-Condition(s)**|Ví điện tử của shop phải có số dư lớn hơn mức tối thiểu cho phép rút.|
         |**Post-Condition(s)**|Một lệnh rút tiền được gửi đến Quản trị viên (Admin) chờ duyệt.|
         |**Basic Flow**|1\. Người bán vào mục "Ví điện tử" trên bảng điều khiển.<br>2. Màn hình hiển thị số dư khả dụng (Số tiền có thể rút) và thông tin tài khoản ngân hàng thụ hưởng (đã điền ở phần Hồ sơ).<br>3. Người bán nhập số tiền mình muốn rút ra.<br>4. Người bán nhấn "Tạo lệnh rút tiền".<br>5. Hệ thống kiểm tra xem số tiền muốn rút có hợp lệ không.<br>6. Màn hình hiện thông báo "Đã gửi yêu cầu rút tiền thành công. Vui lòng chờ Ban quản trị đối soát và chuyển khoản".<br>7. Yêu cầu rút tiền này được ghi nhận lại trong Lịch sử giao dịch với trạng thái "Đang chờ duyệt".|
         |**Alternative Flow**|*Không có. Quy trình đi theo một đường thẳng để đảm bảo an toàn dòng tiền.*|
         |**Exception Flow**|**5a. Người bán gõ số tiền rút lớn hơn số dư đang có trong ví:**<br>5a1. Màn hình bôi đỏ báo lỗi "Số tiền rút không được vượt quá số dư hiện tại của bạn".<br>*Use Case dừng lại ở bước 3.*|
         |**Business Rules**|- **BR17-1:** Chỉ những khoản tiền từ các đơn hàng đã nằm gọn trong trạng thái "Đã giao thành công" và đã qua thời hạn khách được phép trả hàng (ví dụ: qua 7 ngày) mới được hệ thống mở khóa biến thành "Số dư khả dụng" để rút.<br>- **BR17-2:** Tiền sẽ không về ngay thẻ ngân hàng mà phải chờ Admin thao tác chuyển khoản thủ công bên ngoài, sau đó Admin bấm duyệt thì tiền trong Ví web mới bị trừ đi.|
         |**Non-Functional Req**|- **NFR17-1:** Mọi lệnh rút tiền, dù thành công hay đang chờ, đều phải được lưu trữ vĩnh viễn và không bao giờ được phép xóa khỏi Lịch sử giao dịch để đối soát kế toán.|
      18. ### ***Use case 18***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC18|
         |**Use Case Name**|Xử lý Yêu cầu Hoàn trả|
         |**Description**|Là một Người bán, tôi muốn xem xét lý do và bằng chứng từ Khách hàng để quyết định chấp nhận cho trả lại hàng hay từ chối yêu cầu hoàn tiền.|
         |**Actor(s)**|Người bán (Seller)|
         |**Priority**|Must Have|
         |**Trigger**|Người bán nhấn vào mục "Yêu cầu trả hàng" trên bảng điều khiển.|
         |**Pre-Condition(s)**|Có ít nhất một đơn hàng đang bị khách yêu cầu trả lại.|
         |**Post-Condition(s)**|Yêu cầu được giải quyết, hệ thống thông báo cho khách hàng và tự động xử lý trả tiền nếu được chấp nhận.|
         |**Basic Flow**|1\. Người bán mở danh sách các yêu cầu trả hàng đang chờ xử lý.<br>2. Người bán nhấn vào một yêu cầu để xem chi tiết: Lý do khách chọn (VD: Áo bị rách), nội dung phàn nàn và xem video khách quay lúc bóc hàng.<br>3. Người bán kiểm tra và nhận thấy lỗi đúng là do bên mình, nhấn nút "Chấp nhận hoàn trả".<br>4. Hệ thống hiện thông báo hướng dẫn Khách hàng đóng gói gửi hàng về lại kho của shop.<br>5. Khi người bán nhận lại được gói đồ, nhấn nút "Đã nhận được hàng".<br>6. Hệ thống tự động chuyển tiền trả lại cho Khách hàng và cập nhật đơn hàng thành "Đã hoàn tiền".|
         |**Alternative Flow**|**3a. Người bán thấy bằng chứng không thuyết phục hoặc khách tự làm hỏng đồ:**<br>3a1. Người bán nhấn nút "Từ chối".<br>3a2. Màn hình hiện ra một khung trống, yêu cầu người bán bắt buộc nhập lý do từ chối (VD: "Trong video bóc hàng áo không bị rách, vết này do kéo cắt").<br>3a3. Người bán nhấn xác nhận.<br>3a4. Hệ thống báo kết quả từ chối này cho Khách hàng biết (kèm theo nút để khách hàng có thể gọi Ban quản lý vào phân xử).|
         |**Exception Flow**|**1a. Vượt quá thời hạn quy định:**<br>1a1. Nếu sau 3 ngày mà người bán không chịu bấm Chấp nhận hay Từ chối, hệ thống sẽ cảnh báo vi phạm thời gian phản hồi, gây ảnh hưởng đến điểm uy tín của gian hàng.|
         |**Business Rules**|- **BR18-1:** Người bán bắt buộc phải ghi rõ lý do nếu muốn từ chối yêu cầu của khách để Ban quản lý có cơ sở phân xử sau này.|
         |**Non-Functional Req**|- **NFR18-1:** Hình ảnh và video bằng chứng của khách hàng gửi lên phải phát được mượt mà, phóng to thu nhỏ trực tiếp trên màn hình của người bán mà không bắt người bán phải tải tệp tin về máy.|
      19. ### ***Use case 19***

         |**Trường**|**Nội dung**|
         | - | - |
         |**Use Case ID**|UC19|
         |**Use Case Name**|Theo dõi Đối soát & Doanh thu|
         |**Description**|Là một Người bán, tôi muốn xem biểu đồ doanh thu tổng quan, theo dõi lịch sử dòng tiền và xuất dữ liệu ra file Excel để thực hiện nghiệp vụ kế toán nội bộ.|
         |**Actor(s)**|Người bán (Seller)|
         |**Priority**|Should Have|
         |**Trigger**|Người bán truy cập vào trang "Bảng điều khiển" (Dashboard) hoặc tab "Giao dịch" (Transactions).|
         |**Pre-Condition(s)**|Người bán đã đăng nhập thành công vào hệ thống.|
         |**Post-Condition(s)**|Dữ liệu thống kê được tính toán chính xác và kết xuất thành file báo cáo thành công.|
         |**Basic Flow**|<p>1\. Người bán truy cập trang Bảng điều khiển tổng quan.</p><p>2\. Hệ thống tự động tổng hợp và tính toán các chỉ số kinh doanh theo thời gian thực.</p><p>3\. Hệ thống hiển thị các thẻ thống kê tổng thể bao gồm: Tổng thu nhập (Total Earning), Tổng số đơn (Total Orders), Đơn bị hủy (Canceled Orders) và Tổng hoàn tiền (Total Refund).</p><p>4\. Hệ thống hiển thị Biểu đồ doanh thu trực quan (Earning graphs) phân bổ theo ngày, tuần, hoặc tháng.</p><p>5\. Người bán truy cập tab "Lịch sử giao dịch" (Transactions) để xem đối soát chi tiết dòng tiền của từng đơn hàng cụ thể.</p>|
         |**Alternative Flow**|<p>5a. Xuất báo cáo dữ liệu Excel:</p><p>5a1. Tại màn hình Giao dịch/Báo cáo, Người bán chọn lệnh "Xuất báo cáo" (Export).</p><p>5a2. Hệ thống truy xuất dữ liệu từ Database, định dạng lại thành cấu trúc tệp tin .xlsx</p><p>5a3. Hệ thống tự động tải file báo cáo Excel xuống thiết bị của Người bán.</p>|
         |**Exception Flow**|<p>2a. Hệ thống chưa phát sinh giao dịch:</p><p>2a1. Nếu Seller là gian hàng mới chưa có đơn hàng nào, hệ thống không báo lỗi mà chỉ hiển thị dữ liệu "0" trên các thẻ và hiển thị trạng thái "Empty state" (Chưa có dữ liệu) tại biểu đồ đồ thị.</p>|
         |**Business Rules**|<p>- **BR18-1 (CT\_SL1):** Báo cáo phải tự động tổng hợp chính xác các chỉ số từ tất cả các đơn hàng thuộc quyền sở hữu của Seller.</p><p>- **BR18-2 (CT\_SL2):** Khi một đơn hàng hoàn tiền thành công ở UC17, khoản tiền này phải được tự động trừ khỏi Tổng thu nhập (Total Earning) và được cộng dồn vào thống kê Tổng hoàn tiền (Total Refund) để việc đối soát dòng tiền luôn minh bạch.</p>|
         |**Non-Functional Requirement**|- **NFR18-1 (QĐ\_SL7):** File Excel được kết xuất phải đảm bảo đúng định dạng bảng tính (Spreadsheet), không bị lỗi font chữ Unicode (tiếng Việt) để Người bán dễ dàng làm việc với các phần mềm kế toán.|

      20. ### ***Use case 20***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC20|
         |**Use Case Name**|Kiểm duyệt Người bán|
         |**Description**|Là một Quản lý (hoặc Quản trị viên), tôi muốn xem xét hồ sơ đăng ký mở gian hàng của những người bán mới để quyết định cho phép họ kinh doanh trên sàn hay không, nhằm đảm bảo uy tín cho nền tảng.|
         |**Actor(s)**|Quản lý (Manager), Quản trị viên (Admin)|
         |**Priority**|Must Have|
         |**Trigger**|Quản lý truy cập vào mục "Hồ sơ chờ duyệt" trên Bảng điều khiển hệ thống.|
         |**Pre-Condition(s)**|Có ít nhất một Người bán vừa điền xong thông tin đăng ký mở shop.|
         |**Post-Condition(s)**|Hồ sơ được giải quyết. Gian hàng chính thức được mở cửa hoặc bị trả về yêu cầu sửa lại.|
         |**Basic Flow**|1\. Quản lý mở danh sách các gian hàng đang ở trạng thái "Chờ xác minh".<br>2. Quản lý nhấp vào một hồ sơ để xem chi tiết: Tên doanh nghiệp, giấy tờ liên quan, địa chỉ kho lấy hàng và số tài khoản ngân hàng đối soát.<br>3. Quản lý kiểm tra tính hợp lệ và rõ ràng của các thông tin này.<br>4. Nếu mọi thứ đúng chuẩn, Quản lý nhấn nút "Phê duyệt" (Approve).<br>5. Hệ thống đổi trạng thái của gian hàng sang "Đang hoạt động".<br>6. Hệ thống tự động gửi một email chúc mừng đến Người bán, thông báo họ đã có thể bắt đầu đăng bán quần áo.|
         |**Alternative Flow**|**4a. Quản lý từ chối hồ sơ:**<br>4a1. Quản lý nhận thấy thông tin bị thiếu (ví dụ: thiếu số tài khoản ngân hàng hoặc tên shop phản cảm).<br>4a2. Quản lý nhấn nút "Từ chối" (Reject).<br>4a3. Màn hình hiện ra một khung trống, Quản lý gõ lý do từ chối vào đây (Ví dụ: "Vui lòng chụp lại giấy tờ rõ nét hơn").<br>4a4. Hệ thống ghi nhận và gửi email thông báo lý do này cho Người bán để họ vào sửa lại.|
         |**Exception Flow**|*Quy trình thao tác hoàn toàn trên biểu mẫu văn bản nên không có ngoại lệ phức tạp.*|
         |**Business Rules**|- **BR20-1:** Chỉ những gian hàng đã vượt qua bài kiểm duyệt này mới được hệ thống cấp quyền đăng tải sản phẩm và nhận đơn hàng.|
         |**Non-Functional Req**|- **NFR20-1:** Lịch sử duyệt (Ai là người duyệt, duyệt lúc mấy giờ) phải được hệ thống tự động ghi nhận lại phía sau màn hình để truy trách nhiệm nếu sau này có sự cố.|
      21. ### ***Use case 21***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC21|
         |**Use Case Name**|Kiểm duyệt Sản phẩm|
         |**Description**|Là một Quản lý, tôi muốn xem trước hình ảnh, mô tả và chất liệu của các mẫu quần áo/giày dép do Người bán mới đăng lên để đảm bảo tính thẩm mỹ và không vi phạm quy định sàn trước khi cho khách hàng nhìn thấy.|
         |**Actor(s)**|Quản lý (Manager), Quản trị viên (Admin)|
         |**Priority**|Must Have|
         |**Trigger**|Quản lý truy cập vào mục "Sản phẩm chờ duyệt".|
         |**Pre-Condition(s)**|Có ít nhất một sản phẩm mới vừa được Người bán đăng tải và đang chờ kiểm tra.|
         |**Post-Condition(s)**|Món hàng được cấp phép hiển thị công khai ra mặt tiền trang chủ hoặc bị ẩn đi và trả về cho Người bán.|
         |**Basic Flow**|1\. Quản lý mở danh sách các món đồ đang chờ duyệt.<br>2. Quản lý bấm vào một chiếc áo để xem xét cách trình bày: Ảnh người mẫu mặc có rõ nét không, có bị phản cảm không, mô tả chất liệu vải và bảng chọn size/màu sắc có đầy đủ không.<br>3. Quản lý xem xét mức giá bán mà Người bán thiết lập xem có dấu hiệu gian lận không.<br>4. Nếu hình ảnh đẹp và thông tin chuẩn xác, Quản lý nhấn nút "Cho phép hiển thị" (Approve).<br>5. Màn hình báo thành công. Chiếc áo ngay lập tức xuất hiện trên thanh tìm kiếm và trang chủ để khách hàng có thể đặt mua.|
         |**Alternative Flow**|**4a. Quản lý từ chối sản phẩm:**<br>4a1. Quản lý thấy ảnh sản phẩm bị mờ hoặc vi phạm bản quyền thương hiệu lớn.<br>4a2. Quản lý nhấn nút "Từ chối".<br>4a3. Quản lý gõ vài dòng nhắc nhở: "Ảnh bị mờ, vui lòng thay ảnh sắc nét hơn" và xác nhận.<br>4a4. Sản phẩm bị đẩy ngược về cho Người bán sửa lại, khách hàng không thể nhìn thấy món đồ này.|
         |**Exception Flow**|*Không có nhánh rẽ ngoại lệ.*|
         |**Business Rules**|- **BR21-1:** Trạng thái mặc định của mọi món đồ thời trang vừa được tạo ra luôn luôn là "Bị ẩn" (Chờ duyệt). Người bán tuyệt đối không có nút nào để tự đẩy thẳng hàng ra trang chủ.|
         |**Non-Functional Req**|- **NFR21-1:** Do mỗi ngày Quản lý có thể phải duyệt hàng trăm mẫu quần áo, giao diện màn hình này phải tải hình ảnh cực kỳ nhanh và có tính năng "Duyệt hàng loạt" (đánh dấu tick nhiều sản phẩm rồi bấm Duyệt 1 lần) để tiết kiệm thời gian thao tác.|
      22. ### ***Use case 22***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC22|
         |**Use Case Name**|Xử lý vi phạm nội dung|
         |**Description**|Là một Quản lý, trong quá trình rà soát hàng ngày, tôi muốn có công cụ để ngay lập tức ẩn đi các sản phẩm vi phạm hoặc đóng cửa tạm thời các gian hàng gian lận để bảo vệ trải nghiệm của người mua.|
         |**Actor(s)**|Quản lý (Manager), Quản trị viên (Admin)|
         |**Priority**|High|
         |**Trigger**|Quản lý truy cập vào công cụ tìm kiếm nội bộ, hoặc nhận được cảnh báo vi phạm từ hệ thống/người dùng.|
         |**Pre-Condition(s)**|Quản lý xác định được một sản phẩm hoặc gian hàng cụ thể đang vi phạm nội quy (như lừa đảo, bán hàng cấm).|
         |**Post-Condition(s)**|Sản phẩm bị gỡ bỏ khỏi kệ hàng hoặc Shop bị treo biển đóng cửa.|
         |**Basic Flow**|1\. Quản lý dùng thanh tìm kiếm để mở trang thông tin của một gian hàng (hoặc một mẫu quần áo) đang bị nghi ngờ.<br>2. Quản lý kiểm tra các báo cáo phản hồi từ khách hàng và xác nhận có sự vi phạm thực sự.<br>3. Quản lý nhấn vào biểu tượng "Tùy chọn bổ sung" góc phải màn hình và chọn "Ẩn sản phẩm" (nếu lỗi nhẹ) hoặc "Đình chỉ gian hàng" (nếu lỗi nặng).<br>4. Màn hình hiện ra bảng cảnh báo: "Bạn có chắc chắn muốn đình chỉ hoạt động của gian hàng này không?".<br>5. Quản lý chọn lý do vi phạm từ một danh sách có sẵn (Ví dụ: "Hàng giả/Nhái thương hiệu") và bấm "Đồng ý".<br>6. Hệ thống ngay lập tức đóng băng mọi hoạt động của shop này. Toàn bộ quần áo của shop sẽ bốc hơi khỏi trang chủ. <br>7. Hệ thống tự động gửi email thông báo vi phạm cho Người bán.|
         |**Alternative Flow**|**5a. Quản lý muốn mở khóa lại cho gian hàng:**<br>5a1. Sau khi Người bán đã nộp đủ giấy tờ giải trình và cam kết sửa sai, Quản lý tìm lại tên gian hàng đó.<br>5a2. Quản lý chọn lệnh "Mở khóa hoạt động". Gian hàng lập tức được khôi phục trạng thái buôn bán bình thường như trước.|
         |**Exception Flow**|**3a. Quản lý cố gắng đình chỉ một shop đang có hàng trăm đơn hàng đang giao dở dang:**<br>3a1. Màn hình hiện cảnh báo: "Gian hàng này đang có các đơn hàng chưa hoàn tất. Việc đình chỉ sẽ ngăn shop nhận đơn mới nhưng họ vẫn phải giao nốt số đơn cũ. Tiếp tục?". Quản lý bấm xác nhận để đi tiếp.|
         |**Business Rules**|- **BR22-1:** Quản lý (Manager) chỉ có quyền "Đình chỉ tạm thời" (Suspend). Quyền "Cấm vĩnh viễn" (Ban) và xóa hoàn toàn tài khoản phải do Quản trị viên (Admin) thao tác.|
         |**Non-Functional Req**|- **NFR22-1:** Thao tác "Ẩn" hoặc "Đình chỉ" phải có tác dụng trên toàn hệ thống trong vòng chưa tới 1 giây, kể cả việc xóa sản phẩm đó ra khỏi kết quả tìm kiếm của khách hàng đang truy cập.|
      23. ### ***Use case 23***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC23|
         |**Use Case Name**|Quản lý Phân quyền|
         |**Description**|Là Quản trị viên cao nhất, tôi muốn tạo tài khoản và phân công nhiệm vụ cho các Quản lý (Manager) cấp dưới để họ phụ giúp tôi rà soát, kiểm duyệt gian hàng và sản phẩm mỗi ngày.|
         |**Actor(s)**|Quản trị viên (Admin)|
         |**Priority**|High|
         |**Trigger**|Admin nhấn vào mục "Phân quyền & Nhân sự" trên bảng điều khiển.|
         |**Pre-Condition(s)**|Admin đã đăng nhập an toàn vào hệ thống.|
         |**Post-Condition(s)**|Một tài khoản Quản lý mới được tạo thành công và có thể bắt đầu làm việc.|
         |**Basic Flow**|1\. Admin mở danh sách nhân sự quản lý của sàn.<br>2. Admin nhấn nút "Thêm Quản lý mới".<br>3. Màn hình hiện ra một biểu mẫu. Admin điền Tên, Số điện thoại và Email của người nhân viên đó.<br>4. Admin chọn cấp quyền hạn là "Quản lý (Manager)".<br>5. Admin nhấn "Cấp tài khoản".<br>6. Hệ thống tạo tài khoản, gửi một email chứa thông tin đăng nhập tạm thời đến nhân viên đó.<br>7. Màn hình của Admin hiện thông báo "Đã tạo tài khoản thành công" và tên người mới xuất hiện trong danh sách.|
         |**Alternative Flow**|**1a. Tước quyền của một Quản lý:**<br>1a1. Nhân viên nghỉ việc, Admin tìm tên người đó trong danh sách.<br>1a2. Admin nhấn biểu tượng "Khóa tài khoản".<br>1a3. Hệ thống ngay lập tức tước toàn bộ quyền truy cập. Nhân viên đó không thể đăng nhập vào sàn để duyệt sản phẩm được nữa.|
         |**Exception Flow**|**3a. Điền trùng Email đã có trên hệ thống:**<br>3a1. Màn hình bôi đỏ ô Email và báo: "Email này đã được sử dụng cho một tài khoản khác. Vui lòng dùng Email công việc mới".|
         |**Business Rules**|- **BR23-1:** Quản lý (Manager) tuyệt đối không có nút chức năng để tạo tài khoản cho người khác. Đặc quyền này chỉ duy nhất Admin cao nhất nắm giữ.|
         |**Non-Functional Req**|- **NFR23-1:** Thao tác khóa tài khoản nhân sự nghỉ việc phải có hiệu lực ngay chớp mắt, kể cả khi người đó đang mở máy tính làm việc thì cũng sẽ bị văng ra ngoài ngay lập tức.|
      24. ### ***Use case 24***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC24|
         |**Use Case Name**|Quản lý Tài chính & Đối soát|
         |**Description**|Là Quản trị viên, tôi muốn duyệt các lệnh rút tiền của người bán, thực hiện chuyển tiền thật cho họ, đồng thời điều chỉnh mức phí thu hoa hồng của sàn để cân đối lợi nhuận.|
         |**Actor(s)**|Quản trị viên (Admin)|
         |**Priority**|Must Have|
         |**Trigger**|Admin truy cập vào mục "Đối soát Tài chính".|
         |**Pre-Condition(s)**|Có người bán vừa tạo lệnh xin rút tiền từ doanh thu của họ.|
         |**Post-Condition(s)**|Tiền được chuyển thành công, Ví điện tử trên web của người bán bị trừ đi tương ứng.|
         |**Basic Flow**|1\. Admin mở danh sách các "Yêu cầu rút tiền" đang chờ xử lý.<br>2. Admin bấm vào một yêu cầu để xem: Số tiền người bán muốn rút, và Thông tin số tài khoản ngân hàng của họ.<br>3. Admin kiểm tra lại lịch sử bán hàng của shop này xem có gian lận gì không.<br>4. Nếu mọi thứ minh bạch, Admin cầm điện thoại/mở ứng dụng ngân hàng nội bộ của công ty và tiến hành chuyển khoản thật số tiền đó cho người bán.<br>5. Sau khi chuyển tiền thành công ở ngoài thực tế, Admin quay lại màn hình web và bấm nút "Đã chuyển khoản".<br>6. Hệ thống ghi nhận, trừ đi số tiền tương ứng trong Ví điện tử của người bán và báo trạng thái "Hoàn tất".|
         |**Alternative Flow**|**1a. Chỉnh sửa phí hoa hồng (Phí sàn) và Xu thưởng:**<br>1a1. Admin chuyển sang tab "Cấu hình".<br>1a2. Admin gõ con số % phí hoa hồng muốn thu (Ví dụ: Đổi từ 5% lên 7%) hoặc đổi tỷ lệ tặng xu cho khách.<br>1a3. Admin nhấn "Lưu". Các đơn hàng phát sinh từ phút này trở đi sẽ bị tính phí theo mức mới.|
         |**Exception Flow**|**4a. Thông tin thẻ ngân hàng của người bán bị sai (Chuyển tiền bị dội lại):**<br>4a1. Admin nhấn nút "Từ chối lệnh rút", ghi rõ lý do "Số tài khoản sai, ngân hàng từ chối".<br>4a2. Lệnh rút bị hủy, tiền được hoàn lại nguyên vẹn vào Ví trên web để người bán kiểm tra lại.|
         |**Business Rules**|- **BR24-1:** Mức phí hoa hồng mới chỉnh sửa tuyệt đối không được áp dụng ngược lại cho các đơn hàng đã bán trong quá khứ để tránh sai lệch sổ sách kế toán.|
         |**Non-Functional Req**|- **NFR24-1:** Giao diện khu vực tài chính này phải cực kỳ trực quan, các con số tiền nong phải được phân cách hàng nghìn rõ ràng (Ví dụ: 10,000,000 đ) để Admin không bị nhìn hoa mắt dẫn đến chuyển nhầm tiền.|
      25. ### ***Use case 25***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC25|
         |**Use Case Name**|Giải quyết khiếu nại (Disputes)|
         |**Description**|Là Quản trị viên, tôi muốn sắm vai "quan tòa" để phân xử các vụ cãi vã đổi trả hàng giữa người mua và người bán, và có quyền ấn nút trả lại tiền cho người mua nếu họ đúng.|
         |**Actor(s)**|Quản trị viên (Admin)|
         |**Priority**|Must Have|
         |**Trigger**|Admin mở mục "Tranh chấp & Khiếu nại".|
         |**Pre-Condition(s)**|Có khách hàng vừa bấm nút "Khiếu nại lên Admin" do bị người bán từ chối nhận lại hàng lỗi.|
         |**Post-Condition(s)**|Vụ việc khép lại. Tiền được tự động hoàn về thẻ của khách, hoặc được đẩy vào ví của người bán.|
         |**Basic Flow**|1\. Admin nhìn thấy một vụ tranh chấp mới và bấm vào xem.<br>2. Màn hình chia làm hai nửa rõ rệt: Một bên là hình ảnh/video bóc hàng bị rách của Khách, một bên là lý lẽ từ chối của Người bán.<br>3. Admin xem xét bằng chứng. Nhận thấy áo thực sự bị rách từ trước.<br>4. Admin quyết định Khách hàng thắng kiện, bấm chọn nút "Bảo vệ Người mua - Hoàn tiền".<br>5. Màn hình hiện bảng xác nhận. Admin bấm "Đồng ý".<br>6. Hệ thống tự động liên hệ với cổng thanh toán (VNPay) để yêu cầu chuyển trả lại tiền vào số thẻ/tài khoản mà khách đã dùng để mua hàng.<br>7. Vụ tranh chấp đóng lại với trạng thái "Đã hoàn tiền".|
         |**Alternative Flow**|**3a. Admin phát hiện Khách hàng gian lận (tự làm rách áo để ăn vạ):**<br>3a1. Admin chọn nút "Bảo vệ Người bán - Từ chối hoàn tiền".<br>3a2. Vụ việc đóng lại. Khách hàng không được trả tiền, và khoản tiền giữ lại của đơn hàng này được mở khóa, chảy thẳng vào Ví của người bán.|
         |**Exception Flow**|**6a. Cổng thanh toán của ngân hàng đang bảo trì, không thể trả tiền ngay:**<br>6a1. Màn hình báo "Hệ thống ngân hàng đang bận, lệnh hoàn tiền sẽ được tự động thử lại sau ít phút". Admin không cần phải ngồi canh để bấm lại.|
         |**Business Rules**|- **BR25-1:** Khi Admin đã đưa ra phán quyết cuối cùng và ấn nút, vụ kiện lập tức khóa vĩnh viễn. Cả khách lẫn người bán đều không có nút nào để cãi lại hay mở lại vụ này nữa.|
         |**Non-Functional Req**|- **NFR25-1:** Khung xem video bằng chứng của khách phải chạy mượt, có nút phóng to toàn màn hình để Admin soi kỹ được các vết rách xước trên quần áo mà không cần tải video về máy.|
      26. ### ***Use case 26***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC26|
         |**Use Case Name**|Quản lý Giao diện Trang chủ|
         |**Description**|Là Quản trị viên, tôi muốn thay đổi diện mạo cho Trang chủ (như cập nhật ảnh bìa quảng cáo, chọn các danh mục đồ nổi bật) để trang web luôn mới mẻ và thu hút khách hàng.|
         |**Actor(s)**|Quản trị viên (Admin)|
         |**Priority**|Should Have|
         |**Trigger**|Admin vào khu vực "Thiết kế Trang chủ" trên bảng điều khiển.|
         |**Pre-Condition(s)**|Admin đã đăng nhập an toàn.|
         |**Post-Condition(s)**|Trang chủ có diện mạo mới ngay lập tức. Khách hàng nhìn thấy giao diện mới khi truy cập.|
         |**Basic Flow**|1\. Admin vào mục thiết kế trang chủ, màn hình hiện ra các khu vực có thể thay đổi.<br>2. Admin chọn khu vực "Ảnh bìa quảng cáo" (Banner).<br>3. Admin tải lên một tấm ảnh mới được thiết kế riêng cho đợt lễ Tết.<br>4. Kéo xuống phần danh mục nổi bật, Admin chọn hiển thị mục "Thời trang nữ" ra mặt tiền thay vì "Thời trang nam".<br>5. Admin nhấn nút "Cập nhật".<br>6. Màn hình báo thành công. Giao diện trang chủ mà khách hàng nhìn thấy lập tức được thay đổi theo đúng những gì Admin vừa chỉnh.|
         |**Alternative Flow**|*Không có. Thao tác được xử lý trực tiếp trên biểu mẫu màn hình*.|
         |**Exception Flow**|**3a. Tấm ảnh tải lên quá nặng hoặc sai định dạng:**<br>3a1. Hình ảnh xem trước bị vỡ. Hệ thống báo lỗi "Hình ảnh không hợp lệ, vui lòng chọn ảnh khác" và không cho phép lưu.|
         |**Business Rules**|- **BR26-1:** Việc thay đổi này sẽ áp dụng ngay lập tức cho tất cả khách hàng truy cập, không cần phải bảo trì hệ thống.|
         |**Non-Functional Req**|- **NFR26-1:** Quá trình thay đổi phải theo nguyên tắc "Nhìn sao ra vậy" - Admin vừa chọn hình xong là màn hình xem trước hiển thị ngay kết quả y hệt như khách hàng sẽ thấy. Các thay đổi phải phản hồi tức thì dưới 1 giây.|
      27. ### ***Use case 27***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC27|
         |**Use Case Name**|Quản lý Chiến dịch Khuyến mãi|
         |**Description**|Là Quản trị viên, tôi muốn tự tạo ra các mã giảm giá (Coupons) hoặc các đợt hạ giá chung (Deals) để kích thích khách hàng mua sắm nhiều hơn trên toàn sàn.|
         |**Actor(s)**|Quản trị viên (Admin)|
         |**Priority**|Must Have|
         |**Trigger**|Admin vào khu vực "Mã giảm giá" hoặc "Chương trình Khuyến mãi".|
         |**Pre-Condition(s)**|Admin đã đăng nhập an toàn.|
         |**Post-Condition(s)**|Khách hàng có thể lấy mã để áp dụng khi thanh toán, hoặc nhìn thấy nhãn giảm giá trên sản phẩm.|
         |**Basic Flow**|<br>1. Admin nhấn nút "Tạo mã giảm giá mới".<br>2. Màn hình hiện ra một khung thiết lập.<br>3. Admin tự gõ tên mã (Ví dụ: TET2026), chọn mức giảm (Ví dụ: Giảm 20%), quy định điều kiện (Ví dụ: Mua trên 500,000đ) và chọn ngày bắt đầu, ngày hết hạn.<br>4. Admin nhấn "Phát hành".<br>5. Màn hình báo thành công. Khách hàng ngay lập tức có thể gõ mã TET2026 lúc thanh toán để được trừ tiền.|
         |**Alternative Flow**|**Luồng Tạo Khuyến mãi danh mục (Deals):**<br>1a. Admin chuyển sang trang "Khuyến mãi lớn" (Deals).<br>2a. Admin chọn tạo một đợt giảm giá (Ví dụ: "Tuần lễ thời trang mùa đông - Giảm 50% toàn bộ áo khoác").<br>3a. Admin chọn thời gian áp dụng và lưu lại. Các áo khoác trên sàn sẽ tự động được gắn nhãn giảm giá đỏ để thu hút khách.|
         |**Exception Flow**|**3a. Admin cài đặt ngày hết hạn nằm trong quá khứ:**<br>3a1. Màn hình bôi đỏ ô chọn ngày và nhắc: "Ngày kết thúc không được nhỏ hơn ngày hôm nay". Admin phải chọn lại ngày khác mới được lưu.|
         |**Business Rules**|- **BR27-1:** Mã giảm giá do Admin tạo ra sẽ được áp dụng cho toàn bộ các gian hàng. Phần tiền khách được giảm sẽ do Admin bù lại cho người bán lúc đối soát thanh toán để người bán không bị lỗ.|
         |**Non-Functional Req**|- **NFR27-1:** Khi khách hàng nhập mã ở bước thanh toán, hệ thống phải kiểm tra xem mã có đúng điều kiện không trong nháy mắt (dưới 100ms) để không làm chậm quá trình trả tiền.|

      28. ### ***Use case 28***

         |**Thành phần**|**Chi tiết đặc tả**|
         | - | - |
         |**Use Case ID**|UC28|
         |**Use Case Name**|Quản lý Khách hàng|
         |**Description**|Là Quản trị viên, tôi muốn xem danh sách tất cả những người đang mua sắm trên sàn và có công cụ để "cấm cửa" những kẻ xấu chuyên lừa đảo hoặc đặt hàng ảo.|
         |**Actor(s)**|Quản trị viên (Admin)|
         |**Priority**|Should Have|
         |**Trigger**|Admin mở mục "Danh sách Khách hàng".|
         |**Pre-Condition(s)**|Admin đã đăng nhập an toàn.|
         |**Post-Condition(s)**|Kẻ gian lận bị chặn không cho dùng hệ thống nữa.|
         |**Basic Flow**|1\. Admin mở trang quản lý người mua.<br>2. Màn hình hiện ra một bảng danh sách hàng ngàn khách hàng.<br>3. Admin gõ số điện thoại hoặc tên của một người hay bị các shop phàn nàn "bom hàng" (đặt xong không lấy) vào thanh tìm kiếm.<br>4. Admin bấm vào tên người đó, xem lại lịch sử mua và thấy toàn đơn bị hủy.<br>5. Admin nhấn nút "Cấm tài khoản".<br>6. Màn hình hỏi lại cho chắc: "Bạn có muốn khóa vĩnh viễn người này không?". Admin bấm Đồng ý.<br>7. Khách hàng này ngay lập tức bị văng ra khỏi hệ thống, nếu cố tình đăng nhập lại sẽ thấy dòng chữ "Tài khoản của bạn đã bị khóa".|
         |**Alternative Flow**|**1a. Mở khóa lại cho khách:**<br>1a1. Sau khi khách hàng liên hệ giải trình và được thông cảm, Admin tìm lại tài khoản đó.<br>1a2. Nhấn nút "Mở khóa". Khách hàng lại có thể vào mua sắm bình thường.|
         |**Exception Flow**|*Không có nhánh rẽ ngoại lệ phức tạp, thao tác trực tiếp trên danh sách.*|
         |**Business Rules**|- **BR28-1:** Dù Admin có toàn quyền sinh sát, nhưng tuyệt đối màn hình không bao giờ hiển thị Mật khẩu của khách hàng (vì đã được mã hóa giấu đi) để đảm bảo quyền riêng tư tuyệt đối.|
         |**Non-Functional Req**|- **NFR28-1:** Vì danh sách khách có thể lên tới hàng triệu người, màn hình phải chia thành nhiều trang nhỏ (ví dụ 50 người/trang), khi Admin lật trang phải tải rất nhẹ và mượt mà, không làm đơ trình duyệt.|

      29. ### ***Use case 29***

         |**Trường**|**Nội dung**|
         | - | - |
         |**Use Case ID**|UC29|
         |**Use Case Name**|Theo dõi Nhật ký (Audit Log)|
         |**Description**|Là Quản trị viên, tôi muốn truy xuất và xem lại lịch sử các thao tác thay đổi dữ liệu quan trọng trên hệ thống để phục vụ công tác kiểm toán và rà soát lỗi.|
         |**Actor(s)**|Quản trị viên (Admin)|
         |**Priority**|Should Have|
         |**Trigger**|Admin truy cập vào tab "Nhật ký hệ thống" (Audit Logs).|
         |**Pre-Condition(s)**|Admin đã đăng nhập thành công.|
         |**Post-Condition(s)**|Admin xem được toàn bộ lịch sử các thao tác quản trị một cách minh bạch.|
         |**Basic Flow**|<p>1\. Admin truy cập vào trang Nhật ký hệ thống.</p><p>2\. Hệ thống truy xuất dữ liệu từ cơ sở dữ liệu và hiển thị danh sách các bản ghi nhật ký.</p><p>3\. Mỗi bản ghi log bao gồm các thông tin: Thời gian thực hiện (Timestamp), Tên tài khoản thực hiện (Actor), Hành động (Action - VD: Ban Seller, Phê duyệt sản phẩm, Đổi phí nền tảng).</p><p>4\. Admin sử dụng bộ lọc để tìm kiếm các hành động cụ thể theo khoảng thời gian hoặc theo phân hệ module.</p><p>5\. Admin tra cứu thông tin phục vụ kiểm toán. Thao tác xem hoàn tất.</p>|
         |**Alternative Flow**|*Không có.*|
         |**Exception Flow**|*Không có nhánh ngoại lệ phức tạp, chủ yếu xử lý lỗi timeout nếu dữ liệu quá lớn.*|
         |**Business Rules**|- **BR26-1:** Bảng dữ liệu Nhật ký là dữ liệu Tuyệt đối Chỉ đọc (Read-only). Hệ thống không cung cấp chức năng Xóa (Delete) hay Sửa (Update) dữ liệu nhật ký cho bất kỳ ai, kể cả tài khoản Root Admin để đảm bảo tính minh bạch kiểm toán cao nhất.|
         |**Non-Functional Requirement**|- **NFR26-1:** Thao tác "Ghi log" vào cơ sở dữ liệu ở các Use Case khác phải được thiết kế chạy ngầm (Asynchronous) để không làm tăng thời gian phản hồi (Latency) của tiến trình chính.|
      30. ### ***Use case 30***

         |**Trường**|**Nội dung**|
         | - | - |
         |**Use Case ID**|UC 30|
         |**Use Case Name**|Đăng nhập hệ thống|
         |**Description**|Là một Người dùng, tôi muốn đăng nhập vào hệ thống bằng mật khẩu, mã OTP hoặc qua mạng xã hội (Google) để truy cập vào phân quyền làm việc của mình.|
         |**Actor(s)**|Mọi tác nhân (Khách hàng, Người bán, Quản trị viên), Hệ thống bên thứ 3 (Google, Facebook).|
         |**Priority**|Must Have|
         |**Trigger**|Người dùng truy cập trang Đăng nhập và lựa chọn phương thức đăng nhập mong muốn.|
         |**Pre-Condition(s)**|Người dùng đã có tài khoản trên hệ thống hoặc có tài khoản mạng xã hội (Google) đang hoạt động hợp lệ.|
         |**Post-Condition(s)**|Đăng nhập thành công, hệ thống thiết lập phiên làm việc và điều hướng người dùng tới giao diện tương ứng.|
         |**Basic Flow**|<p>(Luồng chính: Đăng nhập bằng Email và Mật khẩu truyền thống)</p><p>1\. Người dùng chọn phương thức "Đăng nhập bằng Mật khẩu".</p><p>2\. Người dùng nhập Email và Mật khẩu đã đăng ký, sau đó nhấn "Đăng nhập".</p><p>3\. Hệ thống đối chiếu thông tin định danh trong cơ sở dữ liệu.</p><p>4\. Nếu hợp lệ, hệ thống thiết lập phiên làm việc cho người dùng.</p><p>5\. Hệ thống tự động nhận diện Phân quyền (Role) và điều hướng: Khách hàng về Trang chủ, Người bán/Admin về Bảng điều khiển.</p>|
         |**Alternative Flow**|<p>1a. Đăng nhập bằng mã OTP (Passwordless):</p><p>1a1. Người dùng nhập Email và chọn "Đăng nhập bằng OTP".</p><p>1a2. Hệ thống gửi mã xác thực 6 số qua Email người dùng.</p><p>1a3. Người dùng nhập mã OTP và xác nhận.</p><p>1a4. Hệ thống kiểm tra OTP hợp lệ. *Use Case tiếp tục ở Bước 4 của luồng chính.*</p><p>1b. Đăng nhập qua mạng xã hội (Google):</p><p>1b1. Người dùng chọn nút "Đăng nhập với Google" (hoặc Facebook).</p><p>1b2. Hệ thống chuyển hướng sang màn hình xác thực của Google/Facebook.</p><p>1b3. Người dùng đồng ý cấp quyền truy cập thông tin cơ bản (Email, Tên).</p><p>1b4. Google trả về thông báo xác thực thành công. (Nếu Email này chưa từng tồn tại, hệ thống tự động tạo mới tài khoản Khách hàng).</p><p>*Use Case tiếp tục ở Bước 4 của luồng chính.*</p><p>1c. Đăng nhập bảo mật 2 lớp (Dành riêng cho Admin):</p><p>1c1. Quản trị viên truy cập đường dẫn riêng, nhập Email và Mật khẩu đúng.</p><p>1c2. Hệ thống yêu cầu xác thực bước 2 bằng cách gửi OTP về Email.</p><p>1c3. Admin nhập đúng OTP, hệ thống cấp phiên làm việc vào Admin Dashboard.</p>|
         |**Exception Flow**|<p>3a. Sai tài khoản hoặc mật khẩu:</p><p>3a1. Hệ thống báo lỗi "Email hoặc mật khẩu không chính xác" và chặn truy cập.</p><p>*Use Case quay lại bước 2.*</p><p>1a3.1 (Ngoại lệ của 1a) Sai OTP:</p><p>1a3.2. Hệ thống báo lỗi "Mã OTP không hợp lệ hoặc đã hết hạn".</p><p>1b3.1 (Ngoại lệ của 1b) Từ chối cấp quyền:</p><p>1b3.2. Người dùng chọn lệnh "Hủy" trên màn hình của Google.</p><p>1b3.3. Quá trình đăng nhập thất bại, hệ thống đưa người dùng về lại trang Đăng nhập mặc định.</p>|
         |**Business Rules**|<p>- **BR27-1:** Mã OTP chỉ có hiệu lực sử dụng 1 lần và tồn tại trong khoảng thời gian giới hạn (Ví dụ: 5 phút).</p><p>- **BR27-2:** Tính năng Đăng nhập qua mạng xã hội (Google) mặc định chỉ cấp quyền Khách hàng (Customer).</p>|
         |**Non-Functional Requirement**|<p>- **NFR27-1:** Mật khẩu truyền thống của người dùng bắt buộc phải được mã hóa một chiều khi đối chiếu.</p><p>- **NFR27-2:** Tính năng đăng nhập Google phải được giao tiếp thông qua giao thức chuẩn OAuth2.</p>|
      31. ### ***Use case 31***

         |**Trường**|**Nội dung**|
         | - | - |
         |**Use Case ID**|UC31|
         |**Use Case Name**|Đăng xuất|
         |**Description**|Là một Người dùng, tôi muốn đăng xuất khỏi hệ thống để kết thúc phiên làm việc an toàn, tránh bị người khác truy cập trái phép vào tài khoản của mình.|
         |**Actor(s)**|Mọi tác nhân|
         |**Priority**|Must Have|
         |**Trigger**|Người dùng nhấn vào nút "Đăng xuất" (Logout) trên màn hình làm việc.|
         |**Pre-Condition(s)**|Người dùng đang ở trạng thái đăng nhập hợp lệ.|
         |**Post-Condition(s)**|Phiên làm việc kết thúc, hệ thống thu hồi quyền truy cập hiện tại của người dùng.|
         |**Basic Flow**|<p>1\. Người dùng nhấp chọn lệnh "Đăng xuất".</p><p>2\. Hệ thống tiếp nhận yêu cầu và tiến hành hủy bỏ phiên làm việc hiện tại trên thiết bị của người dùng.</p><p>3\. Hệ thống xóa các dữ liệu cá nhân tạm thời đang hiển thị (như Giỏ hàng cá nhân, thông tin Hồ sơ).</p><p>4\. Hệ thống tự động điều hướng người dùng trở về Trang chủ mặc định ở trạng thái chưa đăng nhập.</p>|
         |**Alternative Flow**|*Không có. Luồng xử lý diễn ra trực tiếp một chiều.*|
         |**Exception Flow**|*Không có.*|
         |**Business Rules**|- **BR28-1:** Ngay sau khi đăng xuất, mọi liên kết (URL) riêng tư mà người dùng cố tình truy cập lại (Ví dụ: Trang quản lý đơn, trang Checkout) đều phải bị hệ thống chặn lại và yêu cầu đăng nhập.|
         |**Non-Functional Requirement**|- **NFR28-1:** Thao tác đăng xuất phải được xử lý ngay lập tức tại phía giao diện (Client-side) bằng cách xóa JWT Token và làm sạch (Clear) Redux Store.|
      32. ### ***Use case 32***

         |**Trường**|**Nội dung**|
         | - | - |
         |**Use Case ID**|UC32|
         |**Use Case Name**|Đổi / Quên mật khẩu|
         |**Description**|Là một Người dùng, tôi muốn thiết lập lại mật khẩu khi bị quên hoặc chủ động đổi mật khẩu để bảo vệ an toàn cho tài khoản cá nhân.|
         |**Actor(s)**|Mọi tác nhân|
         |**Priority**|Should Have|
         |**Trigger**|Người dùng nhấn vào liên kết "Quên mật khẩu" ở màn hình Đăng nhập, hoặc chọn "Đổi mật khẩu" trong Quản lý tài khoản.|
         |**Pre-Condition(s)**|Người dùng phải sở hữu (truy cập được) vào hòm thư Email đã đăng ký.|
         |**Post-Condition(s)**|Mật khẩu mới được cập nhật thành công vào cơ sở dữ liệu.|
         |**Basic Flow**|<p>(Luồng Quên mật khẩu)</p><p>1\. Người dùng chọn lệnh "Quên mật khẩu" tại màn hình Đăng nhập.</p><p>2\. Hệ thống yêu cầu cung cấp Email định danh.</p><p>3\. Người dùng nhập Email và chọn lệnh "Gửi mã xác thực".</p><p>4\. Hệ thống tra cứu thông tin và gửi mã OTP xác nhận về hòm thư Email.</p><p>5\. Người dùng nhập mã OTP và nhập Mật khẩu mới mong muốn.</p><p>6\. Hệ thống xác thực OTP. Nếu hợp lệ, hệ thống tiến hành mã hóa bảo mật mật khẩu mới và ghi đè lên dữ liệu cũ.</p><p>7\. Hệ thống thông báo cập nhật thành công và đưa người dùng về lại trang Đăng nhập.</p>|
         |**Alternative Flow**|<p>1a. Luồng chủ động Đổi mật khẩu:</p><p>1a1. Người dùng đã đăng nhập, truy cập vào tab "Đổi mật khẩu" ở trang Hồ sơ.</p><p>1a2. Hệ thống yêu cầu nhập Mật khẩu hiện tại và Mật khẩu mới.</p><p>1a3. Hệ thống đối chiếu mật khẩu hiện tại. Nếu trùng khớp, hệ thống tiến hành cập nhật mật khẩu mới thành công.</p><p>*Use Case kết thúc.*</p>|
         |**Exception Flow**|<p>4a. Email không tồn tại:</p><p>4a1. Hệ thống báo lỗi "Tài khoản Email không tồn tại" và chặn lệnh gửi mã.</p><p>1a3.1 (Ngoại lệ của 1a): Mật khẩu hiện tại không khớp:</p><p>1a3.2. Hệ thống báo lỗi bôi đỏ tại trường nhập liệu và từ chối cập nhật.</p>|
         |**Business Rules**|- **BR29-1:** Mật khẩu bắt buộc phải có độ dài tối thiểu 8 ký tự để đảm bảo tiêu chuẩn an toàn.|
         |**Non-Functional Requirement**|- **NFR29-1:** Mật khẩu mới tuyệt đối không được lưu dưới dạng văn bản thô (Plain-text). Backend (Spring Boot) bắt buộc phải băm (hash) mật khẩu bằng thuật toán BCrypt trước khi lưu vào Database.|

Trang 2

