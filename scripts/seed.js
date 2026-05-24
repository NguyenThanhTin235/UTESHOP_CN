require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const connectDB = require('../src/config/db');

// Import all models
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

const normalizeAttributes = (thuoc_tinh) => {
  const attrs = {};
  if (!thuoc_tinh) return attrs;
  
  for (const [key, val] of Object.entries(thuoc_tinh)) {
    const lowerKey = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (lowerKey.includes('mau')) {
      attrs.color = val;
    } else if (lowerKey.includes('size') || lowerKey.includes('kich') || lowerKey.includes('co')) {
      attrs.size = val;
    } else {
      attrs[key] = val;
    }
  }
  return attrs;
};

const cleanHtmlImg = (html) => {
  if (!html) return html;
  return html
    .replace(/<img[^>]*>/gi, '')
    .replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, '')
    .replace(/<p><\/p>/gi, '');
};


const dataDir = path.join(__dirname, '../DATA');

function scanDataDirectory() {
  const productsFiles = [];
  if (!fs.existsSync(dataDir)) {
    console.error(`DATA directory not found at ${dataDir}`);
    return productsFiles;
  }
  const level1Dirs = fs.readdirSync(dataDir);
  for (const level1 of level1Dirs) {
    const level1Path = path.join(dataDir, level1);
    if (!fs.statSync(level1Path).isDirectory()) continue;
    
    const level2Dirs = fs.readdirSync(level1Path);
    for (const level2 of level2Dirs) {
      const level2Path = path.join(level1Path, level2);
      if (!fs.statSync(level2Path).isDirectory()) continue;
      
      const filePath = path.join(level2Path, 'products.json');
      if (fs.existsSync(filePath)) {
        productsFiles.push({
          level1Name: level1,
          level2Name: level2,
          filePath: filePath
        });
      }
    }
  }
  return productsFiles;
}

const getShopForProduct = (level1Name, level2Name, shopsMap) => {
  const l1 = level1Name.toUpperCase().trim();
  const l2 = level2Name.toUpperCase().trim();

  if (l1 === 'KID & BABY') {
    return shopsMap.kids;
  }
  if (l1 === 'SPORTS') {
    return shopsMap.sports;
  }
  if (l1 === 'WOMEN') {
    if (l2 === 'SHOES') {
      return shopsMap.shoes;
    }
    return shopsMap.women;
  }
  if (l1 === 'MEN') {
    if (l2 === 'SHOES') {
      return shopsMap.shoes;
    }
    return shopsMap.men;
  }
  if (l1 === 'UNISEX') {
    if (l2 === 'SHOES') {
      return shopsMap.shoes;
    }
    return shopsMap.men;
  }
  return shopsMap.men;
};

