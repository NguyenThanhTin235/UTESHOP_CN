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
   * Quản lý địa chỉ: Lấy danh sách địa chỉ
   */
  async getAddresses(req, res) {
    try {
      const userId = req.user.id;
      const addresses = await userService.getAddresses(userId);

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Lấy danh sách địa chỉ thành công',
        data: toCamelCase(addresses),
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
  /**
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadNotificationCount(req, res) {
    try {
      const Notification = require('../models/Notification');
      const userId = req.user.id;
      const count = await Notification.countDocuments({ user_id: userId, is_read: false });
      return res.status(200).json({ success: true, count });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Quản lý Wishlist: Lấy danh sách yêu thích
   */
  async getWishlist(req, res) {
    try {
      const userId = req.user.id;
      const Wishlist = require('../models/Wishlist');
      const Product = require('../models/Product');
      const ProductMedia = require('../models/ProductMedia');
      const Category = require('../models/Category');

      const wishlistItems = await Wishlist.find({ user_id: userId }).sort({ createdAt: -1 });

      const itemsWithDetails = await Promise.all(wishlistItems.map(async (item) => {
        const product = await Product.findById(item.product_id).lean();
        if (!product) return null;

        const media = await ProductMedia.find({ product_id: product._id }).sort({ sort_order: 1 });
        const category = await Category.findById(product.category_id);

        return {
          id: item._id.toString(),
          productId: product._id.toString(),
          name: product.name,
          slug: product.slug,
          mrpPrice: product.mrp_price,
          sellingPrice: product.selling_price,
          categoryName: category ? category.name : 'General',
          media: media.map(m => m.media_url),
          addedAt: item.createdAt
        };
      }));

      const filteredItems = itemsWithDetails.filter(item => item !== null);

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Lấy danh sách yêu thích thành công',
        data: filteredItems,
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      console.error('Get Wishlist Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'Lỗi hệ thống khi lấy danh sách yêu thích',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Quản lý Wishlist: Thêm vào danh sách yêu thích
   */
  async addToWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      const Wishlist = require('../models/Wishlist');
      const Product = require('../models/Product');

      if (!productId) {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Vui lòng cung cấp ID sản phẩm'
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      const existing = await Wishlist.findOne({ user_id: userId, product_id: productId });
      if (existing) {
        return res.status(200).json({
          success: true,
          code: 200,
          message: 'Sản phẩm đã có trong danh sách yêu thích'
        });
      }

      await Wishlist.create({ user_id: userId, product_id: productId });

      return res.status(201).json({
        success: true,
        code: 201,
        message: 'Đã thêm vào danh sách yêu thích'
      });
    } catch (error) {
      console.error('Add Wishlist Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'Lỗi hệ thống khi thêm vào danh sách yêu thích'
      });
    }
  }

  /**
   * Quản lý Wishlist: Xóa khỏi danh sách yêu thích
   */
  async removeFromWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      const Wishlist = require('../models/Wishlist');

      await Wishlist.findOneAndDelete({ user_id: userId, product_id: productId });

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Đã xóa khỏi danh sách yêu thích'
      });
    } catch (error) {
      console.error('Remove Wishlist Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'Lỗi hệ thống khi xóa khỏi danh sách yêu thích'
      });
    }
  }

  /**
   * Lấy cài đặt bảo mật
   */
  async getSecuritySettings(req, res) {
    try {
      const userId = req.user.id;
      const settings = await userService.getSecuritySettings(userId);
      return res.status(200).json({
        success: true,
        code: 200,
        data: settings,
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
   * Cập nhật cài đặt bảo mật
   */
  async updateSecuritySettings(req, res) {
    try {
      const userId = req.user.id;
      const settings = req.body;
      const updated = await userService.updateSecuritySettings(userId, settings);
      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Cập nhật cài đặt bảo mật thành công',
        data: updated,
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
   * Lấy lịch sử giao dịch xu của User
   */
  async getCoinTransactions(req, res) {
    try {
      const userId = req.user.id;
      const CoinTransaction = require('../models/CoinTransaction');
      const User = require('../models/User');

      const transactions = await CoinTransaction.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .populate('order_id', 'order_code total_final');

      const user = await User.findById(userId).select('coin_balance');

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Lấy lịch sử giao dịch xu thành công',
        data: {
          coinBalance: user ? user.coin_balance : 0,
          transactions: toCamelCase(transactions)
        },
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      console.error('Get Coin Transactions Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'Lỗi hệ thống khi lấy lịch sử giao dịch xu',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }
}

module.exports = new UserController();
