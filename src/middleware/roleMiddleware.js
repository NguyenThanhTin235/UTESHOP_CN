const response = require('../utils/response');

/**
 * Middleware để kiểm tra quyền Admin
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return response.error(res, {
    statusCode: 403,
    message: 'Quyền truy cập bị từ chối: Yêu cầu quyền Quản trị viên'
  });
};

/**
 * Middleware để kiểm tra quyền Vendor
 */
const isVendor = (req, res, next) => {
  if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
    return next();
  }
  return response.error(res, {
    statusCode: 403,
    message: 'Quyền truy cập bị từ chối: Yêu cầu quyền Người bán'
  });
};

/**
 * Middleware để kiểm tra quyền Shipper
 */
const isShipper = (req, res, next) => {
  if (req.user && (req.user.role === 'shipper' || req.user.role === 'admin')) {
    return next();
  }
  return response.error(res, {
    statusCode: 403,
    message: 'Quyền truy cập bị từ chối: Yêu cầu quyền Nhân viên giao hàng'
  });
};

module.exports = {
  isAdmin,
  isVendor,
  isShipper
};