const seedFashionData = async () => {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('🧹 Clearing product-related and transactional collections...');
    const modelsToClear = [
      Shop, SellerWallet, SellerWalletTransaction, Category, Product, ProductVariant, ProductMedia, ProductApproval,
      Campaign, CampaignTarget, Coupon, CouponRedemption, PaymentOrder, Payment, Order, OrderItem,
      OrderStatusHistory, OrderCancellation, Cart, CartItem, Wishlist, ShippingPartner, ProductReview, ProductReviewMedia,
      ShopReview, ShippingReview, Conversation, Message, ChatbotSession, ChatbotMessage, Notification,
      CoinTransaction, WithdrawRequest, Shipment, ShipmentEvent, ReturnRequest, ReturnEvidenceMedia, Dispute,
      Refund, RefundTransaction, Banner, HomepageSection, FeaturedCategory, OTP, AuditLog, PlatformFeeSetting, CoinSetting
    ];

    for (const Model of modelsToClear) {
      await Model.deleteMany({});
    }

    const imageUrl = 'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635722/download_11_p83s9g.jpg';

    console.log('🔑 Ensuring Permissions & Roles exist...');
    const requiredPermissions = [
      { name: 'USER_VIEW', module: 'User' },
      { name: 'USER_EDIT', module: 'User' },
      { name: 'PRODUCT_MANAGE', module: 'Product' },
      { name: 'PRODUCT_APPROVE', module: 'Product' },
      { name: 'ORDER_VIEW', module: 'Order' },
      { name: 'FINANCE_MANAGE', module: 'Finance' }
    ];

    const permissions = [];
    for (const perm of requiredPermissions) {
      let p = await Permission.findOne({ name: perm.name });
      if (!p) {
        p = await Permission.create(perm);
      }
      permissions.push(p);
    }

    const adminRole = await Role.findOne({ name: 'ADMIN' }) || await Role.create({ name: 'ADMIN', description: 'Quản trị viên tối cao' });
    const managerRole = await Role.findOne({ name: 'MANAGER' }) || await Role.create({ name: 'MANAGER', description: 'Quản lý vận hành' });
    const sellerRole = await Role.findOne({ name: 'SELLER' }) || await Role.create({ name: 'SELLER', description: 'Đối tác bán hàng' });
    const customerRole = await Role.findOne({ name: 'CUSTOMER' }) || await Role.create({ name: 'CUSTOMER', description: 'Khách hàng mua sắm' });

    // Link permissions
    await RolePermission.deleteMany({});
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
    let admin = await User.findOne({ email: 'admin@uteshop.vn' });
    if (!admin) {
      admin = await User.create({
        full_name: 'UTEShop Admin',
        email: 'admin@uteshop.vn',
        password: hashedPassword,
        status: 'active'
      });
      await UserRole.create({ user_id: admin._id, role_id: adminRole._id });
    }

    let manager = await User.findOne({ email: 'manager@uteshop.vn' });
    if (!manager) {
      manager = await User.create({
        full_name: 'UTEShop Manager',
        email: 'manager@uteshop.vn',
        password: hashedPassword,
        status: 'active'
      });
      await UserRole.create({ user_id: manager._id, role_id: managerRole._id });
    }

    const sellerEmails = [
      { email: 'fashion@gmail.com', name: 'Fashion Guru', gst: 'GST-001', bank: 'Vietcombank', accName: 'Fashion Guru', accNum: '0123456789', address: '12 Nguyen Hue, TP.HCM' },
      { email: 'sneaker@gmail.com', name: 'Sneaker Head', gst: 'GST-002', bank: 'ACB', accName: 'Sneaker Head', accNum: '9876543210', address: '99 Le Loi, Dong Nai' },
      { email: 'sport@gmail.com', name: 'Sports Specialist', gst: 'GST-003', bank: 'Techcombank', accName: 'Sports Specialist', accNum: '1122334455', address: '50 Vo Van Ngan, Thu Duc' },
      { email: 'kids@gmail.com', name: 'Kids Specialist', gst: 'GST-004', bank: 'VPBank', accName: 'Kids Specialist', accNum: '5566778899', address: '102 Nguyen Thi Minh Khai, Q3, TP.HCM' },
      { email: 'unisex@gmail.com', name: 'Streetwear Specialist', gst: 'GST-005', bank: 'MB Bank', accName: 'Streetwear Specialist', accNum: '6677889900', address: '20 Vo Van Ngan, Thu Duc' }
    ];

    const sellerUsers = {};
    for (const info of sellerEmails) {
      let user = await User.findOne({ email: info.email });
      if (!user) {
        user = await User.create({
          full_name: info.name,
          email: info.email,
          password: hashedPassword,
          status: 'active'
        });
        await UserRole.create({ user_id: user._id, role_id: sellerRole._id });
      }
      sellerUsers[info.email] = user;

      // Ensure SellerProfile exists
      let profile = await SellerProfile.findOne({ user_id: user._id });
      if (!profile) {
        await SellerProfile.create({
          user_id: user._id,
          gst_number: info.gst,
          bank_name: info.bank,
          bank_account_name: info.accName,
          bank_account_number: info.accNum,
          pickup_address: info.address,
          status: 'active',
          approved_by: admin._id,
          approved_at: new Date()
        });
      }
    }

    const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
    const middleNames = ['Thanh', 'Minh', 'Văn', 'Thị', 'Đức', 'Ngọc', 'Xuân', 'Thu', 'Tuấn', 'Phương', 'Thảo', 'Hải', 'Hiếu', 'Bảo', 'Gia'];
    const lastNames = ['Tùng', 'Hằng', 'An', 'Bình', 'Châu', 'Dũng', 'Giang', 'Hoa', 'Khánh', 'Linh', 'Mai', 'Nhung', 'Oanh', 'Phúc', 'Quang', 'Sơn', 'Trang', 'Uyên', 'Vinh', 'Yến', 'Khoa', 'Lâm', 'Nhật', 'Phát', 'Tiên'];

    const customerData = [
      { full_name: 'Nguyen Thanh Tung', email: 'tung@gmail.com', password: hashedPassword, status: 'active', coin_balance: 5000, dob: '1998-12-23', gender: 'male' },
      { full_name: 'Le Minh Hang', email: 'hang@gmail.com', password: hashedPassword, status: 'active', coin_balance: 2000, dob: '1999-05-15', gender: 'female' }
    ];

    const customers = [];
    for (const cInfo of customerData) {
      let cust = await User.findOne({ email: cInfo.email });
      if (!cust) {
        cust = await User.create(cInfo);
        await UserRole.create({ user_id: cust._id, role_id: customerRole._id });
        
        // Add Address
        await Address.create({
          user_id: cust._id,
          label: cInfo.email === 'tung@gmail.com' ? 'Nha rieng' : 'Van phong',
          recipient_name: cInfo.email === 'tung@gmail.com' ? 'Thanh Tung' : 'Minh Hang',
          recipient_phone: cInfo.email === 'tung@gmail.com' ? '0901112223' : '0903334445',
          street_address: cInfo.email === 'tung@gmail.com' ? '456 Le Van Viet, Thu Duc' : '123 Vo Van Ngan, Thu Duc',
          city: 'TP.HCM',
          is_default: true
        });
      }
      customers.push(cust);
    }

    // Generate extra customers
    for (let i = 1; i <= 100; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const mn = middleNames[Math.floor(Math.random() * middleNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const year = Math.floor(Math.random() * 25) + 1980; // 1980 - 2005
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const cleanEmail = slugify(`${fn}-${mn}-${ln}`).replace(/-/g, '');
      const email = `customer${i}_${cleanEmail}@gmail.com`;

      let u = await User.findOne({ email });
      if (!u) {
        u = await User.create({
          full_name: `${fn} ${mn} ${ln}`,
          email: email,
          password: hashedPassword,
          status: 'active',
          coin_balance: Math.floor(Math.random() * 10) * 1000,
          dob: `${year}-${month}-${day}`,
          gender: gender
        });
        await UserRole.create({ user_id: u._id, role_id: customerRole._id });
      }
      customers.push(u);
    }

    console.log('🏬 Seeding Seller Profiles & Shops...');
    const fashionShop = await Shop.create({
      name: 'GUMAC Fashion Store',
      owner_user_id: sellerUsers['fashion@gmail.com']._id,
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
      owner_user_id: sellerUsers['sneaker@gmail.com']._id,
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
      name: 'Decathlon Sportswear',
      owner_user_id: sellerUsers['sport@gmail.com']._id,
      slug: 'decathlon-sportswear',
      address: 'TP.HCM',
      phone: '19009999',
      logo_url: 'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635484/images_cheyul.jpg',
      banner_url: 'https://res.cloudinary.com/dmxxo6wgl/image/upload/v1778635484/images_cheyul.jpg',
      description: 'Thương hiệu đồ thể thao chuyên nghiệp và đa năng cho mọi lứa tuổi',
      followers: 42000,
      response_rate: 92,
      joined_at: new Date('2023-10-10'),
      response_time: 'within a day',
      product_count: 0
    });

    const kidsShop = await Shop.create({
      name: 'Baby Care Corner',
      owner_user_id: sellerUsers['kids@gmail.com']._id,
      slug: 'baby-care-corner',
      address: 'TP.HCM',
      phone: '19008888',
      logo_url: imageUrl,
      banner_url: imageUrl,
      description: 'Cửa hàng chuyên cung cấp quần áo và phụ kiện an toàn, cao cấp dành cho trẻ em',
      followers: 64000,
      response_rate: 98,
      joined_at: new Date('2024-03-20'),
      response_time: 'within minutes',
      product_count: 0
    });

    const unisexShop = await Shop.create({
      name: 'Coolmate Streetwear',
      owner_user_id: sellerUsers['unisex@gmail.com']._id,
      slug: 'coolmate-streetwear',
      address: 'TP.HCM',
      phone: '19007777',
      logo_url: imageUrl,
      banner_url: imageUrl,
      description: 'Thời trang nam và unisex năng động, tối giản, chất lượng cao',
      followers: 78000,
      response_rate: 97,
      joined_at: new Date('2025-01-10'),
      response_time: 'within minutes',
      product_count: 0
    });

    const shopsMap = {
      women: fashionShop,
      shoes: sneakerShop,
      sports: sportsShop,
      kids: kidsShop,
      men: unisexShop
    };

    await SellerWallet.insertMany([
      { shop_id: fashionShop._id, total_balance: 15000000, pending_balance: 5000000, available_balance: 10000000 },
      { shop_id: sneakerShop._id, total_balance: 8000000, pending_balance: 3000000, available_balance: 5000000 },
      { shop_id: sportsShop._id, total_balance: 5000000, pending_balance: 1000000, available_balance: 4000000 },
      { shop_id: kidsShop._id, total_balance: 12000000, pending_balance: 2000000, available_balance: 10000000 },
      { shop_id: unisexShop._id, total_balance: 9000000, pending_balance: 1500000, available_balance: 7500000 }
    ]);

    console.log('📂 Seeding 2-Level Categories & Products from DATA Folder...');

    const productsFiles = scanDataDirectory();
    console.log(`Found ${productsFiles.length} products.json files in DATA.`);

    const categoryCache = {};
    const allProducts = [];
    const shopProductCounts = {
      [fashionShop._id.toString()]: 0,
      [sneakerShop._id.toString()]: 0,
      [sportsShop._id.toString()]: 0,
      [kidsShop._id.toString()]: 0,
      [unisexShop._id.toString()]: 0
    };

    let p1, p2, p3, v1, v2, v3;
    let catWomen;

    for (const fileInfo of productsFiles) {
      const { level1Name, level2Name, filePath } = fileInfo;

      // 1. Level 1 Category
      const l1Key = level1Name.toUpperCase().trim();
      let l1Cat = categoryCache[l1Key];
      if (!l1Cat) {
        l1Cat = await Category.findOne({ slug: slugify(level1Name) });
        if (!l1Cat) {
          l1Cat = await Category.create({ name: level1Name, slug: slugify(level1Name) });
        }
        categoryCache[l1Key] = l1Cat;
      }

      if (l1Key === 'WOMEN') {
        catWomen = l1Cat;
      }

      // 2. Level 2 Category
      const l2Key = `${l1Key}/${level2Name.toUpperCase().trim()}`;
      let l2Cat = categoryCache[l2Key];
      if (!l2Cat) {
        const l2Slug = slugify(`${level1Name}-${level2Name}`);
        l2Cat = await Category.findOne({ slug: l2Slug });
        if (!l2Cat) {
          l2Cat = await Category.create({ name: level2Name, slug: l2Slug, parent_id: l1Cat._id });
        }
        categoryCache[l2Key] = l2Cat;
      }

      // 3. Load product data
      const rawData = fs.readFileSync(filePath, 'utf8');
      const productsData = JSON.parse(rawData);
      console.log(`Parsing ${productsData.length} products from ${level1Name}/${level2Name}...`);

      for (let i = 0; i < productsData.length; i++) {
        const item = productsData[i];

        let cleanName = (item.ten_san_pham || '').replace(/^\(Video Ảnh Thật \)\s*/i, '').trim();
        if (!cleanName) {
          cleanName = `${level2Name} Product ${i + 1}`;
        }

        const pSlug = slugify(`${cleanName}-${level1Name.substr(0, 3)}-${i + 1}-${Date.now().toString().substr(-4)}-${Math.random().toString(36).substr(2, 3)}`);

        const basePrice = item.gia_goc || 200000;
        const sellingPrice = item.gia_hien_tai || basePrice;

        const targetShop = getShopForProduct(level1Name, level2Name, shopsMap);

        const product = await Product.create({
          shop_id: targetShop._id,
          category_id: l2Cat._id,
          name: cleanName,
          slug: pSlug,
          description: cleanHtmlImg(item.mo_ta_san_pham) || `<p>Sản phẩm <strong>${cleanName}</strong> chất lượng cao chính hãng từ ${targetShop.name}.</p>`,
          mrp_price: basePrice,
          selling_price: sellingPrice,
          sku: `SKU-${level1Name.substr(0, 3).toUpperCase()}-${level2Name.substr(0, 3).toUpperCase()}-${i + 1}-${Math.floor(Math.random() * 1000)}`,
          approval_status: 'approved'
        });

        // Add Product Media
        const mediaUrls = [];
        if (item.anh_thumbnail && item.anh_thumbnail.link_online) {
          mediaUrls.push(item.anh_thumbnail.link_online);
        }

        if (item.anh_chi_tiet && Array.isArray(item.anh_chi_tiet)) {
          item.anh_chi_tiet.forEach(detail => {
            if (detail && detail.link_online && !mediaUrls.includes(detail.link_online)) {
              mediaUrls.push(detail.link_online);
            }
          });
        }

        if (mediaUrls.length === 0) {
          mediaUrls.push(imageUrl);
        }

        for (let mIdx = 0; mIdx < mediaUrls.length; mIdx++) {
          await ProductMedia.create({
            product_id: product._id,
            media_type: 'image',
            media_url: mediaUrls[mIdx],
            sort_order: mIdx + 1
          });
        }

        // Add Product Variants
        const variantDocs = [];
        if (item.bien_the && Array.isArray(item.bien_the) && item.bien_the.length > 0) {
          let varIndex = 1;
          for (const rawVar of item.bien_the) {
            const normalizedAttrs = normalizeAttributes(rawVar.thuoc_tinh);
            if (!normalizedAttrs.color) normalizedAttrs.color = 'Tiêu chuẩn';
            if (!normalizedAttrs.size) normalizedAttrs.size = 'Tiêu chuẩn';

            variantDocs.push({
              product_id: product._id,
              attributes: normalizedAttrs,
              stock_quantity: rawVar.stock_quantity || Math.floor(Math.random() * 50) + 10,
              additional_price: rawVar.chenh_lech_gia || (rawVar.gia_bien_the - sellingPrice) || 0,
              sku: `${product.sku}-VAR-${varIndex}`
            });
            varIndex++;
          }
        } else {
          variantDocs.push({
            product_id: product._id,
            attributes: { size: 'Tiêu chuẩn', color: 'Tiêu chuẩn' },
            stock_quantity: Math.floor(Math.random() * 50) + 10,
            additional_price: 0,
            sku: `${product.sku}-VAR-1`
          });
        }

        const createdVariants = await ProductVariant.insertMany(variantDocs);
        const variant = createdVariants[0];

        await ProductApproval.create({
          product_id: product._id,
          approver_id: manager._id,
          action: 'approved',
          reason: 'System reseeding approval'
        });

        shopProductCounts[targetShop._id.toString()]++;
        allProducts.push({ product, variant, shop: targetShop, mediaUrl: mediaUrls[0] });

        if (!p1 && level1Name === 'WOMEN') { p1 = product; v1 = variant; }
        else if (!p2 && level1Name === 'MEN') { p2 = product; v3 = variant; }
        else if (!p3 && level1Name === 'WOMEN' && product._id.toString() !== p1?._id.toString()) { p3 = product; v2 = variant; }
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
      { order_id: order1._id, status: 'confirmed', note: 'Order confirmed', updated_by: sellerUsers['fashion@gmail.com']._id },
      { order_id: order1._id, status: 'shipped', note: 'Shipped by partner', updated_by: sellerUsers['fashion@gmail.com']._id },
      { order_id: order1._id, status: 'delivered', note: 'Delivered', updated_by: sellerUsers['fashion@gmail.com']._id },
      { order_id: order2._id, status: 'canceled', note: 'Canceled by user', updated_by: customers[0]._id }
    ]);

    await OrderCancellation.create({
      order_id: order2._id,
      user_id: customers[0]._id,
      reason: 'User changed mind',
      cancelled_at: new Date()
    });

    // === Bulk Order Seeding ===
    console.log('📦 Seeding bulk orders for realistic sold counts...');
    const allShops = [fashionShop, sneakerShop, sportsShop, kidsShop, unisexShop];
    const bulkOrderItems = [];
    let orderCodeCounter = 3;

    const productsByShop = {};
    for (const item of allProducts) {
      const shopId = item.shop._id.toString();
      if (!productsByShop[shopId]) productsByShop[shopId] = [];
      productsByShop[shopId].push(item);
    }

    const numBulkOrders = 200;
    for (let i = 0; i < numBulkOrders; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomShop = allShops[Math.floor(Math.random() * allShops.length)];
      const shopId = randomShop._id.toString();
      const shopProducts = productsByShop[shopId];
      if (!shopProducts || shopProducts.length === 0) continue;

      const numItems = Math.min(shopProducts.length, Math.floor(Math.random() * 3) + 1);
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
        const qty = Math.floor(Math.random() * 5) + 1;
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

    for (let i = 0; i < Math.min(allProducts.length, 100); i++) {
      const prod = allProducts[i].product;
      const numReviews = Math.floor(Math.random() * 3) + 1;
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
    await Banner.create({
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

    console.log('❤️ Seeding Wishlist...');
    await Wishlist.insertMany([
      { user_id: customers[0]._id, product_id: p1._id },
      { user_id: customers[0]._id, product_id: p2._id },
      { user_id: customers[0]._id, product_id: p3._id }
    ]);

    console.log('📣 Seeding Notifications & Coins...');
    await Notification.insertMany([
      {
        user_id: customers[0]._id,
        title: 'Order #UTE99283 is out for delivery',
        content: 'Your package is being delivered by our courier. Please stay reachable at your phone number.',
        detailContent: 'Good news! Your order **#UTE99283** has left our sorting facility and is currently with our delivery partner.\n\nOur courier will attempt to deliver your package today between **09:00 AM and 06:00 PM**. Please ensure someone is available at the shipping address to receive the items.',
        type: 'order',
        category: 'Orders',
        is_read: false,
        date: '2 MINS AGO',
        orderSummary: {
          name: p1.name,
          qty: 1,
          variant: 'Tiêu chuẩn',
          image: imageUrl
        },
        link: '/profile'
      },
      {
        user_id: customers[0]._id,
        title: 'Flash Sale: Up to 70% OFF!',
        content: 'The biggest sale of the season is here. Grab your favorite academic outfits before they\'re gone.',
        detailContent: 'Get ready for the ultimate academic shopping experience! Enjoy up to **70% OFF** on premium hoodies, backpacks, and smart gadgets.\n\nUse code **FLASH70** at checkout. Hurry, offer valid only for the next 24 hours!',
        type: 'promotion',
        category: 'Promotions',
        is_read: true,
        date: '3 HOURS AGO',
        link: '/search?category=clothing'
      },
      {
        user_id: customers[0]._id,
        title: 'Security Alert: New Login',
        content: 'A new login was detected from a Chrome browser on Windows in Ho Chi Minh City.',
        detailContent: 'We detected a new login to your UTEShop account from a new device/location.\n\n**Device:** Chrome on Windows\n**Location:** Ho Chi Minh City, Vietnam\n**IP Address:** 113.166.x.x\n\nIf this was you, you can safely ignore this alert. If you did not authorize this login, please change your password immediately.',
        type: 'system',
        category: 'System',
        is_read: false,
        date: 'YESTERDAY',
        link: '/profile'
      },
      {
        user_id: customers[0]._id,
        title: 'Order #UTE99210 Delivered',
        content: 'Your order has been successfully delivered. We hope you enjoy your new items!',
        detailContent: 'Your order **#UTE99210** has been marked as delivered by our shipping partner.\n\nWe hope you love your new academic gear! Please take a moment to confirm receipt and leave a review for the products to earn UTEShop coins.',
        type: 'order',
        category: 'Orders',
        is_read: true,
        date: 'OCT 24',
        orderSummary: {
          name: p2.name,
          qty: 2,
          variant: 'Tiêu chuẩn',
          image: imageUrl
        },
        link: '/profile'
      },
      {
        user_id: customers[1]._id,
        title: 'Welcome to UTEShop!',
        content: 'Experience the premium academic marketplace. Enjoy your shopping!',
        detailContent: 'Welcome to UTEShop! We are excited to have you on board. Explore our catalog for the best academic collections.',
        type: 'system',
        category: 'System',
        is_read: false,
        date: 'JUST NOW',
        link: '/search'
      }
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
