**Nhóm thực hiện: 01**
**Thành viên nhóm:**

| Họ tên | Mã số sinh viên | Nhiệm vụ (chức năng) |
| :--- | :--- | :--- |
| Nguyễn Thành Tin | 23110340 | Đăng ký |
| Trác Ngọc Đăng Khoa | 23110243 | Đăng nhập |
| Phan Đình Duẩn | 23110192 | Quên mật khẩu |
| Nguyễn Duy Cường | 23110189 | Cập nhật thông tin |

---

### 1. Chức năng Đăng ký tài khoản
#### 1.1. Đặc tả UC01: Đăng ký tài khoản (Register)

| Trường | Nội dung |
| :--- | :--- |
| **Use Case ID** | UC01 |
| **Use Case Name** | Đăng ký tài khoản |
| **Description** | Là một Khách vãng lai, tôi muốn đăng ký tài khoản thành viên thông qua mã xác thực OTP gửi về email. Hệ thống có cơ chế bảo vệ biểu mẫu khỏi việc đăng ký tự động/spam. |
| **Actor(s)** | Khách vãng lai (Guest) |
| **Priority** | Must Have |
| **Trigger** | Người dùng nhấn nút "Đăng ký" trên giao diện. |
| **Pre-Condition(s)** | Người dùng chưa đăng nhập vào hệ thống. |
| **Post-Condition(s)** | Tài khoản được tạo thành công, người dùng được chuyển trạng thái thành Khách hàng (User) và được cấp phiên làm việc. |
| **Basic Flow** | 1. Người chọn lệnh "Đăng ký" trên màn hình.<br>2. Hệ thống hiển thị biểu mẫu yêu cầu cung cấp thông tin (Họ tên, Email, Mật khẩu).<br>3. Người dùng nhập thông tin và nhấn "Gửi mã OTP".<br>4. Hệ thống kiểm tra tính hợp lệ của thông tin vừa nhập (điền đủ, đúng định dạng) và kiểm tra tần suất gửi yêu cầu từ IP này để phòng chống spam.<br>5. Hệ thống kiểm tra Email. Nếu Email chưa từng được sử dụng, hệ thống sẽ gửi một mã OTP gồm 6 chữ số đến hòm thư của người dùng.<br>6. Người dùng mở Email, lấy mã OTP, nhập vào hệ thống và nhấn "Tạo tài khoản".<br>7. Hệ thống kiểm tra tính hợp lệ của mã OTP. Nếu chính xác, hệ thống khởi tạo tài khoản mới.<br>8. Hệ thống thông báo đăng ký thành công, tự động đăng nhập và đưa người dùng về Trang chủ. |
| **Alternative Flow** | 3a. Người dùng chọn lệnh "Chuyển sang Đăng nhập". Hệ thống chuyển đổi biểu mẫu sang màn hình Đăng nhập. |
| **Exception Flow** | 4a. Thiếu thông tin hoặc sai định dạng (Validation): Hệ thống hiển thị thông báo lỗi (màu đỏ) ngay tại các ô nhập liệu tương ứng và yêu cầu nhập lại.<br>4b. Gửi quá nhiều yêu cầu (Rate Limiting): Hệ thống chặn hành động và hiển thị thông báo "Bạn đã thao tác quá nhiều lần, vui lòng thử lại sau 10 phút".<br>5a. Email đã tồn tại: Hệ thống thông báo "Email này đã được đăng ký tài khoản".<br>7a. Mã OTP sai hoặc hết hạn: Hệ thống hiển thị cảnh báo "Mã OTP không chính xác hoặc đã hết hạn". |
| **Business Rules** | - BR01-1: Mã OTP chỉ bao gồm 6 chữ số ngẫu nhiên và có thời gian hiệu lực giới hạn.<br>- BR01-2: Mật khẩu phải đáp ứng độ dài tối thiểu và độ phức tạp an toàn. |
| **Non-Functional** | - NFR01-1: Hệ thống gửi Email chứa mã OTP trong thời gian không quá 5 giây kể từ lúc nhấn nút. |

#### 1.2. Sequence diagram
*(Sơ đồ tuần tự được đính kèm trong tài liệu gốc)*

---

### 2. Chức năng Đăng nhập (Login)
#### 2.1. Đặc tả UC02: Đăng nhập (Login)

