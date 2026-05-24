const mongoose = require('mongoose');
const crypto = require('crypto');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const ProductMedia = require('../models/ProductMedia');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Address = require('../models/Address');
const Coupon = require('../models/Coupon');
const CouponRedemption = require('../models/CouponRedemption');
const PaymentOrder = require('../models/PaymentOrder');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const CoinTransaction = require('../models/CoinTransaction');
const Notification = require('../models/Notification');
const { toCamelCase } = require('../utils/formatter');

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj){
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

function getVnpayDateFormat(date) {
  const tzOffset = 7 * 60 * 60 * 1000; // GMT+7
  const gmt7Date = new Date(date.getTime() + tzOffset);
  
  const pad = (num) => String(num).padStart(2, '0');
  
  const year = gmt7Date.getUTCFullYear();
  const month = pad(gmt7Date.getUTCMonth() + 1);
  const day = pad(gmt7Date.getUTCDate());
  const hours = pad(gmt7Date.getUTCHours());
  const minutes = pad(gmt7Date.getUTCMinutes());
  const seconds = pad(gmt7Date.getUTCSeconds());
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

class CheckoutController {
  /**
   * Preview checkout information before placing order
   */
  async previewCheckout(req, res) {
    try {
      const userId = req.user.id;
      const { itemIds, couponCode, useCoins } = req.body;

      if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Please select at least one item to checkout'
        });
      }

      // Fetch user's cart items
      const cart = await Cart.findOne({ user_id: userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'User cart not found'
        });
      }

      const cartItems = await CartItem.find({
        _id: { $in: itemIds },
        cart_id: cart._id
      }).populate({
        path: 'product_id',
        populate: { path: 'shop_id' }
      }).populate('variant_id');

      if (cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'No selected items found in cart'
        });
      }

      // Group products by Shop
      const shopsMap = {};
      let overallSubtotal = 0;

      for (const item of cartItems) {
        const product = item.product_id;
        if (!product) continue;

        const shop = product.shop_id || { _id: 'default', name: 'UTEShop Official Store', slug: 'uteshop' };
        const shopIdStr = shop._id.toString();

        let additionalPrice = 0;
        let variantName = 'Standard';
        let stockQuantity = 100;

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

        const price = product.selling_price + additionalPrice;
        const itemSubtotal = price * item.quantity;
        overallSubtotal += itemSubtotal;

        // Get product media image
        const media = await ProductMedia.findOne({ product_id: product._id }).sort({ sort_order: 1 });
        const imageUrl = media ? media.media_url : 'https://via.placeholder.com/150';

        if (!shopsMap[shopIdStr]) {
          shopsMap[shopIdStr] = {
            shop: {
              id: shopIdStr,
              name: shop.name || 'UTEShop Official Store',
              slug: shop.slug || 'uteshop'
            },
            items: [],
            subtotal: 0,
            shippingFee: 35000, // Default shipping fee per shop
            couponDiscount: 0,
            coinDiscount: 0,
            totalFinal: 0
          };
        }

        shopsMap[shopIdStr].items.push({
          cartItemId: item._id.toString(),
          productId: product._id.toString(),
          name: product.name,
          slug: product.slug,
          variantId: item.variant_id ? item.variant_id._id.toString() : null,
          variantName,
          imageUrl,
          price,
          quantity: item.quantity,
          stock: stockQuantity,
          itemSubtotal
        });

        shopsMap[shopIdStr].subtotal += itemSubtotal;
      }

      const shopsArray = Object.values(shopsMap);

      // Shipping total
      const overallShipping = shopsArray.length * 35000;

      // Handle Coupon
      let couponDiscount = 0;
      let coupon = null;
      let couponError = null;

      if (couponCode) {
        const codeUpper = couponCode.trim().toUpperCase();
        coupon = await Coupon.findOne({ code: codeUpper });
        
        // Auto create UTESHOP200K if missing
        if (!coupon && codeUpper === 'UTESHOP200K') {
          coupon = await Coupon.create({
            code: 'UTESHOP200K',
            type: 'fixed_amount',
            value: 200000,
            min_order_total: 200000,
            max_discount: 200000,
            usage_limit: 999999,
            status: 'active',
            start_at: new Date('2024-01-01'),
            end_at: new Date('2030-12-31')
          });
        }

        if (coupon) {
          const now = new Date();
          // Validate status & dates
          if (coupon.status !== 'active') {
            couponError = 'Coupon is currently inactive';
          } else if (coupon.start_at && now < coupon.start_at) {
            couponError = 'Coupon promotion has not started yet';
          } else if (coupon.end_at && now > coupon.end_at) {
            couponError = 'Coupon has expired';
          } else if (coupon.used_count >= coupon.usage_limit) {
            couponError = 'Coupon usage limit has been reached';
          } else if (overallSubtotal < (coupon.min_order_total || 0)) {
            couponError = `Minimum order amount to apply this coupon is ${coupon.min_order_total.toLocaleString()}₫`;
          } else {
            // Check redemption for this user
            const isRedeemed = await CouponRedemption.findOne({ coupon_id: coupon._id, user_id: userId });
            if (isRedeemed) {
              couponError = 'You have already used this coupon';
            } else {
              // Calculate discount
              if (coupon.type === 'fixed_amount') {
                couponDiscount = coupon.value;
              } else if (coupon.type === 'percent') {
                couponDiscount = (overallSubtotal * coupon.value) / 100;
                if (coupon.max_discount) {
                  couponDiscount = Math.min(couponDiscount, coupon.max_discount);
                }
              }
              couponDiscount = Math.min(couponDiscount, overallSubtotal);
            }
          }
        } else {
          couponError = 'Coupon does not exist';
        }
      }

      // Handle Coins
      let coinDiscount = 0;
      const user = await User.findById(userId);
      const userCoins = user ? user.coin_balance : 0;

      if (useCoins && userCoins > 0) {
        // Capped at 100% of the overall total (including shipping)
        const maxCoinSpend = overallSubtotal + overallShipping;
        const remainingToDiscount = overallSubtotal + overallShipping - couponDiscount;
        coinDiscount = Math.min(userCoins, maxCoinSpend, remainingToDiscount);
        coinDiscount = Math.max(0, coinDiscount);
      }

      // Distribute discounts
      let remainingCoupon = couponDiscount;
      let remainingCoin = coinDiscount;

      for (let i = 0; i < shopsArray.length; i++) {
        const s = shopsArray[i];
        if (i === shopsArray.length - 1) {
          s.couponDiscount = remainingCoupon;
          s.coinDiscount = remainingCoin;
        } else {
          const ratio = s.subtotal / overallSubtotal;
          const couponShare = Math.round(couponDiscount * ratio);
          const coinShare = Math.round(coinDiscount * ratio);

          s.couponDiscount = Math.min(couponShare, remainingCoupon);
          s.coinDiscount = Math.min(coinShare, remainingCoin);

          remainingCoupon -= s.couponDiscount;
          remainingCoin -= s.coinDiscount;
        }
        s.totalFinal = Math.max(0, s.subtotal + s.shippingFee - s.couponDiscount - s.coinDiscount);
      }

      const overallFinal = Math.max(0, overallSubtotal + overallShipping - couponDiscount - coinDiscount);

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Preview checkout information retrieved successfully',
        data: toCamelCase({
          shops: shopsArray,
          subtotalAmount: overallSubtotal,
          shippingAmount: overallShipping,
          couponDiscount,
          couponCode: couponDiscount > 0 ? coupon.code : null,
          couponError,
          coinDiscount,
          coinBalance: userCoins,
          finalAmount: overallFinal
        }),
        timestamp: Math.floor(Date.now() / 1000)
      });

    } catch (error) {
      console.error('Preview Checkout Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'System error during checkout preview',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Place Order (Create PaymentOrder, split Orders, deduct stock/coins)
   */
  async placeOrder(req, res) {
    try {
      const userId = req.user.id;
      const { itemIds, addressId, couponCode, useCoins, paymentMethod } = req.body;

      if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Please select at least one item to checkout'
        });
      }

      if (!addressId) {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Please provide a shipping address'
        });
      }

      if (!paymentMethod || !['cod', 'vnpay'].includes(paymentMethod)) {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Invalid payment method (only cod or vnpay are supported)'
        });
      }

      // 1. Verify address
      const address = await Address.findOne({ _id: addressId, user_id: userId });
      if (!address) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Shipping address not found'
        });
      }

      // 2. Fetch User & Cart
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'User does not exist'
        });
      }

      const cart = await Cart.findOne({ user_id: userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Cart is empty'
        });
      }

      const cartItems = await CartItem.find({
        _id: { $in: itemIds },
        cart_id: cart._id
      }).populate('product_id').populate('variant_id');

      if (cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Selected products to checkout not found'
        });
      }

      // 3. Stock Check & Calculations
      const shopsMap = {};
      let overallSubtotal = 0;

      for (const item of cartItems) {
        const product = item.product_id;
        if (!product) {
          return res.status(404).json({
            success: false,
            code: 404,
            message: 'Some products do not exist in the system'
          });
        }

        let additionalPrice = 0;
        if (item.variant_id) {
          const v = item.variant_id;
          if (v.stock_quantity < item.quantity) {
            return res.status(400).json({
              success: false,
              code: 400,
              message: `Product ${product.name} (${Object.entries(v.attributes).map(([k,v]) => `${k}:${v}`).join(' ')}) is out of stock.`
            });
          }
          additionalPrice = v.additional_price || 0;
        }

        const price = product.selling_price + additionalPrice;
        const itemSubtotal = price * item.quantity;
        overallSubtotal += itemSubtotal;

        const shopIdStr = product.shop_id ? product.shop_id.toString() : 'default';

        if (!shopsMap[shopIdStr]) {
          shopsMap[shopIdStr] = {
            shopId: shopIdStr,
            items: [],
            subtotal: 0,
            shippingFee: 35000,
            couponDiscount: 0,
            coinDiscount: 0,
            totalFinal: 0
          };
        }

        shopsMap[shopIdStr].items.push({
          product_id: product._id,
          variant_id: item.variant_id ? item.variant_id._id : null,
          quantity: item.quantity,
          price_at_buy: price
        });
        shopsMap[shopIdStr].subtotal += itemSubtotal;
      }

      const shopsArray = Object.values(shopsMap);
      const overallShipping = shopsArray.length * 35000;

      // Handle Coupon
      let couponDiscount = 0;
      let coupon = null;

      if (couponCode) {
        const codeUpper = couponCode.trim().toUpperCase();
        coupon = await Coupon.findOne({ code: codeUpper });

        if (!coupon && codeUpper === 'UTESHOP200K') {
          coupon = await Coupon.create({
            code: 'UTESHOP200K',
            type: 'fixed_amount',
            value: 200000,
            min_order_total: 200000,
            max_discount: 200000,
            usage_limit: 999999,
            status: 'active',
            start_at: new Date('2024-01-01'),
            end_at: new Date('2030-12-31')
          });
        }

        if (coupon) {
          const now = new Date();
          if (
            coupon.status === 'active' &&
            (!coupon.start_at || now >= coupon.start_at) &&
            (!coupon.end_at || now <= coupon.end_at) &&
            coupon.used_count < coupon.usage_limit &&
            overallSubtotal >= (coupon.min_order_total || 0)
          ) {
            const isRedeemed = await CouponRedemption.findOne({ coupon_id: coupon._id, user_id: userId });
            if (!isRedeemed) {
              if (coupon.type === 'fixed_amount') {
                couponDiscount = coupon.value;
              } else if (coupon.type === 'percent') {
                couponDiscount = (overallSubtotal * coupon.value) / 100;
                if (coupon.max_discount) {
                  couponDiscount = Math.min(couponDiscount, coupon.max_discount);
                }
              }
              couponDiscount = Math.min(couponDiscount, overallSubtotal);
            }
          }
        }
      }

      // Handle Coins
      let coinDiscount = 0;
      if (useCoins && user.coin_balance > 0) {
        const maxCoinSpend = overallSubtotal + overallShipping;
        const remainingToDiscount = overallSubtotal + overallShipping - couponDiscount;
        coinDiscount = Math.min(user.coin_balance, maxCoinSpend, remainingToDiscount);
        coinDiscount = Math.max(0, coinDiscount);
      }

      // Distribute discounts
      let remainingCoupon = couponDiscount;
      let remainingCoin = coinDiscount;

      for (let i = 0; i < shopsArray.length; i++) {
        const s = shopsArray[i];
        if (i === shopsArray.length - 1) {
          s.couponDiscount = remainingCoupon;
          s.coinDiscount = remainingCoin;
        } else {
          const ratio = s.subtotal / overallSubtotal;
          const couponShare = Math.round(couponDiscount * ratio);
          const coinShare = Math.round(coinDiscount * ratio);

          s.couponDiscount = Math.min(couponShare, remainingCoupon);
          s.coinDiscount = Math.min(coinShare, remainingCoin);

          remainingCoupon -= s.couponDiscount;
          remainingCoin -= s.coinDiscount;
        }
        s.totalFinal = Math.max(0, s.subtotal + s.shippingFee - s.couponDiscount - s.coinDiscount);
      }

      const overallFinal = Math.max(0, overallSubtotal + overallShipping - couponDiscount - coinDiscount);

      // 4. Deduct variant stock
      for (const item of cartItems) {
        if (item.variant_id) {
          const v = item.variant_id;
          v.stock_quantity -= item.quantity;
          await v.save();
        }
      }

      // 5. Deduct Coins from user & Log transaction
      if (coinDiscount > 0) {
        const balanceBefore = user.coin_balance;
        user.coin_balance -= coinDiscount;
        await user.save();

        await CoinTransaction.create({
          user_id: userId,
          amount: -coinDiscount,
          type: 'spend',
          description: `Payment for order`,
          balance_before: balanceBefore,
          balance_after: user.coin_balance
        });
      }

      // 6. If coupon used, increment coupon used count
      if (couponDiscount > 0 && coupon) {
        coupon.used_count += 1;
        await coupon.save();
      }

      // 7. Create PaymentOrder
      const paymentCode = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const isFreeOrder = overallFinal === 0;
      const paymentOrder = await PaymentOrder.create({
        payment_code: paymentCode,
        customer_id: userId,
        coupon_id: couponDiscount > 0 ? coupon._id : null,
        coin_spent_total: coinDiscount,
        subtotal_amount: overallSubtotal,
        discount_amount: couponDiscount,
        shipping_amount: overallShipping,
        final_amount: overallFinal,
        payment_method: paymentMethod,
        payment_status: isFreeOrder ? 'success' : 'pending'
      });

      // Create initial Payment transaction log (attempt)
      await Payment.create({
        payment_order_id: paymentOrder._id,
        payment_method: paymentMethod,
        transaction_id: paymentCode,
        amount: overallFinal,
        status: isFreeOrder ? 'success' : 'pending',
        payment_date: new Date()
      });

      // 8. Create Sub-Orders and OrderItems
      const createdOrders = [];
      for (const s of shopsArray) {
        const orderCode = `ORD-${Date.now()}-${s.shopId.substring(Math.max(0, s.shopId.length - 6))}-${Math.floor(Math.random() * 100)}`;
        
        // Calculate platform fee (simulated 2%)
        const platformFeeRate = 2;
        const platformFeeAmount = Math.round((s.subtotal * 2) / 100);

        // Calculate coin earned (0% - Disabled)
        const coinEarned = 0;

        const order = await Order.create({
          order_code: orderCode,
          payment_order_id: paymentOrder._id,
          customer_id: userId,
          shop_id: s.shopId === 'default' ? new mongoose.Types.ObjectId() : s.shopId,
          status: 'pending',
          subtotal_amount: s.subtotal,
          shipping_fee: s.shippingFee,
          coupon_discount: s.couponDiscount,
          coin_discount: s.coinDiscount,
          platform_fee_rate: platformFeeRate,
          platform_fee_amount: platformFeeAmount,
          total_final: s.totalFinal,
          payment_status: isFreeOrder ? 'success' : 'pending',
          coin_earned: coinEarned
        });

        // Register coupon redemption if voucher used
        if (s.couponDiscount > 0 && coupon) {
          try {
            await CouponRedemption.create({
              coupon_id: coupon._id,
              user_id: userId,
              order_id: order._id
            });
          } catch (err) {
            console.error('Error logging CouponRedemption:', err);
          }
        }

        // Create order items
        for (const item of s.items) {
          await OrderItem.create({
            order_id: order._id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price_at_buy: item.price_at_buy
          });
        }

        createdOrders.push(order);
      }

      // 9. Processing payment response
      if (isFreeOrder) {
        // Clear items from cart
        await CartItem.deleteMany({ _id: { $in: itemIds } });

        // Send order paid and placed notifications
        for (const order of createdOrders) {
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
              title: 'Order Paid Successfully',
              content: `Your payment for order ${order.order_code} was fully covered by coins.`,
              detailContent: `Hello,\n\nGreat news! Your order ${order.order_code} has been fully paid using coins and is placed successfully.\n\nThe seller is preparing the products and will ship them soon.`,
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
            console.error('Free Order Placement Notification Error:', notifErr);
          }
        }

        return res.status(201).json({
          success: true,
          code: 201,
          message: 'Order placed and paid successfully using coins',
          data: toCamelCase({
            paymentCode,
            paymentMethod,
            paymentStatus: 'success',
            finalAmount: 0,
            redirectUrl: `/order-success?paymentCode=${paymentCode}`
          })
        });
      }

      if (paymentMethod === 'cod') {
        // Clear items from cart
        await CartItem.deleteMany({ _id: { $in: itemIds } });

        // Send order placed notifications
        for (const order of createdOrders) {
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
              title: 'Order Placed Successfully',
              content: `Your order ${order.order_code} has been placed successfully via Cash on Delivery (COD).`,
              detailContent: `Hello,\n\nThank you for shopping at UTEShop! Your order ${order.order_code} has been placed successfully using Cash on Delivery (COD).\n\nThe shop is preparing the products and will ship them soon. You can track your order status in your Order History.`,
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
            console.error('COD Order Placement Notification Error:', notifErr);
          }
        }
        
        return res.status(201).json({
          success: true,
          code: 201,
          message: 'Order placed successfully (COD)',
          data: toCamelCase({
            paymentCode,
            paymentMethod,
            paymentStatus: 'pending',
            finalAmount: overallFinal,
            redirectUrl: `/order-success?paymentCode=${paymentCode}`
          })
        });
      } else {
        // Real VNPAY URL generation
        let ipAddr = req.headers['x-forwarded-for'] ||
                     req.connection.remoteAddress ||
                     req.socket.remoteAddress ||
                     req.connection.socket?.remoteAddress ||
                     '127.0.0.1';
        if (ipAddr === '::1') {
          ipAddr = '127.0.0.1';
        }

        const tmnCode = process.env.VNP_TMN_CODE || '4YUP19I4';
        const secretKey = process.env.VNP_HASH_SECRET || 'MDUIFDCRAKLNBPOFIAFNEKFRNMFBYEPX';
        const vnpUrlBase = process.env.VNP_PAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5173/payment/vnpay/return';

        const vnp_Params = {
          vnp_Version: '2.1.0',
          vnp_Command: 'pay',
          vnp_TmnCode: tmnCode,
          vnp_Amount: overallFinal * 100, // VNPAY amount is VND * 100
          vnp_CurrCode: 'VND',
          vnp_TxnRef: paymentCode,
          vnp_OrderInfo: 'Thanh toan don hang ' + paymentCode,
          vnp_OrderType: 'other',
          vnp_Locale: 'vn',
          vnp_ReturnUrl: returnUrl,
          vnp_IpAddr: ipAddr,
          vnp_CreateDate: getVnpayDateFormat(new Date()),
        };

        const expireDate = new Date(Date.now() + 15 * 60 * 1000);
        vnp_Params['vnp_ExpireDate'] = getVnpayDateFormat(expireDate);

        const sortedParams = sortObject(vnp_Params);
        const signData = Object.keys(sortedParams).map(key => `${key}=${sortedParams[key]}`).join('&');
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        const realVnPayUrl = vnpUrlBase + '?' + signData + '&vnp_SecureHash=' + signed;

        return res.status(201).json({
          success: true,
          code: 201,
          message: 'VNPAY payment request initialized',
          data: toCamelCase({
            paymentCode,
            paymentMethod,
            paymentStatus: 'pending',
            finalAmount: overallFinal,
            redirectUrl: realVnPayUrl
          })
        });
      }

    } catch (error) {
      console.error('Place Order Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'System error during order creation',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * VNPAY Mock callback receiver (handles success or cancel/failure)
   */
  async vnpayCallback(req, res) {
    try {
      const userId = req.user.id;
      const { paymentCode, status } = req.body;

      if (!paymentCode || !status) {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Please provide a payment code and payment status'
        });
      }

      // Fetch PaymentOrder
      const paymentOrder = await PaymentOrder.findOne({ payment_code: paymentCode, customer_id: userId });
      if (!paymentOrder) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Payment transaction not found'
        });
      }

      if (paymentOrder.payment_status === 'success') {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'This transaction has already been processed'
        });
      }

      // Fetch sub-orders
      const orders = await Order.find({ payment_order_id: paymentOrder._id });

      if (status === 'success') {
        // 1. Update PaymentOrder
        paymentOrder.payment_status = 'success';
        paymentOrder.transaction_id = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        await paymentOrder.save();

        // Update or create the Payment record for this attempt
        await Payment.findOneAndUpdate(
          { payment_order_id: paymentOrder._id, transaction_id: paymentCode },
          { 
            status: 'success',
            payment_date: new Date(),
            transaction_id: paymentCode,
            response_data: req.body
          },
          { new: true, upsert: true }
        );

        // 2. Update sub-orders (only non-canceled ones)
        for (const order of orders) {
          if (order.status !== 'canceled') {
            order.payment_status = 'success';
            await order.save();
          }
        }

        // 3. Clear cart items that match this order
        // Fetch order items of these orders to know which product/variant to clear
        const orderItems = await OrderItem.find({ order_id: { $in: orders.map(o => o._id) } });
        const cart = await Cart.findOne({ user_id: userId });
        if (cart) {
          for (const oi of orderItems) {
            const query = { cart_id: cart._id, product_id: oi.product_id };
            if (oi.variant_id) {
              query.variant_id = oi.variant_id;
            } else {
              query.variant_id = null;
            }
            await CartItem.findOneAndDelete(query);
          }
        }

        // Send order placed and paid notifications (only non-canceled ones)
        for (const order of orders) {
          if (order.status === 'canceled') continue;
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
              title: 'Order Paid Successfully',
              content: `Your payment for order ${order.order_code} via VNPAY was successful.`,
              detailContent: `Hello,\n\nGreat news! Your payment for order ${order.order_code} has been successfully processed via VNPAY. The order is pending confirmation from the seller.\n\nThe seller will confirm your order and ship it soon.`,
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
            console.error('VNPAY Callback Notification Error:', notifErr);
          }
        }

        return res.status(200).json({
          success: true,
          code: 200,
          message: 'Order payment via VNPAY completed successfully',
          data: toCamelCase({
            paymentCode,
            paymentStatus: 'success',
            transactionId: paymentOrder.transaction_id
          })
        });
      } else {
        // 1. Update PaymentOrder & sub-orders (keep pending for repay)
        paymentOrder.payment_status = 'failed';
        await paymentOrder.save();

        for (const order of orders) {
          if (order.status !== 'canceled') {
            order.payment_status = 'failed';
            await order.save();
          }
        }

        // Update or create the Payment record for this attempt
        await Payment.findOneAndUpdate(
          { payment_order_id: paymentOrder._id, transaction_id: paymentCode },
          { 
            status: 'failed',
            payment_date: new Date(),
            response_data: req.body
          },
          { new: true, upsert: true }
        );

        return res.status(200).json({
          success: true,
          code: 200,
          message: 'Order payment was failed or canceled',
          data: toCamelCase({
            paymentCode,
            paymentStatus: 'failed'
          })
        });
      }

    } catch (error) {
      console.error('VNPAY Callback Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'System error during VNPAY callback processing',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Verify real VNPAY payment callback
   */
  async verifyVnpay(req, res) {
    try {
      const userId = req.user.id;
      const vnpParams = req.body;

      const secureHash = vnpParams['vnp_SecureHash'];
      
      // Clone params and remove secure hash
      const signParams = { ...vnpParams };
      delete signParams['vnp_SecureHash'];
      delete signParams['vnp_SecureHashType'];

      const secretKey = process.env.VNP_HASH_SECRET || 'MDUIFDCRAKLNBPOFIAFNEKFRNMFBYEPX';
      const sorted = sortObject(signParams);
      const signData = Object.keys(sorted).map(key => `${key}=${sorted[key]}`).join('&');
      
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

      if (!secureHash || secureHash.toLowerCase() !== signed.toLowerCase()) {
        console.error('VNPAY Signature mismatch. Expected:', signed, 'Received:', secureHash);
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Chữ ký giao dịch không hợp lệ'
        });
      }

      const paymentCode = vnpParams['vnp_TxnRef'];
      const responseCode = vnpParams['vnp_ResponseCode'];
      const amount = vnpParams['vnp_Amount'];

      // Find PaymentOrder
      const paymentOrder = await PaymentOrder.findOne({ payment_code: paymentCode, customer_id: userId });
      if (!paymentOrder) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Không tìm thấy thông tin đơn thanh toán'
        });
      }

      if (paymentOrder.payment_status === 'success') {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Giao dịch này đã được thanh toán thành công trước đó'
        });
      }

      // Check amount (VNPAY amount is multiplied by 100)
      if (Number(amount) / 100 !== paymentOrder.final_amount) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Số tiền thanh toán không khớp với đơn hàng'
        });
      }

      const orders = await Order.find({ payment_order_id: paymentOrder._id });

      if (responseCode === '00') {
        // Success
        paymentOrder.payment_status = 'success';
        paymentOrder.transaction_id = vnpParams['vnp_TransactionNo'] || `TXN-${Date.now()}`;
        await paymentOrder.save();

        // Update or create the Payment record for this attempt
        await Payment.findOneAndUpdate(
          { payment_order_id: paymentOrder._id, transaction_id: paymentCode },
          { 
            status: 'success',
            payment_date: new Date(),
            transaction_id: paymentCode,
            response_data: vnpParams
          },
          { new: true, upsert: true }
        );

        // Update sub-orders (only non-canceled ones)
        for (const order of orders) {
          if (order.status !== 'canceled') {
            order.payment_status = 'success';
            await order.save();
          }
        }

        // Clear cart items
        const orderItems = await OrderItem.find({ order_id: { $in: orders.map(o => o._id) } });
        const cart = await Cart.findOne({ user_id: userId });
        if (cart) {
          for (const oi of orderItems) {
            const query = { cart_id: cart._id, product_id: oi.product_id };
            if (oi.variant_id) {
              query.variant_id = oi.variant_id;
            } else {
              query.variant_id = null;
            }
            await CartItem.findOneAndDelete(query);
          }
        }

        // Send notifications (only non-canceled ones)
        for (const order of orders) {
          if (order.status === 'canceled') continue;
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
              title: 'Order Paid Successfully',
              content: `Your payment for order ${order.order_code} via VNPAY was successful.`,
              detailContent: `Hello,\n\nGreat news! Your payment for order ${order.order_code} has been successfully processed via VNPAY. The order is pending confirmation from the seller.\n\nThe seller will confirm your order and ship it soon.`,
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
            console.error('VNPAY Callback Notification Error:', notifErr);
          }
        }

        return res.status(200).json({
          success: true,
          code: 200,
          message: 'Thanh toán đơn hàng qua VNPAY thành công',
          data: {
            paymentCode,
            paymentStatus: 'success'
          }
        });
      } else {
        // Failed / Canceled - Keep orders pending so user can repay
        paymentOrder.payment_status = 'failed';
        await paymentOrder.save();

        for (const order of orders) {
          if (order.status !== 'canceled') {
            order.payment_status = 'failed';
            await order.save();
          }
        }

        // Update or create the Payment record for this attempt
        await Payment.findOneAndUpdate(
          { payment_order_id: paymentOrder._id, transaction_id: paymentCode },
          { 
            status: 'failed',
            payment_date: new Date(),
            response_data: vnpParams
          },
          { new: true, upsert: true }
        );

        const vnpayErrorMap = {
          '09': 'Thẻ/Tài khoản của quý khách chưa đăng ký dịch vụ Internet Banking.',
          '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
          '11': 'Giao dịch không thành công do đã hết hạn chờ thanh toán.',
          '12': 'Thẻ/Tài khoản của quý khách hiện đang bị khóa.',
          '24': 'Giao dịch đã được hủy bỏ bởi quý khách.',
          '51': 'Tài khoản của quý khách không đủ số dư để thực hiện thanh toán.',
          '65': 'Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày.',
          '75': 'Hệ thống ngân hàng thanh toán hiện đang bảo trì.',
        };

        const errorMsg = vnpayErrorMap[responseCode] || 'Thanh toán không thành công hoặc giao dịch đã bị hủy.';

        return res.status(200).json({
          success: true,
          code: 200,
          message: errorMsg,
          data: {
            paymentCode,
            paymentStatus: 'failed'
          }
        });
      }
    } catch (error) {
      console.error('Verify VNPAY Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'Lỗi hệ thống khi xác thực thanh toán VNPAY',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Get order details by paymentCode for order success page
   */
  async getOrderDetails(req, res) {
    try {
      const userId = req.user.id;
      const { paymentCode } = req.params;

      const paymentOrder = await PaymentOrder.findOne({ payment_code: paymentCode, customer_id: userId })
        .populate('coupon_id');
      if (!paymentOrder) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Transaction details not found'
        });
      }

      const orders = await Order.find({ payment_order_id: paymentOrder._id })
        .populate('shop_id');

      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id })
          .populate('product_id');
        return {
          ...order.toObject(),
          items: items.map(it => ({
            ...it.toObject(),
            product: it.product_id ? {
              name: it.product_id.name,
              slug: it.product_id.slug
            } : null
          }))
        };
      }));

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Order details retrieved successfully',
        data: toCamelCase({
          paymentOrder,
          orders: ordersWithItems
        }),
        timestamp: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      console.error('Get Order Details Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'System error during order details retrieval',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  /**
   * Re-initialize VNPAY payment for an existing unpaid PaymentOrder
   */
  async repayVnpay(req, res) {
    try {
      const userId = req.user.id;
      const { paymentCode } = req.body;

      if (!paymentCode) {
        return res.status(422).json({
          success: false,
          code: 422,
          message: 'Vui lòng cung cấp mã thanh toán'
        });
      }

      // Find PaymentOrder
      const paymentOrder = await PaymentOrder.findOne({ payment_code: paymentCode, customer_id: userId });
      if (!paymentOrder) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'Không tìm thấy thông tin giao dịch thanh toán'
        });
      }

      if (paymentOrder.payment_status === 'success') {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Giao dịch này đã được thanh toán thành công trước đó'
        });
      }

      // Find all sub-orders of this payment order that are NOT canceled
      const orders = await Order.find({ payment_order_id: paymentOrder._id, status: { $ne: 'canceled' } });
      if (orders.length === 0) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Tất cả các đơn hàng trong giao dịch này đã bị hủy. Không thể thanh toán lại.'
        });
      }

      // Calculate total final amount of non-canceled sub-orders
      const totalAmountToPay = orders.reduce((sum, ord) => sum + ord.total_final, 0);

      // Generate a new payment code to avoid duplicate transaction code errors on VNPAY Sandbox
      const newPaymentCode = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Update PaymentOrder details
      paymentOrder.payment_code = newPaymentCode;
      paymentOrder.final_amount = totalAmountToPay;
      paymentOrder.payment_status = 'pending';
      await paymentOrder.save();

      // Create a new pending Payment record for this retry attempt
      await Payment.create({
        payment_order_id: paymentOrder._id,
        payment_method: 'vnpay',
        transaction_id: newPaymentCode,
        amount: totalAmountToPay,
        status: 'pending',
        payment_date: new Date()
      });

      // Real VNPAY URL generation
      let ipAddr = req.headers['x-forwarded-for'] ||
                   req.connection.remoteAddress ||
                   req.socket.remoteAddress ||
                   req.connection.socket?.remoteAddress ||
                   '127.0.0.1';
      if (ipAddr === '::1') {
        ipAddr = '127.0.0.1';
      }

      const tmnCode = process.env.VNP_TMN_CODE || '4YUP19I4';
      const secretKey = process.env.VNP_HASH_SECRET || 'MDUIFDCRAKLNBPOFIAFNEKFRNMFBYEPX';
      const vnpUrlBase = process.env.VNP_PAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
      const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5173/payment/vnpay/return';

      const vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Amount: totalAmountToPay * 100, // VNPAY amount is VND * 100
        vnp_CurrCode: 'VND',
        vnp_TxnRef: newPaymentCode,
        vnp_OrderInfo: 'Thanh toan lai don hang ' + newPaymentCode,
        vnp_OrderType: 'other',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: getVnpayDateFormat(new Date()),
      };

      const expireDate = new Date(Date.now() + 15 * 60 * 1000);
      vnp_Params['vnp_ExpireDate'] = getVnpayDateFormat(expireDate);

      const sortedParams = sortObject(vnp_Params);
      const signData = Object.keys(sortedParams).map(key => `${key}=${sortedParams[key]}`).join('&');
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

      const realVnPayUrl = vnpUrlBase + '?' + signData + '&vnp_SecureHash=' + signed;

      return res.status(200).json({
        success: true,
        code: 200,
        message: 'Khởi tạo lại thanh toán VNPAY thành công',
        data: toCamelCase({
          paymentCode: newPaymentCode,
          finalAmount: totalAmountToPay,
          redirectUrl: realVnPayUrl
        })
      });
    } catch (error) {
      console.error('Repay VNPAY Error:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: 'Lỗi hệ thống khi khởi tạo lại thanh toán VNPAY',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  }
}

module.exports = new CheckoutController();
