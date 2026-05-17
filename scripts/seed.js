require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

const User = require('../src/models/User');
const Role = require('../src/models/Role');
const Permission = require('../src/models/Permission');
const RolePermission = require('../src/models/RolePermission');
const UserRole = require('../src/models/UserRole');
const Address = require('../src/models/Address');
const SellerProfile = require('../src/models/SellerProfile');
const Shop = require('../src/models/Shop');
const SellerWallet = require('../src/models/SellerWallet');
const SellerWalletTransaction = require('../src/models/SellerWalletTransaction');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const ProductVariant = require('../src/models/ProductVariant');
const ProductMedia = require('../src/models/ProductMedia');
const ProductApproval = require('../src/models/ProductApproval');
const Campaign = require('../src/models/Campaign');
const CampaignTarget = require('../src/models/CampaignTarget');
const Coupon = require('../src/models/Coupon');
const CouponRedemption = require('../src/models/CouponRedemption');
const PaymentOrder = require('../src/models/PaymentOrder');
const Payment = require('../src/models/Payment');
const Order = require('../src/models/Order');
const OrderItem = require('../src/models/OrderItem');
const OrderStatusHistory = require('../src/models/OrderStatusHistory');
const OrderCancellation = require('../src/models/OrderCancellation');
const Cart = require('../src/models/Cart');
const CartItem = require('../src/models/CartItem');
const Wishlist = require('../src/models/Wishlist');
const ShippingPartner = require('../src/models/ShippingPartner');
const Shipment = require('../src/models/Shipment');
const ShipmentEvent = require('../src/models/ShipmentEvent');
const ReturnRequest = require('../src/models/ReturnRequest');
const ReturnEvidenceMedia = require('../src/models/ReturnEvidenceMedia');
const Dispute = require('../src/models/Dispute');
const Refund = require('../src/models/Refund');
const RefundTransaction = require('../src/models/RefundTransaction');
const ProductReview = require('../src/models/ProductReview');
const ProductReviewMedia = require('../src/models/ProductReviewMedia');
const ShopReview = require('../src/models/ShopReview');
const ShippingReview = require('../src/models/ShippingReview');
const Conversation = require('../src/models/Conversation');
const Message = require('../src/models/Message');
const ChatbotSession = require('../src/models/ChatbotSession');
const ChatbotMessage = require('../src/models/ChatbotMessage');
const Banner = require('../src/models/Banner');
const HomepageSection = require('../src/models/HomepageSection');
const FeaturedCategory = require('../src/models/FeaturedCategory');
const Post = require('../src/models/Post');
const StaticPage = require('../src/models/StaticPage');
const AuditLog = require('../src/models/AuditLog');
const Notification = require('../src/models/Notification');
const CoinTransaction = require('../src/models/CoinTransaction');
const PlatformFeeSetting = require('../src/models/PlatformFeeSetting');
const CoinSetting = require('../src/models/CoinSetting');
const WithdrawRequest = require('../src/models/WithdrawRequest');
const OTP = require('../src/models/OTP');

const bcrypt = require('bcryptjs');

