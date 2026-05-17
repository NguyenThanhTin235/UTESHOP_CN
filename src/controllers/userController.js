const userService = require('../services/userService');
const { toCamelCase } = require('../utils/formatter');

class UserController {
  /**
   * Lấy thông tin cá nhân hiện tại
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await userService.getProfile(userId);

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Lấy thông tin hồ sơ thành công',
        data: toCamelCase(user),
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: error.message,
        data: null,
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Cập nhật thông tin cá nhân
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      if (updateData.full_name === '') {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Họ tên không được để trống',
          errors: { full_name: 'Họ tên không được để trống' }
        });
      }

      const updatedUser = await userService.updateProfile(userId, updateData);

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Cập nhật thông tin thành công',
        data: toCamelCase(updatedUser),
        timestamp: Math.floor(Date.now() / 1000)
      });

    } catch (error) {
      console.error('Update Profile Error:', error);
      const statusCode = error.message === 'User not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        code: statusCode,
        message: error.message || 'Lỗi hệ thống khi cập nhật hồ sơ',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới'
        });
      }

      // Kiểm tra độ phức tạp mật khẩu mới (BR03-1)
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Mật khẩu mới phải từ 8 ký tự, bao gồm chữ số và ký tự đặc biệt'
        });
      }

      await userService.changePassword(userId, oldPassword, newPassword);

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Đổi mật khẩu thành công',
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      const statusCode = error.message === 'Mật khẩu cũ không chính xác' ? 401 : 500;
      return res.status(statusCode).json({
        success: false,
        code: statusCode,
        message: error.message,
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Quản lý địa chỉ: Thêm địa chỉ
   */
  async addAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressData = req.body;

      // Validation cơ bản
      if (!addressData.recipient_name || !addressData.recipient_phone || !addressData.street_address) {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Vui lòng cung cấp đầy đủ thông tin địa chỉ',
          timestamp: Math.floor(Date.now() / 1000)
        });
      }

      const newAddress = await userService.addAddress(userId, addressData);
      return res.status(201).json({
        success: true,
        code: 201,
        message: 'Thêm địa chỉ thành công',
        data: toCamelCase(newAddress),
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: error.message,
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Quản lý địa chỉ: Xóa địa chỉ
   */
  async removeAddress(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;

      const updatedAddresses = await userService.removeAddress(userId, addressId);
      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Xóa địa chỉ thành công',
        data: toCamelCase(updatedAddresses),
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      const statusCode = error.message === 'Address not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        code: statusCode,
        message: error.message,
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Quản lý địa chỉ: Cập nhật địa chỉ
   */
  async updateAddress(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;
      const updateData = req.body;

      const updatedAddress = await userService.updateAddress(userId, addressId, updateData);
      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Cập nhật địa chỉ thành công',
        data: toCamelCase(updatedAddress),
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      const statusCode = error.message === 'Address not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        code: statusCode,
        message: error.message,
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }
}

module.exports = new UserController();
