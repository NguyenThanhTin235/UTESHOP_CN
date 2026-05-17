const User = require('../models/User');

class UserService {
  /**
   * Lấy thông tin cá nhân
   * @param {string} userId 
   */
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  /**
   * Đổi mật khẩu (dành cho user đã đăng nhập)
   */
  async changePassword(userId, oldPassword, newPassword) {
    const bcrypt = require('bcryptjs');
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error('Mật khẩu cũ không chính xác');
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return true;
  }

  /**
   * Cập nhật thông tin cá nhân (UC04 + mở rộng)
   * @param {string} userId - ID của người dùng
   * @param {object} updateData - Dữ liệu cần cập nhật
   */
  async updateProfile(userId, updateData) {
    try {
      // Các trường được phép cập nhật công khai
      const allowedFields = ['full_name', 'phone', 'avatar_url', 'student_id', 'faculty'];
      const updates = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Thêm địa chỉ mới
   */
  async addAddress(userId, addressData) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Nếu là địa chỉ đầu tiên, tự động đặt làm mặc định
    if (user.addresses.length === 0) {
      addressData.is_default = true;
    } else if (addressData.is_default) {
      // Nếu đặt địa chỉ mới làm mặc định, bỏ mặc định các địa chỉ cũ
      user.addresses.forEach(addr => addr.is_default = false);
    }

    user.addresses.push(addressData);
    await user.save();
    return user.addresses[user.addresses.length - 1];
  }

  /**
   * Cập nhật địa chỉ
   */
  async updateAddress(userId, addressId, updateData) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const address = user.addresses.id(addressId);
    if (!address) throw new Error('Address not found');

    if (updateData.is_default && !address.is_default) {
      user.addresses.forEach(addr => addr.is_default = false);
    }

    Object.assign(address, updateData);
    await user.save();
    return address;
  }

  /**
   * Xóa địa chỉ
   */
  async removeAddress(userId, addressId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const address = user.addresses.id(addressId);
    if (!address) throw new Error('Address not found');

    const wasDefault = address.is_default;
    user.addresses.pull(addressId);

    // Nếu xóa địa chỉ mặc định, đặt địa chỉ đầu tiên còn lại làm mặc định
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].is_default = true;
    }

    await user.save();
    return user.addresses;
  }
}

module.exports = new UserService();