const seedFashionData = async () => {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('🧹 Clearing all collections...');

    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      await mongoose.connection.collections[collectionName].deleteMany({});
    }

    const imageUrl = 'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635722/download_11_p83s9g.jpg';

    console.log('🔑 Seeding Permissions & Roles...');
    const permissions = await Permission.insertMany([
      { name: 'USER_VIEW', module: 'User' },
      { name: 'USER_EDIT', module: 'User' },
      { name: 'PRODUCT_MANAGE', module: 'Product' },
      { name: 'PRODUCT_APPROVE', module: 'Product' },
      { name: 'ORDER_VIEW', module: 'Order' },
      { name: 'FINANCE_MANAGE', module: 'Finance' }
    ]);

    const adminRole = await Role.create({ name: 'ADMIN', description: 'Quản trị viên tối cao' });
    const managerRole = await Role.create({ name: 'MANAGER', description: 'Quản lý vận hành' });
    const sellerRole = await Role.create({ name: 'SELLER', description: 'Đối tác bán hàng' });
    const customerRole = await Role.create({ name: 'CUSTOMER', description: 'Khách hàng mua sắm' });

    await RolePermission.insertMany([
      { role_id: adminRole._id, permission_id: permissions[0]._id },
      { role_id: adminRole._id, permission_id: permissions[1]._id },
      { role_id: adminRole._id, permission_id: permissions[2]._id },
      { role_id: adminRole._id, permission_id: permissions[3]._id },
      { role_id: adminRole._id, permission_id: permissions[4]._id },
      { role_id: adminRole._id, permission_id: permissions[5]._id },
      { role_id: managerRole._id, permission_id: permissions[2]._id },
      { role_id: managerRole._id, permission_id: permissions[3]._id }
    ]);

    console.log('👥 Seeding Users...');
    const admin = await User.create({
      full_name: 'UTEShop Admin',
      email: 'admin@uteshop.vn',
      password: hashedPassword,
      status: 'active'
    });

    const manager = await User.create({
      full_name: 'UTEShop Manager',
      email: 'manager@uteshop.vn',
      password: hashedPassword,
      status: 'active'
    });

    const sellers = await User.insertMany([
      { full_name: 'Fashion Guru', email: 'fashion@gmail.com', password: hashedPassword, status: 'active' },
      { full_name: 'Sneaker Head', email: 'sneaker@gmail.com', password: hashedPassword, status: 'active' },
      { full_name: 'Tech Master', email: 'tech@gmail.com', password: hashedPassword, status: 'active' }
    ]);

    const customers = await User.insertMany([
      { full_name: 'Nguyen Thanh Tung', email: 'tung@gmail.com', password: hashedPassword, status: 'active', coin_balance: 5000, dob: '1998-12-23', gender: 'male' },
      { full_name: 'Le Minh Hang', email: 'hang@gmail.com', password: hashedPassword, status: 'active', coin_balance: 2000 }
    ]);

    await UserRole.insertMany([
      { user_id: admin._id, role_id: adminRole._id },
      { user_id: manager._id, role_id: managerRole._id },
      { user_id: sellers[0]._id, role_id: sellerRole._id },
      { user_id: sellers[1]._id, role_id: sellerRole._id },
      { user_id: sellers[2]._id, role_id: sellerRole._id },
      { user_id: customers[0]._id, role_id: customerRole._id },
      { user_id: customers[1]._id, role_id: customerRole._id }
    ]);

    console.log('📍 Seeding Addresses...');
    await Address.insertMany([
      {
        user_id: customers[0]._id,
        label: 'Nha rieng',
        recipient_name: 'Thanh Tung',
        recipient_phone: '0901112223',
        street_address: '456 Le Van Viet, Thu Duc',
        city: 'TP.HCM',
        is_default: true
      },
      {
        user_id: customers[1]._id,
        label: 'Van phong',
        recipient_name: 'Minh Hang',
        recipient_phone: '0903334445',
        street_address: '123 Vo Van Ngan, Thu Duc',
        city: 'TP.HCM',
        is_default: true
      }
    ]);

    console.log('🏬 Seeding Seller Profiles & Shops...');
    await SellerProfile.insertMany([
      {
        user_id: sellers[0]._id,
        gst_number: 'GST-001',
        bank_name: 'Vietcombank',
        bank_account_name: 'Fashion Guru',
        bank_account_number: '0123456789',
        pickup_address: '12 Nguyen Hue, TP.HCM',
        status: 'active',
        approved_by: admin._id,
        approved_at: new Date()
      },
      {
        user_id: sellers[1]._id,
        gst_number: 'GST-002',
        bank_name: 'ACB',
        bank_account_name: 'Sneaker Head',
        bank_account_number: '9876543210',
        pickup_address: '99 Le Loi, Dong Nai',
        status: 'active',
        approved_by: admin._id,
        approved_at: new Date()
      },
      {
        user_id: sellers[2]._id,
        gst_number: 'GST-003',
        bank_name: 'Techcombank',
        bank_account_name: 'Tech Master',
        bank_account_number: '1122334455',
        pickup_address: '50 Vo Van Ngan, Thu Duc',
        status: 'active',
        approved_by: admin._id,
        approved_at: new Date()
      }
    ]);

    const fashionShop = await Shop.create({
      name: 'GUMAC Fashion Store',
      owner_user_id: sellers[0]._id,
      slug: 'gumac-fashion-store',
      address: 'TP.HCM',
      phone: '19001234',
      logo_url: imageUrl,
      banner_url: imageUrl,
      description: 'Thoi trang nu thiet ke cao cap',
      rating: 4.8,
      followers: 125000,
      response_rate: 99,
      joined_at: new Date('2021-01-01'),
      response_time: 'within minutes'
    });

    const sneakerShop = await Shop.create({
      name: 'Bitis Hunter Official',
      owner_user_id: sellers[1]._id,
      slug: 'bitis-hunter-official',
      address: 'Dong Nai',
      phone: '19005678',
      logo_url: imageUrl,
      banner_url: imageUrl,
      description: 'Nang niu ban chan Viet',
      rating: 4.9,
      followers: 85000,
      response_rate: 95,
      joined_at: new Date('2022-05-15'),
      response_time: 'within hours'
    });

    const techShop = await Shop.create({
      name: 'Tech World',
      owner_user_id: sellers[2]._id,
      slug: 'tech-world',
      address: 'TP.HCM',
      phone: '19009999',
      logo_url: 'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635484/images_cheyul.jpg',
      banner_url: 'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635484/images_cheyul.jpg',
      description: 'Thế giới công nghệ chính hãng',
      rating: 4.7,
      followers: 42000,
      response_rate: 92,
      joined_at: new Date('2023-10-10'),
      response_time: 'within a day'
    });

    await SellerWallet.insertMany([
      { shop_id: fashionShop._id, total_balance: 15000000, pending_balance: 5000000, available_balance: 10000000 },
      { shop_id: sneakerShop._id, total_balance: 8000000, pending_balance: 3000000, available_balance: 5000000 },
      { shop_id: techShop._id, total_balance: 0, pending_balance: 0, available_balance: 0 }
    ]);

    console.log('📂 Seeding Categories...');
    const catMen = await Category.create({ name: 'Men', slug: 'men' });
    const catWomen = await Category.create({ name: 'Women', slug: 'women' });
    const catAccessories = await Category.create({ name: 'Accessories', slug: 'accessories' });

    const subMenTshirt = await Category.create({ name: 'Men T-Shirt', slug: 'men-tshirt', parent_id: catMen._id });
    const subWomenDress = await Category.create({ name: 'Women Dress', slug: 'women-dress', parent_id: catWomen._id });
    const subAccessoriesBag = await Category.create({ name: 'Bags', slug: 'bags', parent_id: catAccessories._id });

    // New categories
    const catComputer = await Category.create({ name: 'Máy tính', slug: 'may-tinh' });
    const catPhone = await Category.create({ name: 'Điện thoại', slug: 'dien-thoai' });
    const catWatch = await Category.create({ name: 'Đồng hồ', slug: 'dong-ho', parent_id: catAccessories._id });
    const catCamera = await Category.create({ name: 'Máy ảnh', slug: 'may-anh', parent_id: catAccessories._id });

    console.log('👗 Seeding Products...');
    // Existing products
    const p1 = await Product.create({
      shop_id: fashionShop._id,
      category_id: subWomenDress._id,
      name: 'Vintage Floral Dress',
      slug: 'vintage-floral-dress',
      description: '<p>A beautiful vintage-inspired floral dress perfect for summer outings. Made from 100% breathable cotton, this dress features a flattering A-line silhouette and delicate puff sleeves.</p><ul><li>Material: 100% Cotton</li><li>Pattern: Floral Print</li><li>Sleeve: Short Puff Sleeves</li><li>Length: Mid-calf</li></ul>',
      mrp_price: 500000,
      selling_price: 450000,
      sku: 'GU-DX-01',
      approval_status: 'approved',
      average_rating: 4.5
    });

    const pRelated = await Product.create({
      shop_id: fashionShop._id,
      category_id: subWomenDress._id,
      name: 'Bohemian Summer Maxi',
      slug: 'bohemian-summer-maxi',
      description: 'Flowy bohemian style maxi dress with intricate patterns.',
      mrp_price: 750000,
      selling_price: 680000,
      sku: 'GU-DX-02',
      approval_status: 'approved',
      average_rating: 4.8
    });

    await ProductMedia.insertMany([
      { product_id: pRelated._id, media_type: 'image', media_url: imageUrl, sort_order: 1 }
    ]);

    const p2 = await Product.create({
      shop_id: sneakerShop._id,
      category_id: catMen._id,
      name: 'Bitis Hunter X',
      slug: 'bitis-hunter-x',
      description: 'Everyday sneaker',
      mrp_price: 1100000,
      selling_price: 999000,
      sku: 'BH-X-2026',
      approval_status: 'approved',
      average_rating: 5.0
    });

    const p3 = await Product.create({
      shop_id: fashionShop._id,
      category_id: subMenTshirt._id,
      name: 'Cotton T-Shirt',
      slug: 'cotton-tshirt',
      description: 'Cotton 100%',
      mrp_price: 280000,
      selling_price: 250000,
      sku: 'UT-AT-22',
      approval_status: 'pending',
      average_rating: 4.2
    });

    const v1 = await ProductVariant.create({
      product_id: p1._id,
      attributes: { size: 'S', color: 'Pink' },
      stock_quantity: 20,
      additional_price: 0,
      sku: 'GU-DX-01-S-PK'
    });

    const v2 = await ProductVariant.create({
      product_id: p1._id,
      attributes: { size: 'M', color: 'Pink' },
      stock_quantity: 15,
      additional_price: 0,
      sku: 'GU-DX-01-M-PK'
    });

    const v3 = await ProductVariant.create({
      product_id: p2._id,
      attributes: { size: '40', color: 'Gray' },
      stock_quantity: 30,
      additional_price: 0,
      sku: 'BH-X-40-GR'
    });

    await ProductMedia.insertMany([
      { product_id: p1._id, media_type: 'image', media_url: imageUrl, sort_order: 1 },
      { product_id: p1._id, media_type: 'image', media_url: imageUrl, sort_order: 2 },
      { product_id: p2._id, media_type: 'image', media_url: imageUrl, sort_order: 1 },
      { product_id: p3._id, media_type: 'image', media_url: imageUrl, sort_order: 1 }
    ]);

    // NEW PRODUCTS SEEDING
    const newProductsData = [
      {
        category: catComputer,
        shop: techShop,
        prefix: 'COMP',
        basePrice: 15000000,
        images: [
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635483/download_2_ear0t1.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635484/download_1_bmxgdl.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635484/images_cheyul.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635484/download_jjnu3b.jpg'
        ]
      },
      {
        category: catPhone,
        shop: techShop,
        prefix: 'PHON',
        basePrice: 10000000,
        images: [
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635622/download_7_wt0ash.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635622/download_5_fqcbqh.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635622/download_6_hy16sv.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635622/download_4_bbhc2d.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635623/download_3_tvzrh7.jpg'
        ]
      },
      {
        category: catMen,
        shop: fashionShop,
        prefix: 'CLOT',
        basePrice: 600000,
        images: [
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635722/download_12_uadxf9.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635722/download_10_dkmvhc.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635722/download_13_wswbck.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635723/download_9_wb2s3i.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635722/download_11_p83s9g.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635723/download_8_j5mubh.jpg'
        ]
      },
      {
        category: catWatch,
        shop: fashionShop,
        prefix: 'WATC',
        basePrice: 2500000,
        images: [
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635870/download_17_hn9j4t.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635870/download_16_ayhzea.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635870/download_15_jhojon.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635871/download_14_tzqesh.jpg'
        ]
      },
      {
        category: catCamera,
        shop: techShop,
        prefix: 'CAME',
        basePrice: 12000000,
        images: [
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635966/download_21_mgbb6j.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635966/download_22_lbqh6k.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635966/download_20_ipylki.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635967/download_19_hmv5nz.jpg',
          'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635967/download_18_pyel94.jpg'
        ]
      }
    ];

    for (const group of newProductsData) {
      for (let i = 0; i < group.images.length; i++) {
        const product = await Product.create({
          shop_id: group.shop._id,
          category_id: group.category._id,
          name: `${group.category.name} Premium Model ${i + 1}`,
          slug: `${group.category.slug}-premium-${i + 1}-${Date.now()}`,
          description: `Sản phẩm ${group.category.name} cao cấp, chính hãng với thiết kế hiện đại.`,
          mrp_price: group.basePrice + (i * 200000),
          selling_price: (group.basePrice + (i * 200000)) * 0.85,
          sku: `${group.prefix}-${i + 1}`,
          approval_status: 'approved',
          average_rating: 4.5 + (i * 0.1)
        });

        await ProductMedia.create({
          product_id: product._id,
          media_type: 'image',
          media_url: group.images[i],
          sort_order: 1
        });

        await ProductVariant.create({
          product_id: product._id,
          attributes: { color: 'Default', size: 'Standard' },
          stock_quantity: 100,
          additional_price: 0,
          sku: `${group.prefix}-${i + 1}-VAR`
        });
      }
    }

    await ProductApproval.create({
      product_id: p1._id,
      approver_id: manager._id,
      action: 'approved',
      reason: 'Approved sample'
    });

    console.log('🎟️ Seeding Campaigns & Coupons...');
    const camp = await Campaign.create({
      name: 'Summer Fashion Week 2026',
      slug: 'summer-2026',
      start_at: new Date(),
      end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      type: 'discount',
      value: 20
    });

    await CampaignTarget.create({
      campaign_id: camp._id,
      product_id: p1._id,
      target_type: 'featured'
    });

    const coupon = await Coupon.create({
      code: 'FASHION20',
      type: 'percent',
      value: 20,
      campaign_id: camp._id,
      status: 'active',
      min_order_total: 500000
    });

    console.log('💳 Seeding Payment Orders & Orders...');
    const paymentOrder = await PaymentOrder.create({
      payment_code: 'PAY-2026-0001',
      customer_id: customers[0]._id,
      coupon_id: coupon._id,
      coin_spent_total: 1000,
      subtotal_amount: 1449000,
      discount_amount: 50000,
      shipping_amount: 30000,
      final_amount: 1429000,
      payment_method: 'vnpay',
      payment_status: 'success',
      transaction_id: 'VN-TRANS-001'
    });

    const order1 = await Order.create({
      order_code: 'ORD-2026-0001',
      payment_order_id: paymentOrder._id,
      customer_id: customers[0]._id,
      shop_id: fashionShop._id,
      status: 'delivered',
      subtotal_amount: 450000,
      shipping_fee: 15000,
      coupon_discount: 20000,
      coin_discount: 500,
      platform_fee_rate: 3.0,
      platform_fee_amount: 13500,
      total_final: 445500,
      payment_status: 'success',
      coin_earned: 450
    });

    const order2 = await Order.create({
      order_code: 'ORD-2026-0002',
      payment_order_id: paymentOrder._id,
      customer_id: customers[0]._id,
      shop_id: sneakerShop._id,
      status: 'canceled',
      subtotal_amount: 999000,
      shipping_fee: 15000,
      coupon_discount: 30000,
      coin_discount: 500,
      platform_fee_rate: 3.0,
      platform_fee_amount: 29970,
      total_final: 983500,
      payment_status: 'failed',
      coin_earned: 0
    });

    const orderItem1 = await OrderItem.create({
      order_id: order1._id,
      product_id: p1._id,
      variant_id: v1._id,
      quantity: 1,
      price_at_buy: 450000
    });

    await OrderItem.create({
      order_id: order2._id,
      product_id: p2._id,
      variant_id: v3._id,
      quantity: 1,
      price_at_buy: 999000
    });

    await Payment.create({
      payment_order_id: paymentOrder._id,
      payment_method: 'vnpay',
      transaction_id: 'VN-TRANS-001',
      amount: 1429000,
      status: 'success',
      payment_date: new Date()
    });

    await OrderStatusHistory.insertMany([
      { order_id: order1._id, status: 'confirmed', note: 'Order confirmed', updated_by: sellers[0]._id },
      { order_id: order1._id, status: 'shipped', note: 'Shipped by partner', updated_by: sellers[0]._id },
      { order_id: order1._id, status: 'delivered', note: 'Delivered', updated_by: sellers[0]._id },
      { order_id: order2._id, status: 'canceled', note: 'Canceled by user', updated_by: customers[0]._id }
    ]);

    await OrderCancellation.create({
      order_id: order2._id,
      user_id: customers[0]._id,
      reason: 'User changed mind',
      cancelled_at: new Date()
    });

    console.log('🛒 Seeding Carts & Wishlist...');
    const cart = await Cart.create({ user_id: customers[1]._id });
    await CartItem.create({ cart_id: cart._id, product_id: p3._id, variant_id: v2._id, quantity: 2, note: 'Gift wrap' });
    await Wishlist.create({ user_id: customers[1]._id, product_id: p2._id });

    console.log('🏦 Seeding Wallet & Finance Settings...');
    await SellerWalletTransaction.create({
      shop_id: fashionShop._id,
      order_id: order1._id,
      type: 'earning',
      amount: 445500,
      balance_before: 10000000,
      balance_after: 10445500
    });

    await WithdrawRequest.create({
      shop_id: fashionShop._id,
      amount: 2000000,
      status: 'pending',
      note: 'First payout request'
    });

    await PlatformFeeSetting.create({
      fee_percent: 3.0,
      effective_from: new Date(),
      created_by: admin._id
    });

    await CoinSetting.create({
      earn_rate: 0.01,
      spend_rate: 1,
      max_usage_percent: 50,
      effective_from: new Date(),
      created_by: admin._id
    });

    console.log('🚚 Seeding Shipping & Returns...');
    const partner = await ShippingPartner.create({ name: 'GHTK', code: 'GHTK', is_active: true });
    const shipment = await Shipment.create({
      order_id: order1._id,
      shipping_partner_id: partner._id,
      tracking_code: 'GHTK-2026-0001',
      status: 'delivered',
      label_url: imageUrl
    });

    await ShipmentEvent.create({
      shipment_id: shipment._id,
      status: 'delivered',
      location: 'TP.HCM',
      event_time: new Date(),
      raw_payload: { status: 'delivered' }
    });

    const returnReq = await ReturnRequest.create({
      order_item_id: orderItem1._id,
      customer_id: customers[0]._id,
      status: 'refunded',
      reason: 'Wrong size'
    });

    await ReturnEvidenceMedia.create({
      return_request_id: returnReq._id,
      media_type: 'image',
      media_url: imageUrl
    });

    const dispute = await Dispute.create({
      return_request_id: returnReq._id,
      status: 'resolved',
      resolved_by: admin._id,
      resolution_note: 'Refund approved'
    });

    const refund = await Refund.create({
      order_id: order1._id,
      return_request_id: returnReq._id,
      refund_cash_amount: 445500,
      refund_coin_amount: 0,
      total_refund_amount: 445500,
      status: 'success'
    });

    await RefundTransaction.create({
      refund_id: refund._id,
      payment_gateway: 'vnpay',
      transaction_id: 'VN-REFUND-001',
      response_data: { status: 'success' }
    });

    console.log('⭐ Seeding Reviews...');
    const productReviews = await ProductReview.insertMany([
      {
        user_id: customers[0]._id,
        product_id: p1._id,
        order_item_id: orderItem1._id,
        rating: 5,
        comment: 'Great quality, the fabric is so soft and the colors are vibrant!'
      },
      {
        user_id: customers[1]._id,
        product_id: p1._id,
        rating: 4,
        comment: 'Very pretty dress, but slightly longer than expected. Still love it!'
      },
      {
        user_id: customers[0]._id,
        product_id: p2._id,
        rating: 5,
        comment: 'Best sneakers I have ever owned. Super comfortable for walking.'
      },
      {
        user_id: customers[1]._id,
        product_id: p2._id,
        rating: 5,
        comment: 'Fast delivery and perfect fit. The design is very modern.'
      }
    ]);

    for (const review of productReviews) {
      await ProductReviewMedia.create({
        product_review_id: review._id,
        media_type: 'image',
        media_url: imageUrl
      });
    }

    await ShopReview.create({
      user_id: customers[0]._id,
      order_id: order1._id,
      shop_id: fashionShop._id,
      rating: 5,
      comment: 'Fast response'
    });

    await ShippingReview.create({
      user_id: customers[0]._id,
      order_id: order1._id,
      shipping_partner_id: partner._id,
      rating: 4,
      comment: 'On time'
    });

    console.log('💬 Seeding Chat & Chatbot...');
    const conversation = await Conversation.create({
      customer_id: customers[0]._id,
      shop_id: fashionShop._id,
      order_id: order1._id
    });

    await Message.create({
      conversation_id: conversation._id,
      sender_id: customers[0]._id,
      message_type: 'text',
      content: 'Shop oi size S con hang khong?'
    });

    const chatbotSession = await ChatbotSession.create({
      user_id: customers[1]._id,
      session_token: 'CHATBOT-SESSION-001'
    });

    await ChatbotMessage.create({
      session_id: chatbotSession._id,
      sender: 'user',
      content: 'San pham nao dang giam gia?'
    });

    await ChatbotMessage.create({
      session_id: chatbotSession._id,
      sender: 'bot',
      content: 'Ban co the xem muc Khuyen mai tren trang chu.'
    });

    console.log('🖼️ Seeding CMS...');
    const banner = await Banner.create({
      title: 'Summer Sale',
      image_url: imageUrl,
      link: '/deals',
      sort_order: 1,
      is_active: true
    });

    const section = await HomepageSection.create({
      title: 'Featured Categories',
      type: 'category_grid',
      sort_order: 1,
      is_active: true
    });

    await FeaturedCategory.create({
      section_id: section._id,
      category_id: catWomen._id,
      sort_order: 1
    });

    await Post.create({
      title: 'Fashion Tips 2026',
      slug: 'fashion-tips-2026',
      content: 'Simple styling tips',
      author_id: admin._id,
      status: 'published'
    });

    await StaticPage.create({
      title: 'FAQ',
      slug: 'faq',
      content: 'Common questions',
      page_type: 'faq'
    });

    console.log('📣 Seeding Notifications & Coins...');
    await Notification.insertMany([
      { user_id: customers[0]._id, title: 'Order delivered', content: 'Your order has been delivered.', type: 'order' },
      { user_id: customers[1]._id, title: 'New promotion', content: 'Use FASHION20 to save more.', type: 'promotion' }
    ]);

    await CoinTransaction.create({
      user_id: customers[0]._id,
      order_id: order1._id,
      amount: 450,
      type: 'earn',
      balance_before: 4550,
      balance_after: 5000,
      description: 'Earned coins from order'
    });

    await CouponRedemption.create({
      coupon_id: coupon._id,
      user_id: customers[0]._id,
      order_id: order1._id
    });

    await OTP.create({
      email: 'tung@gmail.com',
      otp_code: '123456',
      otp_type: 'login',
      expired_at: new Date(Date.now() + 5 * 60 * 1000),
      is_verified: true
    });

    await AuditLog.create({
      actor_id: admin._id,
      action: 'PRODUCT_APPROVED',
      entity_type: 'Product',
      entity_id: p1._id,
      metadata: { note: 'Seed approval' }
    });

    console.log('🚀 SEED COMPLETED');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedFashionData();
