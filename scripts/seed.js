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
const cloudinaryData = require('../IMAGE/cloudinary_links.json');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

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
      { full_name: 'Tech Master', email: 'tech@gmail.com', password: hashedPassword, status: 'active' },
      { full_name: 'Kids Specialist', email: 'kids@gmail.com', password: hashedPassword, status: 'active' }
    ]);

    const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
    const middleNames = ['Thanh', 'Minh', 'Văn', 'Thị', 'Đức', 'Ngọc', 'Xuân', 'Thu', 'Tuấn', 'Phương', 'Thảo', 'Hải', 'Hiếu', 'Bảo', 'Gia'];
    const lastNames = ['Tùng', 'Hằng', 'An', 'Bình', 'Châu', 'Dũng', 'Giang', 'Hoa', 'Khánh', 'Linh', 'Mai', 'Nhung', 'Oanh', 'Phúc', 'Quang', 'Sơn', 'Trang', 'Uyên', 'Vinh', 'Yến', 'Khoa', 'Lâm', 'Nhật', 'Phát', 'Tiên'];

    const customerData = [
      { full_name: 'Nguyen Thanh Tung', email: 'tung@gmail.com', password: hashedPassword, status: 'active', coin_balance: 5000, dob: '1998-12-23', gender: 'male' },
      { full_name: 'Le Minh Hang', email: 'hang@gmail.com', password: hashedPassword, status: 'active', coin_balance: 2000, dob: '1999-05-15', gender: 'female' }
    ];

    for (let i = 1; i <= 100; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const mn = middleNames[Math.floor(Math.random() * middleNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const year = Math.floor(Math.random() * 25) + 1980; // 1980 - 2005
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const cleanEmail = slugify(`${fn}-${mn}-${ln}`).replace(/-/g, '');

      customerData.push({
        full_name: `${fn} ${mn} ${ln}`,
        email: `customer${i}_${cleanEmail}@gmail.com`,
        password: hashedPassword,
        status: 'active',
        coin_balance: Math.floor(Math.random() * 10) * 1000,
        dob: `${year}-${month}-${day}`,
        gender: gender
      });
    }

    const customers = await User.insertMany(customerData);

    const userRolesData = [
      { user_id: admin._id, role_id: adminRole._id },
      { user_id: manager._id, role_id: managerRole._id },
      { user_id: sellers[0]._id, role_id: sellerRole._id },
      { user_id: sellers[1]._id, role_id: sellerRole._id },
      { user_id: sellers[2]._id, role_id: sellerRole._id },
      { user_id: sellers[3]._id, role_id: sellerRole._id }
    ];

    for (const c of customers) {
      userRolesData.push({ user_id: c._id, role_id: customerRole._id });
    }

    await UserRole.insertMany(userRolesData);

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
      },
      {
        user_id: sellers[3]._id,
        gst_number: 'GST-004',
        bank_name: 'VPBank',
        bank_account_name: 'Kids Specialist',
        bank_account_number: '5566778899',
        pickup_address: '102 Nguyen Thi Minh Khai, Q3, TP.HCM',
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
      description: 'Thời trang nữ thiết kế cao cấp mang phong cách thanh lịch và hiện đại',
      followers: 125000,
      response_rate: 99,
      joined_at: new Date('2021-01-01'),
      response_time: 'within minutes',
      product_count: 0
    });

    const sneakerShop = await Shop.create({
      name: 'Bitis Hunter Official',
      owner_user_id: sellers[1]._id,
      slug: 'bitis-hunter-official',
      address: 'Dong Nai',
      phone: '19005678',
      logo_url: imageUrl,
      banner_url: imageUrl,
      description: 'Thương hiệu giày dép quốc dân - Nâng niu bàn chân Việt',
      followers: 85000,
      response_rate: 95,
      joined_at: new Date('2022-05-15'),
      response_time: 'within hours',
      product_count: 0
    });

    const sportsShop = await Shop.create({
      name: 'Sports & Tech World',
      owner_user_id: sellers[2]._id,
      slug: 'sports-tech-world',
      address: 'TP.HCM',
      phone: '19009999',
      logo_url: 'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635484/images_cheyul.jpg',
      banner_url: 'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635484/images_cheyul.jpg',
      description: 'Thế giới đồ thể thao, thời trang unisex và phụ kiện công nghệ chính hãng',
      followers: 42000,
      response_rate: 92,
      joined_at: new Date('2023-10-10'),
      response_time: 'within a day',
      product_count: 0
    });

    const kidsShop = await Shop.create({
      name: 'Kids & Baby Kingdom',
      owner_user_id: sellers[3]._id,
      slug: 'kids-baby-kingdom',
      address: 'TP.HCM',
      phone: '19008888',
      logo_url: imageUrl,
      banner_url: imageUrl,
      description: 'Thiên đường thời trang và phụ kiện cao cấp dành cho mẹ và bé',
      followers: 64000,
      response_rate: 98,
      joined_at: new Date('2024-03-20'),
      response_time: 'within minutes',
      product_count: 0
    });

    await SellerWallet.insertMany([
      { shop_id: fashionShop._id, total_balance: 15000000, pending_balance: 5000000, available_balance: 10000000 },
      { shop_id: sneakerShop._id, total_balance: 8000000, pending_balance: 3000000, available_balance: 5000000 },
      { shop_id: sportsShop._id, total_balance: 5000000, pending_balance: 1000000, available_balance: 4000000 },
      { shop_id: kidsShop._id, total_balance: 12000000, pending_balance: 2000000, available_balance: 10000000 }
    ]);

    console.log('📂 Seeding 3-Level Categories & Products from Cloudinary Data...');
    
    const shopProductCounts = {
      [fashionShop._id.toString()]: 0,
      [sneakerShop._id.toString()]: 0,
      [sportsShop._id.toString()]: 0,
      [kidsShop._id.toString()]: 0
    };

    let p1, p2, p3, v1, v2, v3;
    let catWomen;
    let allProducts = [];

    for (const topKey of Object.keys(cloudinaryData)) {
      let currentShop;
      let catName;
      if (topKey === 'WOMEN') { currentShop = fashionShop; catName = 'Women'; }
      else if (topKey === 'MEN') { currentShop = sneakerShop; catName = 'Men'; }
      else if (topKey === 'SPORTS & UNISEX') { currentShop = sportsShop; catName = 'Sports & Unisex'; }
      else { currentShop = kidsShop; catName = 'Kids & Baby'; }

      const level1Cat = await Category.create({ name: catName, slug: slugify(topKey) });
      if (topKey === 'WOMEN') catWomen = level1Cat;

      const subKeys = Object.keys(cloudinaryData[topKey]);
      for (const subKey of subKeys) {
        const parts = subKey.split('/');
        const level2Name = parts[0];
        const level3Name = parts[1];

        let level2Cat = await Category.findOne({ slug: slugify(`${topKey}-${level2Name}`) });
        if (!level2Cat) {
          level2Cat = await Category.create({ name: level2Name, slug: slugify(`${topKey}-${level2Name}`), parent_id: level1Cat._id });
        }

        let level3Cat = await Category.findOne({ slug: slugify(`${topKey}-${level2Name}-${level3Name}`) });
        if (!level3Cat) {
          level3Cat = await Category.create({ name: level3Name, slug: slugify(`${topKey}-${level2Name}-${level3Name}`), parent_id: level2Cat._id });
        }

        const items = cloudinaryData[topKey][subKey];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          let cleanName = item.local_filename.replace(/\.[^/.]+$/, "").replace(/^\(Video Ảnh Thật \)\s*/i, "").trim();
          if (!cleanName) cleanName = `${level3Name} Premium ${i + 1}`;

          const pSlug = slugify(`${cleanName}-${topKey.substr(0,3)}-${i + 1}-${Date.now().toString().substr(-4)}-${Math.random().toString(36).substr(2, 3)}`);
          const basePrice = Math.floor(Math.random() * 500000) + 350000;
          // Tạo một số sản phẩm có mức giảm giá cực sâu (từ 40% đến 80%) để phục vụ tab Biggest Discounts
          let discountRate = 0.10 + Math.random() * 0.15; // 10% - 25% default
          if (i % 3 === 0) {
            discountRate = 0.40 + Math.random() * 0.40; // 40% - 80% biggest discount
          }
          const sellingPrice = Math.floor(basePrice * (1 - discountRate));

          const product = await Product.create({
            shop_id: currentShop._id,
            category_id: level3Cat._id,
            name: cleanName,
            slug: pSlug,
            description: `<p>Sản phẩm <strong>${cleanName}</strong> chính hãng thuộc bộ sưu tập ${level3Name} của ${currentShop.name}. Được thiết kế với phong cách hiện đại, sử dụng chất liệu cao cấp mang lại sự thoải mái, bền bỉ và sang trọng cho người sử dụng.</p><ul><li>Chất liệu: Cao cấp, thoáng mát</li><li>Độ bền cao, đường may tỉ mỉ</li><li>Xuất xứ: Việt Nam</li><li>Bảo hành: Chính hãng từ nhà bán hàng</li></ul>`,
            mrp_price: basePrice,
            selling_price: sellingPrice,
            sku: `SKU-${topKey.substr(0,3).toUpperCase()}-${level3Name.substr(0,3).toUpperCase()}-${i + 1}-${Math.floor(Math.random()*1000)}`,
            approval_status: 'approved',
            view_count: Math.floor(Math.random() * 800) + 50
          });

          await ProductMedia.create({
            product_id: product._id,
            media_type: 'image',
            media_url: item.cloudinary_url,
            sort_order: 1
          });

          let sizes = ['S', 'M', 'L', 'XL'];
          let colors = ['Đen', 'Trắng', 'Xanh Navy', 'Be', 'Xám', 'Hồng', 'Đỏ rượu'];

          const l2 = level2Name.toLowerCase();
          const l3 = level3Name.toLowerCase();

          if (l2.includes('footwear') || l3.includes('giày') || l3.includes('sneaker') || l3.includes('boot') || l3.includes('sandal')) {
            if (topKey === 'KIDS & BABY') {
              sizes = ['28', '30', '32'];
              colors = ['Đen', 'Trắng', 'Xanh Navy', 'Hồng phấn'];
            } else {
              sizes = ['38', '39', '40', '41', '42'];
              colors = ['Đen', 'Trắng', 'Xám', 'Be'];
            }
          } else if (topKey === 'KIDS & BABY' && (l2.includes('baby') || l3.includes('baby') || l2.includes('bé'))) {
            sizes = ['0-6M', '6-12M', '12-18M', '18-24M'];
            colors = ['Trắng sữa', 'Vàng nhạt', 'Xanh ngọc', 'Hồng phấn'];
          } else if (l2.includes('accessories') || l2.includes('tech') || l3.includes('túi') || l3.includes('kính') || l3.includes('mũ') || l3.includes('đồng hồ') || l3.includes('balo')) {
            sizes = ['Tiêu chuẩn', 'Free size'];
            colors = ['Đen bóng', 'Bạc sang trọng', 'Trắng tinh khôi', 'Be thời thượng'];
          }

          // Pick 2 random sizes and 2 random colors to make 4 distinct variants
          const shuffledSizes = [...sizes].sort(() => 0.5 - Math.random()).slice(0, 2);
          const shuffledColors = [...colors].sort(() => 0.5 - Math.random()).slice(0, 2);

          const variantDocs = [];
          let varIndex = 1;
          for (const s of shuffledSizes) {
            for (const c of shuffledColors) {
              variantDocs.push({
                product_id: product._id,
                attributes: { size: s, color: c },
                stock_quantity: Math.floor(Math.random() * 50) + 10,
                additional_price: varIndex === 1 ? 0 : Math.floor(Math.random() * 4) * 10000,
                sku: `${product.sku}-VAR-${varIndex}`
              });
              varIndex++;
            }
          }

          const createdVariants = await ProductVariant.insertMany(variantDocs);
          const variant = createdVariants[0];

          await ProductApproval.create({
            product_id: product._id,
            approver_id: manager._id,
            action: 'approved',
            reason: 'System reseeding approval'
          });

          shopProductCounts[currentShop._id.toString()]++;
          allProducts.push({ product, variant, shop: currentShop, mediaUrl: item.cloudinary_url });

          if (!p1 && topKey === 'WOMEN') { p1 = product; v1 = variant; }
          else if (!p2 && topKey === 'MEN') { p2 = product; v3 = variant; }
          else if (!p3 && topKey === 'WOMEN' && product._id.toString() !== p1?._id.toString()) { p3 = product; v2 = variant; }
        }
      }
    }

    if (!p1) { p1 = allProducts[0].product; v1 = allProducts[0].variant; }
    if (!p2) { p2 = allProducts[1].product; v3 = allProducts[1].variant; }
    if (!p3) { p3 = allProducts[2].product; v2 = allProducts[2].variant; }

    console.log('🔄 Updating shop product counts in database...');
    for (const shopId of Object.keys(shopProductCounts)) {
      await Shop.findByIdAndUpdate(shopId, { product_count: shopProductCounts[shopId] });
    }
    console.log('✅ Updated shop product counts successfully:', shopProductCounts);

    console.log('🎟️ Seeding Campaigns & Coupons...');
    const camp = await Campaign.create({
      name: 'Summer Fashion Week 2026',
      slug: 'summer-2026',
      start_at: new Date(),
      end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      type: 'discount',
      value: 20
    });

    const campaignTargetsToInsert = allProducts.slice(0, 10).map(item => ({
      campaign_id: camp._id,
      product_id: item.product._id,
      target_type: 'featured'
    }));
    await CampaignTarget.insertMany(campaignTargetsToInsert);

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
      subtotal_amount: p1.selling_price,
      shipping_fee: 15000,
      coupon_discount: 20000,
      coin_discount: 500,
      platform_fee_rate: 3.0,
      platform_fee_amount: p1.selling_price * 0.03,
      total_final: p1.selling_price + 15000 - 20500,
      payment_status: 'success',
      coin_earned: Math.round(p1.selling_price * 0.01)
    });

    const order2 = await Order.create({
      order_code: 'ORD-2026-0002',
      payment_order_id: paymentOrder._id,
      customer_id: customers[0]._id,
      shop_id: sneakerShop._id,
      status: 'canceled',
      subtotal_amount: p2.selling_price,
      shipping_fee: 15000,
      coupon_discount: 30000,
      coin_discount: 500,
      platform_fee_rate: 3.0,
      platform_fee_amount: p2.selling_price * 0.03,
      total_final: p2.selling_price + 15000 - 30500,
      payment_status: 'failed',
      coin_earned: 0
    });

    const orderItem1 = await OrderItem.create({
      order_id: order1._id,
      product_id: p1._id,
      variant_id: v1._id,
      quantity: 1,
      price_at_buy: p1.selling_price
    });

    await OrderItem.create({
      order_id: order2._id,
      product_id: p2._id,
      variant_id: v3._id,
      quantity: 1,
      price_at_buy: p2.selling_price
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

    // === Bulk Order Seeding: Real sold data for products ===
    console.log('📦 Seeding bulk orders for realistic sold counts...');
    const allShops = [fashionShop, sneakerShop, sportsShop, kidsShop];
    const bulkOrderItems = [];
    let orderCodeCounter = 3; // ORD-2026-0001 and 0002 already used

    // Group products by shop for order creation
    const productsByShop = {};
    for (const item of allProducts) {
      const shopId = item.shop._id.toString();
      if (!productsByShop[shopId]) productsByShop[shopId] = [];
      productsByShop[shopId].push(item);
    }

    // Create ~200 delivered orders spread across products
    const numBulkOrders = 200;
    for (let i = 0; i < numBulkOrders; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomShop = allShops[Math.floor(Math.random() * allShops.length)];
      const shopId = randomShop._id.toString();
      const shopProducts = productsByShop[shopId];
      if (!shopProducts || shopProducts.length === 0) continue;

      // Pick 1-3 random products from this shop for this order
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      for (let j = 0; j < numItems; j++) {
        const randProd = shopProducts[Math.floor(Math.random() * shopProducts.length)];
        selectedProducts.push(randProd);
      }

      const subtotal = selectedProducts.reduce((sum, sp) => sum + sp.product.selling_price, 0);
      const shippingFee = [0, 15000, 25000, 30000][Math.floor(Math.random() * 4)];

      const bulkPaymentOrder = await PaymentOrder.create({
        payment_code: `PAY-2026-${String(orderCodeCounter).padStart(4, '0')}`,
        customer_id: randomCustomer._id,
        coin_spent_total: 0,
        subtotal_amount: subtotal,
        discount_amount: 0,
        shipping_amount: shippingFee,
        final_amount: subtotal + shippingFee,
        payment_method: ['vnpay', 'momo', 'cod'][Math.floor(Math.random() * 3)],
        payment_status: 'success',
        transaction_id: `VN-BULK-${orderCodeCounter}`
      });

      const bulkOrder = await Order.create({
        order_code: `ORD-2026-${String(orderCodeCounter).padStart(4, '0')}`,
        payment_order_id: bulkPaymentOrder._id,
        customer_id: randomCustomer._id,
        shop_id: randomShop._id,
        status: 'delivered',
        subtotal_amount: subtotal,
        shipping_fee: shippingFee,
        coupon_discount: 0,
        coin_discount: 0,
        platform_fee_rate: 3.0,
        platform_fee_amount: subtotal * 0.03,
        total_final: subtotal + shippingFee,
        payment_status: 'success',
        coin_earned: Math.round(subtotal * 0.01)
      });

      for (const sp of selectedProducts) {
        const qty = Math.floor(Math.random() * 5) + 1; // 1-5 items
        bulkOrderItems.push({
          order_id: bulkOrder._id,
          product_id: sp.product._id,
          variant_id: sp.variant._id,
          quantity: qty,
          price_at_buy: sp.product.selling_price
        });
      }

      orderCodeCounter++;
    }

    if (bulkOrderItems.length > 0) {
      await OrderItem.insertMany(bulkOrderItems);
    }
    console.log(`✅ Created ${numBulkOrders} delivered orders with ${bulkOrderItems.length} order items`);
    // === End Bulk Order Seeding ===

    console.log('🛒 Seeding Carts & Wishlist...');
    const cart = await Cart.create({ user_id: customers[1]._id });
    await CartItem.create({ cart_id: cart._id, product_id: p3._id, variant_id: v2._id, quantity: 2, note: 'Gift wrap' });
    await Wishlist.create({ user_id: customers[1]._id, product_id: p2._id });

    console.log('🏦 Seeding Wallet & Finance Settings...');
    await SellerWalletTransaction.create({
      shop_id: fashionShop._id,
      order_id: order1._id,
      type: 'earning',
      amount: order1.total_final,
      balance_before: 10000000,
      balance_after: 10000000 + order1.total_final
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
      refund_cash_amount: order1.total_final,
      refund_coin_amount: 0,
      total_refund_amount: order1.total_final,
      status: 'success'
    });

    await RefundTransaction.create({
      refund_id: refund._id,
      payment_gateway: 'vnpay',
      transaction_id: 'VN-REFUND-001',
      response_data: { status: 'success' }
    });

    console.log('⭐ Seeding Reviews...');
    const reviewTemplates = [
      { rating: 5, comment: 'Chất lượng sản phẩm tuyệt vời, đóng gói rất cẩn thận và chắc chắn. Sẽ tiếp tục ủng hộ shop!' },
      { rating: 5, comment: 'Hàng chính hãng chuẩn 100%, mặc rất vừa vặn và thoải mái. Giao hàng cực kỳ nhanh chóng.' },
      { rating: 5, comment: 'Sản phẩm đẹp y như hình minh họa, chất vải mềm mịn mát tay. Rất đáng đồng tiền bát gạo!' },
      { rating: 4, comment: 'Hàng xịn xò, màu sắc bên ngoài đẹp hơn trong ảnh. Tuy nhiên giao hàng hơi lâu một chút.' },
      { rating: 5, comment: 'Shop tư vấn siêu nhiệt tình, chọn size chuẩn không cần chỉnh. 10 điểm cho chất lượng dịch vụ!' },
      { rating: 5, comment: 'Great quality, the fabric is so soft and the colors are vibrant! Highly recommended.' },
      { rating: 4, comment: 'Very pretty dress, but slightly longer than expected. Still love it!' },
      { rating: 5, comment: 'Best purchase I have made this year. Super comfortable and stylish design.' },
      { rating: 5, comment: 'Form dáng chuẩn đẹp, đường may tỉ mỉ không có chỉ thừa. Rất ưng ý.' },
      { rating: 5, comment: 'Đã mua lần thứ 3 ở shop và chưa bao giờ thất vọng. Hàng quá chất lượng!' }
    ];

    const dynamicReviews = [
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
    ];

    // Add random reviews for the first 100 products in allProducts using our 100 customers
    for (let i = 0; i < Math.min(allProducts.length, 100); i++) {
      const prod = allProducts[i].product;
      const numReviews = Math.floor(Math.random() * 3) + 1; // 1 to 3 reviews per product
      for (let j = 0; j < numReviews; j++) {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
        dynamicReviews.push({
          user_id: randomCustomer._id,
          product_id: prod._id,
          rating: template.rating,
          comment: template.comment
        });
      }
    }

    const productReviews = await ProductReview.insertMany(dynamicReviews);

    for (const review of productReviews) {
      if (Math.random() < 0.3) {
        await ProductReviewMedia.create({
          product_review_id: review._id,
          media_type: 'image',
          media_url: imageUrl
        });
      }
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
      category_id: catWomen ? catWomen._id : p1.category_id,
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

    console.log('🚀 SEED COMPLETED SUCCESSFULLY');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedFashionData();