| Trường | Nội dung |
| :--- | :--- |
| **Use Case ID** | UC02 |
| **Use Case Name** | Đăng nhập |
| **Description** | Là một Người dùng, tôi muốn đăng nhập vào hệ thống bằng Email và Mật khẩu. Hệ thống sẽ tự động nhận diện phân quyền và điều hướng tôi tới không gian làm việc phù hợp. |
| **Actor(s)** | Người dùng (User), Quản trị viên (Admin) |
| **Priority** | Must Have |
| **Trigger** | Người dùng truy cập trang Đăng nhập và điền thông tin. |
| **Pre-Condition(s)** | Người dùng đã có tài khoản hợp lệ trên hệ thống. |
| **Post-Condition(s)** | Đăng nhập thành công, hệ thống thiết lập phiên làm việc và điều hướng người dùng tới giao diện tương ứng với quyền hạn. |
| **Basic Flow** | 1. Người dùng truy cập trang Đăng nhập.<br>2. Người dùng nhập Email, Mật khẩu đã đăng ký và nhấn nút "Đăng nhập".<br>3. Hệ thống kiểm tra dữ liệu đầu vào (không được bỏ trống) và kiểm tra tần suất đăng nhập sai để ngăn chặn hành vi dò rỉ mật khẩu (Brute-force).<br>4. Hệ thống đối chiếu Email và Mật khẩu với cơ sở dữ liệu.<br>5. Nếu thông tin chính xác, hệ thống thiết lập phiên làm việc bảo mật cho người dùng.<br>6. Hệ thống tự động kiểm tra vai trò (Role) của tài khoản và tiến hành điều hướng:<br>- Nếu là User: Chuyển hướng sang trang Hồ sơ cá nhân (/user/profile).<br>- Nếu là Admin: Chuyển hướng sang trang Quản trị (/admin/profile). |
| **Alternative Flow** | Không có. |
| **Exception Flow** | 3a. Thiếu thông tin (Validation): Hệ thống báo lỗi yêu cầu điền đầy đủ Email và Mật khẩu.<br>3b. Đăng nhập sai quá nhiều lần (Rate Limiting): Hệ thống hiển thị thông báo "Tài khoản tạm khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau 15 phút" để bảo vệ tài khoản.<br>4a. Thông tin không khớp: Hệ thống báo lỗi "Email hoặc mật khẩu không chính xác" và yêu cầu người dùng nhập lại. |
| **Business Rules** | - BR02-1: Quyền hạn điều hướng trang (URL trả về) phụ thuộc tuyệt đối vào cấp độ định danh của người dùng lưu trong hệ thống, người dùng không thể tự can thiệp. |
| **Non-Functional** | - NFR02-1: Về mặt kỹ thuật, "Phiên làm việc" phải được quản lý bằng chuẩn mã hóa JSON Web Token (JWT).<br>- NFR02-2: Mật khẩu của người dùng bắt buộc phải được mã hóa bằng BCrypt khi đối chiếu. |

#### 2.2. Sequence diagram
*(Sơ đồ tuần tự được đính kèm trong tài liệu gốc)*

---

### 3. Chức năng Quên mật khẩu (Forgot Password)
#### 3.1. Đặc tả UC03: Quên mật khẩu (Forgot Password)

