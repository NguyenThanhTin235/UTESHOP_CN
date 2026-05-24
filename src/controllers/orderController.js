const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const OrderCancellation = require('../models/OrderCancellation');
const PaymentOrder = require('../models/PaymentOrder');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const ProductMedia = require('../models/ProductMedia');
const Shop = require('../models/Shop');
const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');
const Coupon = require('../models/Coupon');
const CouponRedemption = require('../models/CouponRedemption');
const Notification = require('../models/Notification');
const { toCamelCase, formatMeta } = require('../utils/formatter');

/**
 * Helper to send notification to a user and emit via socket.io
 */
async function sendOrderNotification(req, { userId, orderId, title, content, detailContent }) {
  try {
    const firstOrderItem = await OrderItem.findOne({ order_id: orderId }).populate('product_id').populate('variant_id');
    let orderSummary = undefined;
    if (firstOrderItem && firstOrderItem.product_id) {
      const media = await ProductMedia.findOne({ product_id: firstOrderItem.product_id._id }).sort({ sort_order: 1 });
      const imageUrl = media ? media.media_url : 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400';

      let variantName = 'Standard';
      if (firstOrderItem.variant_id && firstOrderItem.variant_id.attributes) {
        variantName = Object.entries(firstOrderItem.variant_id.attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ');
      }

      orderSummary = {
        name: firstOrderItem.product_id.name,
        qty: firstOrderItem.quantity,
        variant: variantName,
        image: imageUrl
      };
    }

    const notification = await Notification.create({
      user_id: userId,
      title,
      content,
      detailContent,
      category: 'Orders',
      type: 'order',
      date: 'JUST NOW',
      link: `/order-history/${orderId}`,
      orderSummary
    });

    const io = req.app.get('socketio');
    if (io) {
      io.to(userId.toString()).emit('notification', {
        id: notification._id.toString(),
        title: notification.title,
        content: notification.content,
        detailContent: notification.detailContent,
        category: notification.category,
        type: notification.type,
        date: 'JUST NOW',
        link: notification.link,
        orderSummary: notification.orderSummary,
        is_read: false
      });
    }
    return notification;
  } catch (err) {
    console.error('Notification Helper Error:', err);
  }
}

class OrderController {
  /**
   * Get orders list for logged-in user with filters, search, and pagination
   */
  async getOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const status = req.query.status || 'all';
      const search = req.query.search || '';
      let page = parseInt(req.query.page) || 1;
      if (page < 1) page = 1;
      let limit = parseInt(req.query.limit) || 5;
      if (limit < 1) limit = 5;
      const skip = (page - 1) * limit;

      const query = { customer_id: userId };

      // Filter by status (unless 'all')
      if (status !== 'all') {
        query.status = status;
      }

      // Implement robust search matching order code, product name, or shop name
      if (search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');

        // 1. Search matching shops
        const matchingShops = await Shop.find({ name: { $regex: searchRegex } }).select('_id');
        const shopIds = matchingShops.map(s => s._id);

        // 2. Search matching products
        const matchingProducts = await Product.find({ name: { $regex: searchRegex } }).select('_id');
        const productIds = matchingProducts.map(p => p._id);

        // 3. Find Order IDs that contain those products
        let orderIdsFromItems = [];
        if (productIds.length > 0) {
          const matchingItems = await OrderItem.find({ product_id: { $in: productIds } }).select('order_id');
          orderIdsFromItems = matchingItems.map(item => item.order_id);
        }

        // Apply matching constraints to query
        query.$or = [
          { order_code: { $regex: searchRegex } },
          { shop_id: { $in: shopIds } },
          { _id: { $in: orderIdsFromItems } }
        ];
      }

      // Count total matches
      const total = await Order.countDocuments(query);

      // Fetch paginated orders
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'shop_id',
          select: 'name slug logo_url'
        })
        .populate({
          path: 'payment_order_id',
          select: 'payment_method payment_status payment_code'
        });

      // Populate items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const orderItems = await OrderItem.find({ order_id: order._id })
            .populate('product_id', 'name slug')
            .populate('variant_id');

          const items = await Promise.all(
            orderItems.map(async (item) => {
              if (!item.product_id) return null;

              // Find product main image
              const media = await ProductMedia.findOne({ product_id: item.product_id._id }).sort({ sort_order: 1 });
              const imageUrl = media ? media.media_url : 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400';

              let variantName = 'Standard';
              if (item.variant_id && item.variant_id.attributes) {
                variantName = Object.entries(item.variant_id.attributes)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' | ');
              }

              return {
                id: item._id,
                productId: item.product_id._id,
                name: item.product_id.name,
                slug: item.product_id.slug,
                variantId: item.variant_id ? item.variant_id._id : null,
                variantName,
                imageUrl,
                price: item.price_at_buy,
                quantity: item.quantity,
                subtotal: item.price_at_buy * item.quantity
              };
            })
          );

          // Clean null items if any product got deleted
          const cleanItems = items.filter(it => it !== null);

          return {
            ...order.toObject(),
            items: cleanItems
          };
        })
      );

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Order list retrieved successfully',
        data: toCamelCase(ordersWithItems),
        meta: formatMeta(total, ordersWithItems.length, limit, page)
      });
    } catch (error) {
      console.error('Get Orders Error:', error);
      next(error);
    }
  }

  /**
   * Get single order details with tracking log and payment info
   */
  async getOrderDetail(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Invalid order ID'
        });
      }

      // Find order
      const order = await Order.findOne({ _id: orderId, customer_id: userId })
        .populate({
          path: 'shop_id',
          select: 'name slug logo_url address phone'
        })
        .populate('payment_order_id');

      if (!order) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Order not found'
        });
      }

      // Find Order Items
      const orderItems = await OrderItem.find({ order_id: order._id })
        .populate('product_id', 'name slug')
        .populate('variant_id');

      const items = await Promise.all(
        orderItems.map(async (item) => {
          if (!item.product_id) return null;

          const media = await ProductMedia.findOne({ product_id: item.product_id._id }).sort({ sort_order: 1 });
          const imageUrl = media ? media.media_url : 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400';

          let variantName = 'Standard';
          if (item.variant_id && item.variant_id.attributes) {
            variantName = Object.entries(item.variant_id.attributes)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' | ');
          }

          return {
            id: item._id,
            productId: item.product_id._id,
            name: item.product_id.name,
            slug: item.product_id.slug,
            variantId: item.variant_id ? item.variant_id._id : null,
            variantName,
            imageUrl,
            price: item.price_at_buy,
            quantity: item.quantity,
            subtotal: item.price_at_buy * item.quantity
          };
        })
      );

      const cleanItems = items.filter(it => it !== null);

      // Find tracking status history
      const history = await OrderStatusHistory.find({ order_id: order._id })
        .sort({ createdAt: -1 })
        .populate('updated_by', 'fullName');

      // Find cancellation details if any
      const cancellation = await OrderCancellation.findOne({ order_id: order._id });

      // Find online payment transaction logs if MoMo/VNPAY/COD
      let paymentTransactions = [];
      if (order.payment_order_id) {
        paymentTransactions = await Payment.find({ payment_order_id: order.payment_order_id._id }).sort({ createdAt: -1 });
      }
      const paymentTransaction = paymentTransactions.length > 0 ? paymentTransactions[0] : null;

      // Generate a dynamic tracking log if no history was logged in DB
      let trackingTimeline = history.map(h => ({
        id: h._id,
        status: h.status,
        note: h.note || `Order status updated to ${h.status}`,
        createdAt: h.createdAt,
        updatedBy: h.updated_by ? h.updated_by.fullName : 'System'
      }));

      if (trackingTimeline.length === 0) {
        // Fallback log construction based on order current status
        trackingTimeline.push({
          status: 'pending',
          note: 'Order placed successfully - Pending payment confirmation',
          createdAt: order.createdAt
        });

        if (order.status !== 'pending') {
          trackingTimeline.unshift({
            status: 'confirmed',
            note: 'Order confirmed - Shop is preparing the products',
            createdAt: order.updatedAt
          });
        }
        if (['shipped', 'delivered'].includes(order.status)) {
          trackingTimeline.unshift({
            status: 'shipped',
            note: 'Order handed over to SPX shipping partner',
            createdAt: order.updatedAt
          });
        }
        if (order.status === 'delivered') {
          trackingTimeline.unshift({
            status: 'delivered',
            note: 'Delivery successful',
            createdAt: order.updatedAt
          });
        }
        if (order.status === 'canceled') {
          trackingTimeline.unshift({
            status: 'canceled',
            note: cancellation ? `Order has been cancelled. Reason: ${cancellation.reason}` : 'Order has been cancelled',
            createdAt: order.updatedAt
          });
        }
      }

      // Combine response
      const responseData = {
        ...order.toObject(),
        items: cleanItems,
        timeline: trackingTimeline,
        cancellation: cancellation ? {
          reason: cancellation.reason,
          cancelledAt: cancellation.cancelled_at || cancellation.createdAt
        } : null,
        paymentTransactions: paymentTransactions.map(pt => ({
          transactionId: pt.transaction_id,
          amount: pt.amount,
          status: pt.status,
          paymentDate: pt.payment_date || pt.createdAt,
          paymentMethod: pt.payment_method,
          responseData: pt.response_data
        })),
        paymentTransaction: paymentTransaction ? {
          transactionId: paymentTransaction.transaction_id,
          amount: paymentTransaction.amount,
          status: paymentTransaction.status,
          paymentDate: paymentTransaction.payment_date || paymentTransaction.createdAt,
          responseData: paymentTransaction.response_data
        } : null
      };

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Order details retrieved successfully',
        data: toCamelCase(responseData)
      });
    } catch (error) {
      console.error('Get Order Detail Error:', error);
      next(error);
    }
  }

  /**
   * Cancel an order (updates status, restores stock, refunds coins/payment if applicable)
   */
  async cancelOrder(req, res, next) {
    let session = null;
    let useTransaction = false;

    // Check if MongoDB is a replica set before trying to start transaction
    const isReplicaSet = mongoose.connection.client?.topology?.description?.type?.includes('ReplicaSet') || false;

    if (isReplicaSet) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
        useTransaction = true;
      } catch (e) {
        session = null;
        useTransaction = false;
      }
    }

    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim() === '') {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Please provide a reason for cancellation'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Invalid order ID'
        });
      }

      // Find order
      const order = await Order.findOne({ _id: orderId, customer_id: userId }).session(session);
      if (!order) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Order not found'
        });
      }

      // Validate status: can only cancel if 'pending' or 'confirmed'
      if (!['pending', 'confirmed'].includes(order.status)) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Cannot cancel order because it has been shipped or completed'
        });
      }

      const oldStatus = order.status;

      // Check if order is within 30 minutes of creation
      const timeDiff = Date.now() - new Date(order.createdAt).getTime();
      const isWithin30Mins = timeDiff <= 30 * 60 * 1000; // 30 minutes in milliseconds

      if (isWithin30Mins) {
        // --- CASE 1: Within 30 minutes - Cancel immediately without confirmation ---
        // 1. Update order status to canceled
        order.status = 'canceled';
        
        let coinsRefundedFromPayment = 0;
        if (order.payment_status === 'success') {
          coinsRefundedFromPayment = order.total_final;
          order.payment_status = 'refunded';
        } else {
          order.payment_status = order.payment_status === 'pending' ? 'failed' : order.payment_status; // mark failed/refunded
        }
        await order.save({ session });

        // Update pending payments to failed
        await Payment.updateMany(
          { payment_order_id: order.payment_order_id, status: 'pending' },
          { status: 'failed', payment_date: new Date() },
          { session }
        );

        // Update parent PaymentOrder and Payment to refunded if all sub-orders are refunded or failed
        if (coinsRefundedFromPayment > 0) {
          const paymentOrder = await PaymentOrder.findById(order.payment_order_id).session(session);
          if (paymentOrder) {
            const siblingOrders = await Order.find({ payment_order_id: paymentOrder._id }).session(session);
            const allRefundedOrFailed = siblingOrders.every(so => {
              if (so._id.toString() === order._id.toString()) return true;
              return so.payment_status === 'refunded' || so.payment_status === 'failed' || so.status === 'canceled';
            });
            if (allRefundedOrFailed) {
              paymentOrder.payment_status = 'refunded';
              await paymentOrder.save({ session });

              await Payment.updateMany(
                { payment_order_id: paymentOrder._id, status: 'success' },
                { status: 'refunded' },
                { session }
              );
            }
          }
        }

        // 2. Restore stocks of variants
        const orderItems = await OrderItem.find({ order_id: order._id }).session(session);
        for (const item of orderItems) {
          if (item.variant_id) {
            await ProductVariant.findByIdAndUpdate(
              item.variant_id,
              { $inc: { stock_quantity: item.quantity } },
              { session }
            );
          }
        }

        // 3. Refund user coins if coin_discount was used or if payment was refunded as coins
        if (order.coin_discount > 0 || coinsRefundedFromPayment > 0) {
          const user = await User.findById(userId).session(session);
          if (user) {
            const totalRefundAmount = order.coin_discount + coinsRefundedFromPayment;
            const balanceBefore = user.coin_balance;
            user.coin_balance += totalRefundAmount;
            await user.save({ session });

            // Record coin refund transaction
            let description = '';
            if (order.coin_discount > 0 && coinsRefundedFromPayment > 0) {
              description = `Coin refund (${order.coin_discount}) and payment cashback (${coinsRefundedFromPayment}) for cancelled order: ${order.order_code}`;
            } else if (order.coin_discount > 0) {
              description = `Coin refund for cancelled order: ${order.order_code}`;
            } else {
              description = `Payment cashback in coins for cancelled order: ${order.order_code}`;
            }

            await CoinTransaction.create([{
              user_id: userId,
              amount: totalRefundAmount,
              type: 'refund',
              description,
              balance_before: balanceBefore,
              balance_after: user.coin_balance
            }], { session });
          }
        }

        // 4. Release Coupon (decrease usage count) if coupon_discount was used
        if (order.coupon_discount > 0) {
          const paymentOrder = await PaymentOrder.findById(order.payment_order_id).session(session);
          if (paymentOrder && paymentOrder.coupon_id) {
            const coupon = await Coupon.findById(paymentOrder.coupon_id).session(session);
            if (coupon) {
              coupon.used_count = Math.max(0, coupon.used_count - 1);
              await coupon.save({ session });
            }
            await CouponRedemption.deleteOne({ order_id: order._id }).session(session);
          }
        }

        // 5. Save to OrderCancellation record
        await OrderCancellation.create([{
          order_id: order._id,
          user_id: userId,
          reason: reason.trim(),
          cancelled_at: new Date()
        }], { session });

        // 6. Save to OrderStatusHistory record
        await OrderStatusHistory.create([{
          order_id: order._id,
          status: 'canceled',
          note: `Order cancelled by customer. Reason: ${reason.trim()}`,
          updated_by: userId
        }], { session });

        if (useTransaction && session) {
          await session.commitTransaction();
          session.endSession();
        }

        // Send cancellation notification
        try {
          const firstOrderItem = await OrderItem.findOne({ order_id: order._id }).populate('product_id').populate('variant_id');
          let orderSummary = undefined;
          if (firstOrderItem && firstOrderItem.product_id) {
            const media = await ProductMedia.findOne({ product_id: firstOrderItem.product_id._id }).sort({ sort_order: 1 });
            const imageUrl = media ? media.media_url : 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400';

            let variantName = 'Standard';
            if (firstOrderItem.variant_id && firstOrderItem.variant_id.attributes) {
              variantName = Object.entries(firstOrderItem.variant_id.attributes)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' | ');
            }

            orderSummary = {
              name: firstOrderItem.product_id.name,
              qty: firstOrderItem.quantity,
              variant: variantName,
              image: imageUrl
            };
          }

          const notification = await Notification.create({
            user_id: userId,
            title: 'Order Cancelled Successfully',
            content: `Your order ${order.order_code} has been cancelled successfully.`,
            detailContent: `Hello,\n\nYour order ${order.order_code} has been cancelled successfully as requested. Any coins, coupons, or payments applied have been refunded.`,
            category: 'Orders',
            type: 'order',
            date: 'JUST NOW',
            link: `/order-history/${order._id}`,
            orderSummary
          });

          const io = req.app.get('socketio');
          if (io) {
            io.to(userId.toString()).emit('notification', {
              id: notification._id.toString(),
              title: notification.title,
              content: notification.content,
              detailContent: notification.detailContent,
              category: notification.category,
              type: notification.type,
              date: 'JUST NOW',
              link: notification.link,
              orderSummary: notification.orderSummary,
              is_read: false
            });
          }
        } catch (notifErr) {
          console.error('Cancellation Notification Error:', notifErr);
        }

        return res.status(200).json({
          success: true,
          code: 200,
          message: 'Order cancelled successfully',
          data: toCamelCase({
            orderId: order._id,
            orderCode: order.order_code,
            status: 'canceled',
            requiresConfirmation: false,
            refundedCoins: order.coin_discount + coinsRefundedFromPayment
          })
        });
      } else {
        // --- CASE 2: After 30 minutes - Requires confirmation from shop ---
        // 1. Update order status to cancel_pending
        order.status = 'cancel_pending';
        await order.save({ session });

        // 2. Save to OrderCancellation record (we still save the cancellation reason)
        await OrderCancellation.create([{
          order_id: order._id,
          user_id: userId,
          reason: reason.trim(),
          cancelled_at: new Date()
        }], { session });

        // 3. Save to OrderStatusHistory record
        await OrderStatusHistory.create([{
          order_id: order._id,
          status: 'cancel_pending',
          note: `Cancellation request submitted by customer. Awaiting shop confirmation. Reason: ${reason.trim()}`,
          updated_by: userId
        }], { session });

        if (useTransaction && session) {
          await session.commitTransaction();
          session.endSession();
        }

        // Send cancellation request notification
        try {
          const firstOrderItem = await OrderItem.findOne({ order_id: order._id }).populate('product_id').populate('variant_id');
          let orderSummary = undefined;
          if (firstOrderItem && firstOrderItem.product_id) {
            const media = await ProductMedia.findOne({ product_id: firstOrderItem.product_id._id }).sort({ sort_order: 1 });
            const imageUrl = media ? media.media_url : 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400';

            let variantName = 'Standard';
            if (firstOrderItem.variant_id && firstOrderItem.variant_id.attributes) {
              variantName = Object.entries(firstOrderItem.variant_id.attributes)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' | ');
            }

            orderSummary = {
              name: firstOrderItem.product_id.name,
              qty: firstOrderItem.quantity,
              variant: variantName,
              image: imageUrl
            };
          }

          const notification = await Notification.create({
            user_id: userId,
            title: 'Cancellation Request Pending',
            content: `Your cancellation request for order ${order.order_code} is pending shop confirmation.`,
            detailContent: `Hello,\n\nYou have requested to cancel order ${order.order_code}. Since the order was placed more than 30 minutes ago, this request requires confirmation from the shop.\n\nWe will notify you as soon as the seller responds to your request.`,
            category: 'Orders',
            type: 'order',
            date: 'JUST NOW',
            link: `/order-history/${order._id}`,
            orderSummary
          });

          const io = req.app.get('socketio');
          if (io) {
            io.to(userId.toString()).emit('notification', {
              id: notification._id.toString(),
              title: notification.title,
              content: notification.content,
              detailContent: notification.detailContent,
              category: notification.category,
              type: notification.type,
              date: 'JUST NOW',
              link: notification.link,
              orderSummary: notification.orderSummary,
              is_read: false
            });
          }
        } catch (notifErr) {
          console.error('Cancellation Request Pending Notification Error:', notifErr);
        }

        return res.status(200).json({
          success: true,
          code: 200,
          message: 'Cancellation request submitted. Awaiting shop confirmation.',
          data: toCamelCase({
            orderId: order._id,
            orderCode: order.order_code,
            status: 'cancel_pending',
            requiresConfirmation: true,
            refundedCoins: 0
          })
        });
      }

    } catch (error) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      console.error('Cancel Order Error:', error);
      next(error);
    }
  }

  /**
   * Get cancellation requests for seller's shop(s)
   */
  async getSellerCancellations(req, res, next) {
    try {
      const sellerId = req.user.id;

      // 1. Get shops owned by the seller
      const shops = await Shop.find({ owner_user_id: sellerId }).select('_id');
      if (!shops || shops.length === 0) {
        return res.status(200).json({
          success: true,
          code: 200,
          message: 'No shops found for this seller',
          data: []
        });
      }

      const shopIds = shops.map(s => s._id);

      // 2. Fetch orders in cancel_pending state for these shops
      const orders = await Order.find({
        shop_id: { $in: shopIds },
        status: 'cancel_pending'
      })
      .sort({ updatedAt: -1 })
      .populate('customer_id', 'fullName email')
      .populate('payment_order_id');

      // 3. Populate items and cancellation details
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const orderItems = await OrderItem.find({ order_id: order._id })
            .populate('product_id', 'name slug')
            .populate('variant_id');

          const items = await Promise.all(
            orderItems.map(async (item) => {
              if (!item.product_id) return null;

              const media = await ProductMedia.findOne({ product_id: item.product_id._id }).sort({ sort_order: 1 });
              const imageUrl = media ? media.media_url : 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400';

              let variantName = 'Standard';
              if (item.variant_id && item.variant_id.attributes) {
                variantName = Object.entries(item.variant_id.attributes)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' | ');
              }

              return {
                id: item._id,
                productId: item.product_id._id,
                name: item.product_id.name,
                slug: item.product_id.slug,
                variantId: item.variant_id ? item.variant_id._id : null,
                variantName,
                imageUrl,
                price: item.price_at_buy,
                quantity: item.quantity,
                subtotal: item.price_at_buy * item.quantity
              };
            })
          );

          const cleanItems = items.filter(it => it !== null);
          const cancellation = await OrderCancellation.findOne({ order_id: order._id });

          return {
            ...order.toObject(),
            items: cleanItems,
            cancellation: cancellation ? {
              reason: cancellation.reason,
              createdAt: cancellation.createdAt,
              cancelledAt: cancellation.cancelled_at || cancellation.createdAt
            } : null
          };
        })
      );

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Seller cancellation requests retrieved successfully',
        data: toCamelCase(ordersWithDetails)
      });
    } catch (error) {
      console.error('Get Seller Cancellations Error:', error);
      next(error);
    }
  }

  /**
   * Approve a cancellation request as a seller
   */
  async approveSellerCancellation(req, res, next) {
    let session = null;
    let useTransaction = false;

    const isReplicaSet = mongoose.connection.client?.topology?.description?.type?.includes('ReplicaSet') || false;
    if (isReplicaSet) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
        useTransaction = true;
      } catch (e) {
        session = null;
        useTransaction = false;
      }
    }

    try {
      const sellerId = req.user.id;
      const { orderId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Invalid order ID'
        });
      }

      // 1. Fetch order
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Order not found'
        });
      }

      // 2. Verify seller owns the shop for this order
      const shop = await Shop.findOne({ _id: order.shop_id, owner_user_id: sellerId }).session(session);
      if (!shop) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(403).json({
          success: false,
          code: 403,
          message: 'Access denied: You do not own the shop associated with this order'
        });
      }

      // 3. Verify order status is cancel_pending
      if (order.status !== 'cancel_pending') {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Order is not in cancel_pending state'
        });
      }

      // 4. Update order status to canceled
      order.status = 'canceled';
      
      let coinsRefundedFromPayment = 0;
      if (order.payment_status === 'success') {
        coinsRefundedFromPayment = order.total_final;
        order.payment_status = 'refunded';
      } else {
        order.payment_status = order.payment_status === 'pending' ? 'failed' : order.payment_status;
      }
      await order.save({ session });

      // Update pending payments to failed
      await Payment.updateMany(
        { payment_order_id: order.payment_order_id, status: 'pending' },
        { status: 'failed', payment_date: new Date() },
        { session }
      );

      // Update parent PaymentOrder and Payment to refunded if all sub-orders are refunded or failed
      if (coinsRefundedFromPayment > 0) {
        const paymentOrder = await PaymentOrder.findById(order.payment_order_id).session(session);
        if (paymentOrder) {
          const siblingOrders = await Order.find({ payment_order_id: paymentOrder._id }).session(session);
          const allRefundedOrFailed = siblingOrders.every(so => {
            if (so._id.toString() === order._id.toString()) return true;
            return so.payment_status === 'refunded' || so.payment_status === 'failed' || so.status === 'canceled';
          });
          if (allRefundedOrFailed) {
            paymentOrder.payment_status = 'refunded';
            await paymentOrder.save({ session });

            await Payment.updateMany(
              { payment_order_id: paymentOrder._id, status: 'success' },
              { status: 'refunded' },
              { session }
            );
          }
        }
      }

      // 5. Restore stocks of variants
      const orderItems = await OrderItem.find({ order_id: order._id }).session(session);
      for (const item of orderItems) {
        if (item.variant_id) {
          await ProductVariant.findByIdAndUpdate(
            item.variant_id,
            { $inc: { stock_quantity: item.quantity } },
            { session }
          );
        }
      }

      // 6. Refund user coins if coin_discount was used or if payment was refunded as coins
      if (order.coin_discount > 0 || coinsRefundedFromPayment > 0) {
        const user = await User.findById(order.customer_id).session(session);
        if (user) {
          const totalRefundAmount = order.coin_discount + coinsRefundedFromPayment;
          const balanceBefore = user.coin_balance;
          user.coin_balance += totalRefundAmount;
          await user.save({ session });

          // Record coin refund transaction
          let description = '';
          if (order.coin_discount > 0 && coinsRefundedFromPayment > 0) {
            description = `Coin refund (${order.coin_discount}) and payment cashback (${coinsRefundedFromPayment}) for cancelled order: ${order.order_code} (Approved by seller)`;
          } else if (order.coin_discount > 0) {
            description = `Coin refund for cancelled order: ${order.order_code} (Approved by seller)`;
          } else {
            description = `Payment cashback in coins for cancelled order: ${order.order_code} (Approved by seller)`;
          }

          await CoinTransaction.create([{
            user_id: order.customer_id,
            amount: totalRefundAmount,
            type: 'refund',
            description,
            balance_before: balanceBefore,
            balance_after: user.coin_balance
          }], { session });
        }
      }

      // 7. Release Coupon if coupon_discount was used
      if (order.coupon_discount > 0) {
        const paymentOrder = await PaymentOrder.findById(order.payment_order_id).session(session);
        if (paymentOrder && paymentOrder.coupon_id) {
          const coupon = await Coupon.findById(paymentOrder.coupon_id).session(session);
          if (coupon) {
            coupon.used_count = Math.max(0, coupon.used_count - 1);
            await coupon.save({ session });
          }
          await CouponRedemption.deleteOne({ order_id: order._id }).session(session);
        }
      }

      // 8. Save to OrderStatusHistory record
      await OrderStatusHistory.create([{
        order_id: order._id,
        status: 'canceled',
        note: 'Order cancellation request approved by shop seller.',
        updated_by: sellerId
      }], { session });

      // Commit transaction if using one
      if (useTransaction && session) {
        await session.commitTransaction();
        session.endSession();
      }

      // 9. Send Notification to Customer
      try {
        const firstOrderItem = await OrderItem.findOne({ order_id: order._id })
          .populate('product_id')
          .populate('variant_id');
        
        let orderSummary = undefined;
        if (firstOrderItem && firstOrderItem.product_id) {
          const media = await ProductMedia.findOne({ product_id: firstOrderItem.product_id._id }).sort({ sort_order: 1 });
          const imageUrl = media ? media.media_url : 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400';

          let variantName = 'Standard';
          if (firstOrderItem.variant_id && firstOrderItem.variant_id.attributes) {
            variantName = Object.entries(firstOrderItem.variant_id.attributes)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' | ');
          }

          orderSummary = {
            name: firstOrderItem.product_id.name,
            qty: firstOrderItem.quantity,
            variant: variantName,
            image: imageUrl
          };
        }

        const notification = await Notification.create({
          user_id: order.customer_id,
          title: 'Order Cancelled',
          content: `Your cancellation request for order ${order.order_code} has been approved by the seller.`,
          detailContent: `Hello,\n\nWe would like to inform you that the seller has approved your cancellation request for order ${order.order_code}.\n\nIf any coins or coupons were applied, they have been successfully refunded to your account.`,
          category: 'Orders',
          type: 'order',
          date: 'JUST NOW',
          link: `/order-history/${order._id}`,
          orderSummary
        });

        const io = req.app.get('socketio');
        if (io) {
          io.to(order.customer_id.toString()).emit('notification', {
            id: notification._id.toString(),
            title: notification.title,
            content: notification.content,
            detailContent: notification.detailContent,
            category: notification.category,
            type: notification.type,
            date: 'JUST NOW',
            link: notification.link,
            orderSummary: notification.orderSummary,
            is_read: false
          });
        }
      } catch (notifErr) {
        console.error('Notification creation/emission error:', notifErr);
      }

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Order cancellation approved successfully',
        data: toCamelCase({
          orderId: order._id,
          orderCode: order.order_code,
          status: 'canceled'
        })
      });
    } catch (error) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      console.error('Approve Seller Cancellation Error:', error);
      next(error);
    }
  }

  /**
   * Reject a cancellation request as a seller
   */
  async rejectSellerCancellation(req, res, next) {
    let session = null;
    let useTransaction = false;

    const isReplicaSet = mongoose.connection.client?.topology?.description?.type?.includes('ReplicaSet') || false;
    if (isReplicaSet) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
        useTransaction = true;
      } catch (e) {
        session = null;
        useTransaction = false;
      }
    }

    try {
      const sellerId = req.user.id;
      const { orderId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Invalid order ID'
        });
      }

      // 1. Fetch order
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Order not found'
        });
      }

      // 2. Verify seller owns the shop for this order
      const shop = await Shop.findOne({ _id: order.shop_id, owner_user_id: sellerId }).session(session);
      if (!shop) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(403).json({
          success: false,
          code: 403,
          message: 'Access denied: You do not own the shop associated with this order'
        });
      }

      // 3. Verify order status is cancel_pending
      if (order.status !== 'cancel_pending') {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Order is not in cancel_pending state'
        });
      }

      // 4. Retrieve previous status before cancel_pending
      const previousHistory = await OrderStatusHistory.findOne({
        order_id: order._id,
        status: { $ne: 'cancel_pending' }
      }).sort({ createdAt: -1 }).session(session);

      let revertStatus = 'confirmed'; // fallback
      if (previousHistory && previousHistory.status) {
        revertStatus = previousHistory.status;
      }

      // 5. Update order status to revertStatus
      order.status = revertStatus;
      await order.save({ session });

      // 6. Save to OrderStatusHistory record
      await OrderStatusHistory.create([{
        order_id: order._id,
        status: revertStatus,
        note: `Order cancellation request rejected by shop seller. Status reverted to ${revertStatus}.`,
        updated_by: sellerId
      }], { session });

      // Commit transaction if using one
      if (useTransaction && session) {
        await session.commitTransaction();
        session.endSession();
      }

      // 7. Send Notification to Customer
      try {
        const firstOrderItem = await OrderItem.findOne({ order_id: order._id })
          .populate('product_id')
          .populate('variant_id');
        
        let orderSummary = undefined;
        if (firstOrderItem && firstOrderItem.product_id) {
          const media = await ProductMedia.findOne({ product_id: firstOrderItem.product_id._id }).sort({ sort_order: 1 });
          const imageUrl = media ? media.media_url : 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400';

          let variantName = 'Standard';
          if (firstOrderItem.variant_id && firstOrderItem.variant_id.attributes) {
            variantName = Object.entries(firstOrderItem.variant_id.attributes)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' | ');
          }

          orderSummary = {
            name: firstOrderItem.product_id.name,
            qty: firstOrderItem.quantity,
            variant: variantName,
            image: imageUrl
          };
        }

        const notification = await Notification.create({
          user_id: order.customer_id,
          title: 'Cancellation Request Rejected',
          content: `Your cancellation request for order ${order.order_code} has been rejected by the seller.`,
          detailContent: `Hello,\n\nWe would like to inform you that the seller has rejected your cancellation request for order ${order.order_code}.\n\nThe order status has been reverted to ${revertStatus} and is being processed by the seller.`,
          category: 'Orders',
          type: 'order',
          date: 'JUST NOW',
          link: `/order-history/${order._id}`,
          orderSummary
        });

        const io = req.app.get('socketio');
        if (io) {
          io.to(order.customer_id.toString()).emit('notification', {
            id: notification._id.toString(),
            title: notification.title,
            content: notification.content,
            detailContent: notification.detailContent,
            category: notification.category,
            type: notification.type,
            date: 'JUST NOW',
            link: notification.link,
            orderSummary: notification.orderSummary,
            is_read: false
          });
        }
      } catch (notifErr) {
        console.error('Notification creation/emission error:', notifErr);
      }

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Order cancellation rejected successfully',
        data: toCamelCase({
          orderId: order._id,
          orderCode: order.order_code,
          status: revertStatus
        })
      });
    } catch (error) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      console.error('Reject Seller Cancellation Error:', error);
      next(error);
    }
  }

  /**
   * Get all orders for seller's shop(s) with filter and pagination
   */
  async getSellerOrders(req, res, next) {
    try {
      const sellerId = req.user.id;
      const status = req.query.status || 'all';
      const dateFrom = req.query.dateFrom || null;
      const dateTo = req.query.dateTo || null;
      let page = parseInt(req.query.page) || 1;
      if (page < 1) page = 1;
      let limit = parseInt(req.query.limit) || 5;
      if (limit < 1) limit = 5;
      const skip = (page - 1) * limit;

      // 1. Get shops owned by the seller
      const shops = await Shop.find({ owner_user_id: sellerId }).select('_id');
      if (!shops || shops.length === 0) {
        return res.status(200).json({
          success: true,
          code: 200,
          message: 'No shops found for this seller',
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        });
      }

      const shopIds = shops.map(s => s._id);

      // 2. Build query
      const query = { shop_id: { $in: shopIds } };
      if (status !== 'all') {
        query.status = status;
      }

      // Date range filter
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) {
          query.createdAt.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          // Include the entire dateTo day
          const end = new Date(dateTo);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }

      // Count total matches
      const total = await Order.countDocuments(query);

      // 3. Fetch orders
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customer_id', 'fullName email')
        .populate('payment_order_id');

      // 4. Populate items details
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const orderItems = await OrderItem.find({ order_id: order._id })
            .populate('product_id', 'name slug')
            .populate('variant_id');

          const items = await Promise.all(
            orderItems.map(async (item) => {
              if (!item.product_id) return null;

              const media = await ProductMedia.findOne({ product_id: item.product_id._id }).sort({ sort_order: 1 });
              const imageUrl = media ? media.media_url : 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400';

              let variantName = 'Standard';
              if (item.variant_id && item.variant_id.attributes) {
                variantName = Object.entries(item.variant_id.attributes)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' | ');
              }

              return {
                id: item._id,
                productId: item.product_id._id,
                productName: item.product_id.name,
                productSlug: item.product_id.slug,
                quantity: item.quantity,
                priceAtBuy: item.price_at_buy,
                variantId: item.variant_id ? item.variant_id._id : null,
                variantName,
                imageUrl
              };
            })
          );

          const cleanItems = items.filter(Boolean);

          return {
            ...order.toObject(),
            items: cleanItems
          };
        })
      );

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Seller orders retrieved successfully',
        data: toCamelCase(ordersWithDetails),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status by seller and send notification
   */
  async updateOrderStatus(req, res, next) {
    let session = null;
    let useTransaction = false;

    const isReplicaSet = mongoose.connection.client?.topology?.description?.type?.includes('ReplicaSet') || false;
    if (isReplicaSet) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
        useTransaction = true;
      } catch (e) {
        session = null;
        useTransaction = false;
      }
    }

    try {
      const sellerId = req.user.id;
      const { orderId } = req.params;
      const { status: newStatus, note } = req.body;

      // 1. Validate status
      const validStatuses = ['confirmed', 'shipped', 'delivered', 'disputed', 'refunded', 'canceled'];
      if (!newStatus || !validStatuses.includes(newStatus)) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          success: false,
          code: 400,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      // 2. Find the seller's shops
      const shops = await Shop.find({ owner_user_id: sellerId }).select('_id').session(session);
      if (!shops || shops.length === 0) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(403).json({
          success: false,
          code: 403,
          message: 'Access denied: You do not own any shops'
        });
      }
      const shopIds = shops.map(s => s._id);

      // 3. Find order
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Order not found'
        });
      }

      // Verify ownership
      if (!shopIds.some(sid => sid.toString() === order.shop_id.toString())) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(403).json({
          success: false,
          code: 403,
          message: 'Access denied: This order does not belong to your shop'
        });
      }

      // Prevent invalid status update flows if needed
      if (['canceled', 'delivered', 'refunded'].includes(order.status) && !['disputed', 'refunded'].includes(newStatus)) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          success: false,
          code: 400,
          message: `Cannot update order status from ${order.status} to ${newStatus}`
        });
      }

      const oldStatus = order.status;
      order.status = newStatus;

      let coinsRefundedFromPayment = 0;

      // Adjust payment status and trigger stock/coin refunds if status transitioned to canceled or refunded
      if (newStatus === 'delivered') {
        order.payment_status = 'success';
        
        // Update pending payments to success
        await Payment.updateMany(
          { payment_order_id: order.payment_order_id, status: 'pending' },
          { status: 'success', payment_date: new Date() },
          { session }
        );

        // Update parent PaymentOrder if all sub-orders are success/delivered
        const paymentOrder = await PaymentOrder.findById(order.payment_order_id).session(session);
        if (paymentOrder) {
          const siblingOrders = await Order.find({ payment_order_id: paymentOrder._id }).session(session);
          const allSiblingSuccess = siblingOrders.every(so => 
            so._id.toString() === order._id.toString() ? true : so.payment_status === 'success' || so.status === 'delivered'
          );
          if (allSiblingSuccess) {
            paymentOrder.payment_status = 'success';
            await paymentOrder.save({ session });
          }
        }
      } else if ((newStatus === 'canceled' || newStatus === 'refunded') && !['canceled', 'refunded'].includes(oldStatus)) {
        if (order.payment_status === 'success') {
          coinsRefundedFromPayment = order.total_final;
          order.payment_status = 'refunded';
        } else if (newStatus === 'canceled') {
          order.payment_status = order.payment_status === 'pending' ? 'failed' : order.payment_status;
        } else if (newStatus === 'refunded') {
          order.payment_status = 'refunded';
        }

        if (newStatus === 'canceled') {
          // Update pending payments to failed
          await Payment.updateMany(
            { payment_order_id: order.payment_order_id, status: 'pending' },
            { status: 'failed', payment_date: new Date() },
            { session }
          );
        }

        // Update parent PaymentOrder and Payment to refunded if all sub-orders are refunded or failed
        if (coinsRefundedFromPayment > 0 || newStatus === 'refunded') {
          const paymentOrder = await PaymentOrder.findById(order.payment_order_id).session(session);
          if (paymentOrder) {
            const siblingOrders = await Order.find({ payment_order_id: paymentOrder._id }).session(session);
            const allRefundedOrFailed = siblingOrders.every(so => {
              if (so._id.toString() === order._id.toString()) return true;
              return so.payment_status === 'refunded' || so.payment_status === 'failed' || so.status === 'canceled';
            });
            if (allRefundedOrFailed) {
              paymentOrder.payment_status = 'refunded';
              await paymentOrder.save({ session });

              await Payment.updateMany(
                { payment_order_id: paymentOrder._id, status: 'success' },
                { status: 'refunded' },
                { session }
              );
            }
          }
        }
      }

      // If status is transitioning to canceled or refunded, and it wasn't already canceled/refunded, we restore stock/coins/coupons
      if ((newStatus === 'canceled' || newStatus === 'refunded') && !['canceled', 'refunded'].includes(oldStatus)) {
        // 1. Restore stocks of variants
        const orderItems = await OrderItem.find({ order_id: order._id }).session(session);
        for (const item of orderItems) {
          if (item.variant_id) {
            await ProductVariant.findByIdAndUpdate(
              item.variant_id,
              { $inc: { stock_quantity: item.quantity } },
              { session }
            );
          }
        }

        // 2. Refund user coins if coin_discount was used or if payment was refunded as coins
        if (order.coin_discount > 0 || coinsRefundedFromPayment > 0) {
          const user = await User.findById(order.customer_id).session(session);
          if (user) {
            const totalRefundAmount = order.coin_discount + coinsRefundedFromPayment;
            const balanceBefore = user.coin_balance;
            user.coin_balance += totalRefundAmount;
            await user.save({ session });

            // Record coin refund transaction
            let description = '';
            if (order.coin_discount > 0 && coinsRefundedFromPayment > 0) {
              description = `Coin refund (${order.coin_discount}) and payment cashback (${coinsRefundedFromPayment}) for ${newStatus} order: ${order.order_code}`;
            } else if (order.coin_discount > 0) {
              description = `Coin refund for ${newStatus} order: ${order.order_code}`;
            } else {
              description = `Payment cashback in coins for ${newStatus} order: ${order.order_code}`;
            }

            await CoinTransaction.create([{
              user_id: order.customer_id,
              amount: totalRefundAmount,
              type: 'refund',
              description,
              balance_before: balanceBefore,
              balance_after: user.coin_balance
            }], { session });
          }
        }

        // 3. Release Coupon if coupon_discount was used
        if (order.coupon_discount > 0) {
          const paymentOrder = await PaymentOrder.findById(order.payment_order_id).session(session);
          if (paymentOrder && paymentOrder.coupon_id) {
            const coupon = await Coupon.findById(paymentOrder.coupon_id).session(session);
            if (coupon) {
              coupon.used_count = Math.max(0, coupon.used_count - 1);
              await coupon.save({ session });
            }
            await CouponRedemption.deleteOne({ order_id: order._id }).session(session);
          }
        }
      }

      await order.save({ session });

      // 4. Save to history
      await OrderStatusHistory.create([{
        order_id: order._id,
        status: newStatus,
        note: note || `Order status updated to ${newStatus} by shop seller.`,
        updated_by: sellerId
      }], { session });

      if (useTransaction && session) {
        await session.commitTransaction();
        session.endSession();
      }

      // 5. Send Notification & Socket.io emit
      let title = 'Order Update';
      let content = `Your order ${order.order_code} status has been updated to ${newStatus}.`;
      let detailContent = `Hello,\n\nYour order ${order.order_code} status has been updated to ${newStatus} by the seller.`;

      if (newStatus === 'confirmed') {
        title = 'Order Confirmed';
        content = `Your order ${order.order_code} has been confirmed by the shop.`;
        detailContent = `Hello,\n\nYour order ${order.order_code} has been confirmed. The shop is preparing your items and will ship them soon.`;
      } else if (newStatus === 'shipped') {
        title = 'Order Shipped';
        content = `Your order ${order.order_code} is on the way.`;
        detailContent = `Hello,\n\nYour order ${order.order_code} has been shipped and handed over to our shipping partner.`;
      } else if (newStatus === 'delivered') {
        title = 'Order Delivered Successfully';
        content = `Your order ${order.order_code} has been delivered.`;
        detailContent = `Hello,\n\nYour order ${order.order_code} has been delivered successfully. Thank you for shopping with us! Please share your feedback by writing a review.`;
      } else if (newStatus === 'disputed') {
        title = 'Order Disputed';
        content = `Your order ${order.order_code} has been marked as disputed.`;
        detailContent = `Hello,\n\nYour order ${order.order_code} has been marked as disputed. Our support team will investigate the issue.`;
      } else if (newStatus === 'refunded') {
        title = 'Order Refunded';
        content = `Your order ${order.order_code} has been refunded.`;
        detailContent = `Hello,\n\nYour order ${order.order_code} has been refunded. Any payment, coins, or coupons used have been credited back.`;
      } else if (newStatus === 'canceled') {
        title = 'Order Cancelled';
        content = `Your order ${order.order_code} has been cancelled.`;
        detailContent = `Hello,\n\nYour order ${order.order_code} has been cancelled by the shop. Any payment, coins, or coupons used have been credited back.`;
      }

      await sendOrderNotification(req, {
        userId: order.customer_id,
        orderId: order._id,
        title,
        content,
        detailContent
      });

      return res.status(200).json({
        success: true,
        code: 200,
        message: `Order status updated to ${newStatus} successfully`,
        data: toCamelCase({
          orderId: order._id,
          orderCode: order.order_code,
          status: order.status,
          paymentStatus: order.payment_status
        })
      });
    } catch (error) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      console.error('Update Order Status Error:', error);
      next(error);
    }
  }
}

module.exports = new OrderController();
