require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

// Import Models
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Shop = require('../src/models/Shop');
const Order = require('../src/models/Order');
const Campaign = require('../src/models/Campaign');
const Coupon = require('../src/models/Coupon');
const Cart = require('../src/models/Cart');
const Notification = require('../src/models/Notification');
const CoinTransaction = require('../src/models/CoinTransaction');
const OTP = require('../src/models/OTP');

const seedData = async () => {
  try {
    await connectDB();

    // 1. Xóa dữ liệu cũ
    console.log('🧹 Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Shop.deleteMany({}),
      Order.deleteMany({}),
      Campaign.deleteMany({}),
      Coupon.deleteMany({}),
      Cart.deleteMany({}),
      Notification.deleteMany({}),
      CoinTransaction.deleteMany({}),
      OTP.deleteMany({})
    ]);

    // 2. Seed Shop (1 duy nhất theo plan)
    const shop = await Shop.create({
      name: 'UTEShop Official Store',
      address: '01 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM',
      phone: '02837221223',
      logo_url: 'https://ute.edu.vn/logo.png',
      description: 'Cửa hàng chính thức của trường ĐH Sư phạm Kỹ thuật TP.HCM'
    });

    // 3. Seed Users (5 người dùng với các vai trò khác nhau)
    const users = await User.insertMany([
      { full_name: 'Admin System', email: 'admin@uteshop.vn', password: 'password123', role: 'admin', status: 'active' },
      { full_name: 'Vendor Nguyễn Văn A', email: 'vendor@gmail.com', password: 'password123', role: 'vendor', status: 'active' },
      { full_name: 'Customer Trần Thị B', email: 'customer1@gmail.com', password: 'password123', role: 'customer', status: 'active', coin_balance: 500, addresses: [{ label: 'KTX Khu A', recipient_name: 'Trần Thị B', recipient_phone: '0901234567', street_address: 'Phòng 402, KTX Khu A' }] },
      { full_name: 'Customer Lê Văn C', email: 'customer2@gmail.com', password: 'password123', role: 'customer', status: 'active', coin_balance: 200 },
      { full_name: 'Shipper Hoàng Văn D', email: 'shipper@gmail.com', password: 'password123', role: 'shipper', status: 'active', shipper_details: { vehicle_type: 'Xe máy', license_plate: '59-X1 123.45', is_available: true } }
    ]);

    // 4. Seed Categories (5 danh mục)
    const categories = await Category.insertMany([
      { name: 'Đồng phục', slug: 'dong-phuc', description: 'Đồ đồng phục các khoa' },
      { name: 'Sách & Giáo trình', slug: 'sach-giao-trinh', description: 'Tài liệu học tập chính quy' },
      { name: 'Văn phòng phẩm', slug: 'van-phong-pham', description: 'Bút, vở, dụng cụ học tập' },
      { name: 'Quà lưu niệm', slug: 'qua-luu-niem', description: 'Gấu bông, móc khóa logo UTE' },
      { name: 'Đồ điện tử', slug: 'do-dien-tu', description: 'Chuột, bàn phím, phụ kiện máy tính' }
    ]);

    // 5. Seed Products (5 sản phẩm)
    const products = await Product.insertMany([
      { 
        name: 'Áo thun UTE Blue', slug: 'ao-thun-ute-blue', base_price: 120000, shop: shop._id, category: categories[0]._id, sku: 'UTE-AT-01', 
        variants: [{ variant_name: 'Size', variant_value: 'M', stock_quantity: 50 }, { variant_name: 'Size', variant_value: 'L', stock_quantity: 40 }],
        media: [{ media_type: 'image', media_url: 'https://placehold.co/400x400' }]
      },
      { 
        name: 'Giáo trình Triết học', slug: 'giao-trinh-triet', base_price: 45000, shop: shop._id, category: categories[1]._id, sku: 'UTE-GT-01', stock_quantity: 100,
        media: [{ media_type: 'image', media_url: 'https://placehold.co/400x400' }]
      },
      { 
        name: 'Bút bi Logo UTE', slug: 'but-bi-ute', base_price: 5000, shop: shop._id, category: categories[2]._id, sku: 'UTE-VP-01', stock_quantity: 500 
      },
      { 
        name: 'Gấu bông UTE 20cm', slug: 'gau-bong-ute', base_price: 85000, shop: shop._id, category: categories[3]._id, sku: 'UTE-QL-01', stock_quantity: 20 
      },
      { 
        name: 'Chuột không dây Logitech', slug: 'chuot-logitech', base_price: 250000, shop: shop._id, category: categories[4]._id, sku: 'UTE-DT-01', stock_quantity: 15 
      }
    ]);

    // 6. Seed Campaigns & Coupons
    const campaign = await Campaign.create({ 
      name: 'Chào mừng tân sinh viên', slug: 'chao-tan-sv', start_at: new Date(), end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      type: 'discount', value: 10 
    });
    const coupons = await Coupon.insertMany([
      { code: 'UTE10', type: 'percent', value: 10, campaign: campaign._id, status: 'active' },
      { code: 'WELCOME50', type: 'fixed_amount', value: 50000, min_order_total: 200000, status: 'active' },
      { code: 'FREESHIP', type: 'fixed_amount', value: 15000, status: 'active' },
      { code: 'COINBACK', type: 'percent', value: 5, status: 'active' },
      { code: 'SV-GIOI', type: 'percent', value: 20, status: 'active' }
    ]);

    // 7. Seed Orders (5 đơn hàng)
    const orders = await Order.insertMany([
      { 
        order_code: 'ORD001', customer: users[2]._id, shipper: users[4]._id, status: 'completed', total_base: 120000, shipping_fee: 15000, total_final: 135000, payment_status: 'paid',
        items: [{ product: products[0]._id, quantity: 1, price_at_buy: 120000 }],
        history: [{ status: 'pending', note: 'Chờ xác nhận' }, { status: 'completed', note: 'Giao hàng thành công' }]
      },
      { order_code: 'ORD002', customer: users[3]._id, status: 'pending', total_base: 45000, total_final: 45000, items: [{ product: products[1]._id, quantity: 1, price_at_buy: 45000 }] },
      { order_code: 'ORD003', customer: users[2]._id, status: 'shipping', total_base: 85000, total_final: 85000, items: [{ product: products[3]._id, quantity: 1, price_at_buy: 85000 }] },
      { order_code: 'ORD004', customer: users[3]._id, status: 'cancelled', total_base: 5000, total_final: 5000, items: [{ product: products[2]._id, quantity: 1, price_at_buy: 5000 }], cancellation: { user: users[3]._id, reason: 'Đặt nhầm' } },
      { order_code: 'ORD005', customer: users[2]._id, status: 'pending', total_base: 250000, total_final: 250000, items: [{ product: products[4]._id, quantity: 1, price_at_buy: 250000 }] }
    ]);

    // 8. Seed Carts
    await Cart.insertMany(users.filter(u => u.role === 'customer').map(u => ({
      user: u._id, items: [{ product: products[0]._id, quantity: 1 }]
    })));

    // 9. Seed Notifications
    await Notification.insertMany([
      { user: users[2]._id, title: 'Đơn hàng đã giao', content: 'Đơn hàng ORD001 đã hoàn tất', type: 'order' },
      { user: users[3]._id, title: 'Khuyến mãi mới', content: 'Nhập mã UTE10 để được giảm 10%', type: 'promotion' },
      { user: users[2]._id, title: 'Hệ thống bảo trì', content: 'Hệ thống sẽ bảo trì vào 12h đêm nay', type: 'system' },
      { user: users[4]._id, title: 'Đơn hàng mới', content: 'Bạn có đơn hàng ORD003 cần giao', type: 'order' },
      { user: users[3]._id, title: 'Hủy đơn thành công', content: 'Đơn hàng ORD004 đã được hủy', type: 'order' }
    ]);

    // 10. Seed CoinTransactions
    await CoinTransaction.insertMany([
      { user: users[2]._id, amount: 10, type: 'earn', balance_before: 490, balance_after: 500, description: 'Tích xu từ đơn ORD001' },
      { user: users[3]._id, amount: -50, type: 'spend', balance_before: 250, balance_after: 200, description: 'Dùng xu cho đơn ORD002' },
      { user: users[2]._id, amount: 100, type: 'earn', balance_before: 0, balance_after: 100, description: 'Thưởng đăng ký' },
      { user: users[3]._id, amount: 50, type: 'refund', balance_before: 200, balance_after: 250, description: 'Hoàn xu đơn ORD004' },
      { user: users[2]._id, amount: 20, type: 'earn', balance_before: 100, balance_after: 120, description: 'Tham gia sự kiện' }
    ]);

    console.log('🚀 SEEDING COMPLETED SUCCESSFULLY!');
    process.exit();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