| Trường | Nội dung |
| :--- | :--- |
| **Use Case ID** | UC03 |
| **Use Case Name** | Đổi / Quên mật khẩu |
| **Description** | Là một Người dùng, tôi muốn thiết lập lại mật khẩu khi bị quên hoặc chủ động đổi mật khẩu để bảo vệ an toàn cho tài khoản cá nhân. |
| **Actor(s)** | Người dùng (User), Quản trị viên (Admin) |
| **Priority** | Should Have |
| **Trigger** | Người dùng nhấn vào liên kết "Quên mật khẩu" ở màn hình Đăng nhập, hoặc chọn "Đổi mật khẩu" trong Quản lý tài khoản. |
| **Pre-Condition(s)** | Người dùng phải truy cập được vào hòm thư Email đã đăng ký. |
| **Post-Condition(s)** | Mật khẩu mới được cập nhật thành công vào cơ sở dữ liệu. |
| **Basic Flow** | 1. Người dùng chọn lệnh "Quên mật khẩu" tại màn hình Đăng nhập.<br>2. Hệ thống yêu cầu cung cấp Email định danh.<br>3. Người dùng nhập Email và chọn lệnh "Gửi mã xác thực".<br>4. Hệ thống kiểm tra tần suất yêu cầu để chống spam, sau đó tra cứu thông tin và gửi mã OTP xác nhận về hòm thư Email.<br>5. Người dùng nhập mã OTP và nhập Mật khẩu mới mong muốn.<br>6. Hệ thống xác thực OTP. Nếu hợp lệ, hệ thống tiến hành mã hóa bảo mật mật khẩu mới và ghi đè lên dữ liệu cũ.<br>7. Hệ thống thông báo cập nhật thành công và đưa người dùng về lại trang Đăng nhập. |
| **Alternative Flow** | Không có |
| **Exception Flow** | 4a. Gửi quá nhiều yêu cầu (Rate Limiting): Hệ thống chặn lệnh gửi mã OTP và báo lỗi "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau".<br>4b. Email không tồn tại: Hệ thống báo lỗi "Tài khoản Email không tồn tại" và chặn lệnh gửi mã. |
| **Business Rules** | - BR03-1: Mật khẩu bắt buộc phải có độ dài tối thiểu 8 ký tự, có chữ số và ký tự đặc biệt để đảm bảo tiêu chuẩn an toàn. |
| **Non-Functional** | - NFR03-1: Mật khẩu mới tuyệt đối không được lưu dưới dạng văn bản thô. Backend bắt buộc phải băm (hash) bằng thuật toán BCrypt trước khi lưu vào Database. |

#### 3.2. Sequence diagram
*(Sơ đồ tuần tự được đính kèm trong tài liệu gốc)*

---

### 4. Chức năng Cập nhật thông tin cá nhân (Edit Profile)
#### 4.1. Đặc tả UC04: Cập nhật thông tin cá nhân (Edit Profile)

| Trường | Nội dung |
| :--- | :--- |
| **Use Case ID** | UC04 |
| **Use Case Name** | Cập nhật thông tin cá nhân |
| **Description** | Là một Người dùng, tôi muốn cập nhật thông tin cá nhân của mình để hệ thống lưu trữ đúng dữ liệu liên lạc phục vụ cho quá trình xác thực và chăm sóc. |
| **Actor(s)** | Người dùng (User) |
| **Priority** | Must Have |
| **Trigger** | Người dùng truy cập vào Menu "Tài khoản của tôi" và chọn tab "Hồ sơ cá nhân". |
| **Pre-Condition(s)** | Người dùng đã đăng nhập vào hệ thống và đang sở hữu phiên làm việc (Token) còn hiệu lực. |
| **Post-Condition(s)** | Thông tin cá nhân mới được cập nhật thành công vào cơ sở dữ liệu. |
| **Basic Flow** | 1. Người dùng truy cập tab "Hồ sơ cá nhân".<br>2. Hệ thống xác thực danh tính người dùng thông qua phiên làm việc hiện tại.<br>3. Nếu hợp lệ, hệ thống truy xuất dữ liệu cá nhân tương ứng và hiển thị trên biểu mẫu (Form).<br>4. Người dùng thực hiện chỉnh sửa các trường thông tin mong muốn (Họ tên, Số điện thoại).<br>5. Người dùng nhấn nút "Lưu thay đổi".<br>6. Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào.<br>7. Hệ thống ghi nhận thông tin mới vào cơ sở dữ liệu.<br>8. Hệ thống hiển thị thông báo "Cập nhật thành công" và làm mới lại dữ liệu hiển thị. |
| **Alternative Flow** | Không có. |
| **Exception Flow** | 2a. Lỗi xác thực (Authentication): Nếu phiên làm việc (Token) không hợp lệ, bị giả mạo hoặc đã hết hạn, hệ thống sẽ từ chối truy cập, trả về lỗi "Unauthorized" và yêu cầu đăng nhập lại.<br>6a. Thiếu thông tin (Validation): Người dùng bỏ trống trường thông tin bắt buộc (Họ tên) hoặc sai định dạng. Hệ thống hiển thị thông báo lỗi bôi đỏ tại trường tương ứng và chặn lệnh lưu. |
| **Business Rules** | - BR04-1: Người dùng không được phép thay đổi Email đăng nhập. Trường Email được đặt ở chế độ Read-only (Chỉ đọc) trên giao diện. |
| **Non-Functional** | *(Để trống)* |

#### 4.2. Sequence diagram
*(Sơ đồ tuần tự được đính kèm trong tài liệu gốc)*

---
