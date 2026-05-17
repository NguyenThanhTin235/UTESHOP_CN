/**
 * Middleware xác thực đơn giản để phục vụ demo UC04
 * Trong thực tế sẽ dùng JWT để verify và lấy user id
 */
const authMiddleware = (req, res, next) => {
  // Giả sử lấy user id từ Header (cho mục đích demo/test)
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({
      success: false,
      code: 401,
      message: 'Unauthorized: Vui lòng đăng nhập để thực hiện chức năng này',
      data: null,
      timestamp: Date.now()
    });
  }

  // Gán thông tin giả lập vào req.user
  req.user = { id: userId };
  next();
};

module.exports = authMiddleware;
