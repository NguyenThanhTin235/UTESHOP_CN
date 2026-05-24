const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const ProductMedia = require('../models/ProductMedia');
const Category = require('../models/Category');
const Shop = require('../models/Shop');
const { toCamelCase } = require('../utils/formatter');

class CartController {
  /**
   * Lấy thông tin giỏ hàng của người dùng hiện tại
   */
  async getCart(req, res) {
    try {
      const userId = req.user.id;

      // Tìm hoặc tạo mới giỏ hàng cho người dùng
      let cart = await Cart.findOne({ user_id: userId });
      if (!cart) {
        cart = await Cart.create({ user_id: userId });
      }

      // Lấy danh sách các mục trong giỏ hàng
      const items = await CartItem.find({ cart_id: cart._id })
        .sort({ _id: -1 })
        .populate({
          path: 'product_id',
          populate: { path: 'shop_id' }
        })
        .populate('variant_id');

      // Ánh xạ dữ liệu chi tiết (ảnh sản phẩm, danh mục, cửa hàng)
      const formattedItems = await Promise.all(
        items.map(async (item) => {
          const product = item.product_id;
          if (!product) return null;

          // Lấy hình ảnh đầu tiên của sản phẩm
          const media = await ProductMedia.findOne({ product_id: product._id }).sort({ sort_order: 1 });
          // Lấy danh mục sản phẩm
          const category = await Category.findById(product.category_id);
          const shop = product.shop_id;

          // Xử lý thông tin biến thể
          let variantName = 'Standard';
          let additionalPrice = 0;
          let stockQuantity = 100; // Mặc định nếu không có giới hạn kho hoặc không dùng biến thể

          if (item.variant_id) {
            const v = item.variant_id;
            additionalPrice = v.additional_price || 0;
            stockQuantity = v.stock_quantity || 0;
            if (v.attributes) {
              variantName = Object.entries(v.attributes)
                .map(([key, val]) => `${key}: ${val}`)
                .join(' | ');
            }
          }

          return {
            id: item._id.toString(),
            productId: product._id.toString(),
            name: product.name,
            slug: product.slug,
            category: category ? category.name : 'Academic',
            imageUrl: media ? media.media_url : 'https://via.placeholder.com/150',
            price: product.selling_price + additionalPrice,
            mrpPrice: product.mrp_price + additionalPrice,
            quantity: item.quantity,
            note: item.note || '',
            variantId: item.variant_id ? item.variant_id._id.toString() : null,
            variant: variantName,
            stock: stockQuantity,
            shop: shop
              ? {
                  id: shop._id.toString(),
                  name: shop.name,
                  slug: shop.slug
                }
              : {
                  id: 'default',
                  name: 'UTEShop Official Store',
                  slug: 'uteshop'
                }
          };
        })
      );

      // Loại bỏ các mục null nếu sản phẩm bị xóa khỏi hệ thống
      const validItems = formattedItems.filter((i) => i !== null);

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Lấy thông tin giỏ hàng thành công',
        data: toCamelCase(validItems),
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      console.error('Get Cart Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'Lỗi hệ thống khi lấy thông tin giỏ hàng',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Thêm sản phẩm hoặc biến thể vào giỏ hàng
   */
  async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { productId, variantId, quantity = 1, note = '' } = req.body;

      if (!productId) {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Vui lòng cung cấp ID sản phẩm'
        });
      }

      // Kiểm tra sản phẩm tồn tại
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Sản phẩm không tồn tại hoặc đã bị ẩn'
        });
      }

      // Kiểm tra biến thể nếu có
      let variant = null;
      if (variantId) {
        variant = await ProductVariant.findById(variantId);
        if (!variant || variant.product_id.toString() !== productId) {
          return res.status(404).json({
            success: false,
            code: 404,
            message: 'Biến thể sản phẩm không hợp lệ'
          });
        }
      }

      // Tìm hoặc tạo mới giỏ hàng
      let cart = await Cart.findOne({ user_id: userId });
      if (!cart) {
        cart = await Cart.create({ user_id: userId });
      }

      // Kiểm tra xem sản phẩm/biến thể đã tồn tại trong giỏ hàng chưa
      const query = { cart_id: cart._id, product_id: productId };
      if (variantId) {
        query.variant_id = variantId;
      } else {
        query.variant_id = null;
      }

      let cartItem = await CartItem.findOne(query);

      const targetQuantity = cartItem ? cartItem.quantity + Number(quantity) : Number(quantity);

      // Kiểm tra tồn kho của biến thể
      if (variant && variant.stock_quantity < targetQuantity) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: `Số lượng yêu cầu vượt quá tồn kho còn lại (${variant.stock_quantity} sản phẩm)`
        });
      }

      if (cartItem) {
        cartItem.quantity = targetQuantity;
        if (note) cartItem.note = note;
        await cartItem.save();
      } else {
        cartItem = await CartItem.create({
          cart_id: cart._id,
          product_id: productId,
          variant_id: variantId || null,
          quantity: Number(quantity),
          note
        });
      }

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Đã thêm sản phẩm vào giỏ hàng thành công',
        data: toCamelCase(cartItem),
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      console.error('Add to Cart Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'Lỗi hệ thống khi thêm vào giỏ hàng',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Cập nhật số lượng hoặc ghi chú của sản phẩm trong giỏ hàng
   */
  async updateCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { itemId, quantity, note } = req.body;

      if (!itemId) {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Vui lòng cung cấp ID của mục giỏ hàng cần cập nhật'
        });
      }

      // Tìm giỏ hàng của người dùng
      const cart = await Cart.findOne({ user_id: userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Không tìm thấy giỏ hàng của người dùng'
        });
      }

      // Tìm mục trong giỏ hàng
      const cartItem = await CartItem.findOne({ _id: itemId, cart_id: cart._id });
      if (!cartItem) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Sản phẩm không tồn tại trong giỏ hàng của bạn'
        });
      }

      // Cập nhật số lượng
      if (quantity !== undefined) {
        const qtyNum = Number(quantity);
        if (qtyNum < 1) {
          return res.status(400).json({
            success: false,
            code: 400,
            message: 'Số lượng sản phẩm tối thiểu phải là 1'
          });
        }

        // Kiểm tra tồn kho nếu có biến thể
        if (cartItem.variant_id) {
          const variant = await ProductVariant.findById(cartItem.variant_id);
          if (variant && variant.stock_quantity < qtyNum) {
            return res.status(400).json({
              success: false,
              code: 400,
              message: `Số lượng vượt quá tồn kho còn lại (${variant.stock_quantity} sản phẩm)`
            });
          }
        }
        cartItem.quantity = qtyNum;
      }

      // Cập nhật ghi chú
      if (note !== undefined) {
        cartItem.note = note;
      }

      await cartItem.save();

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Cập nhật giỏ hàng thành công',
        data: toCamelCase(cartItem),
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      console.error('Update Cart Item Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'Lỗi hệ thống khi cập nhật giỏ hàng',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Xóa một sản phẩm khỏi giỏ hàng
   */
  async removeCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;

      const cart = await Cart.findOne({ user_id: userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Không tìm thấy giỏ hàng'
        });
      }

      const deletedItem = await CartItem.findOneAndDelete({ _id: itemId, cart_id: cart._id });
      if (!deletedItem) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Mục giỏ hàng không tồn tại hoặc không thuộc về bạn'
        });
      }

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Đã xóa sản phẩm khỏi giỏ hàng thành công',
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      console.error('Remove Cart Item Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'Lỗi hệ thống khi xóa sản phẩm khỏi giỏ hàng',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  async clearCart(req, res) {
    try {
      const userId = req.user.id;

      const cart = await Cart.findOne({ user_id: userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Không tìm thấy giỏ hàng'
        });
      }

      await CartItem.deleteMany({ cart_id: cart._id });

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Đã xóa toàn bộ giỏ hàng thành công',
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      console.error('Clear Cart Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'Lỗi hệ thống khi xóa toàn bộ giỏ hàng',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }
}

module.exports = new CartController();
