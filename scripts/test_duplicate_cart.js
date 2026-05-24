const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function testDuplicates() {
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TRÙNG LẶP SẢN PHẨM TRONG GIỎ HÀNG...');
  
  let token = '';
  let customerEmail = 'tung@gmail.com';
  let password = 'password123';

  // 1. Đăng nhập
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: customerEmail,
      password: password
    });
    token = loginRes.data.data.token;
  } catch (error) {
    console.error('❌ Đăng nhập thất bại:', error.message);
    process.exit(1);
  }

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // 2. Clear giỏ hàng trước
  await axios.delete(`${API_URL}/cart/clear`, authHeaders);

  // 3. Lấy sản phẩm kiểm thử và biến thể
  let testProductId = '';
  let testVariantId = '';
  const prodRes = await axios.get(`${API_URL}/public/products?limit=5`);
  
  // Tìm sản phẩm có variant
  for (const product of prodRes.data.data) {
    const detailRes = await axios.get(`${API_URL}/public/product/${product.slug}`);
    if (detailRes.data && detailRes.data.success && detailRes.data.data.variants && detailRes.data.data.variants.length > 0) {
      testProductId = product._id || product.id;
      testVariantId = detailRes.data.data.variants[0]._id || detailRes.data.data.variants[0].id;
      break;
    }
  }

  if (!testProductId) {
    // Nếu không tìm thấy sản phẩm có variant, lấy sản phẩm đầu tiên
    testProductId = prodRes.data.data[0]._id || prodRes.data.data[0].id;
    console.log(`⚠️ Không tìm thấy sản phẩm có biến thể, chỉ test sản phẩm thường.`);
  } else {
    console.log(`✅ Sản phẩm test: ${testProductId}, Biến thể test: ${testVariantId}`);
  }

  // --- TEST CASE 1: Sản phẩm không có biến thể ---
  console.log('\n--- TEST CASE 1: Sản phẩm không có biến thể ---');
  console.log('Thêm lần 1 (số lượng = 2)...');
  await axios.post(`${API_URL}/cart/add`, {
    productId: testProductId,
    quantity: 2
  }, authHeaders);

  console.log('Thêm lần 2 (cùng sản phẩm, số lượng = 3)...');
  await axios.post(`${API_URL}/cart/add`, {
    productId: testProductId,
    quantity: 3
  }, authHeaders);

  let cartRes = await axios.get(`${API_URL}/cart`, authHeaders);
  let items = cartRes.data.data;
  const noVariantItems = items.filter(item => !item.variantId);
  console.log(`📊 Số dòng sản phẩm thường: ${noVariantItems.length} (Kỳ vọng: 1)`);
  if (noVariantItems.length === 1) {
    console.log(`✅ Số lượng thực tế: ${noVariantItems[0].quantity} (Kỳ vọng: 5)`);
  } else {
    console.error('❌ Thất bại: Bị trùng lặp sản phẩm thường!');
  }

  // --- TEST CASE 2: Sản phẩm có biến thể ---
  if (testVariantId) {
    console.log('\n--- TEST CASE 2: Sản phẩm có biến thể ---');
    console.log('Thêm lần 1 (số lượng = 1)...');
    await axios.post(`${API_URL}/cart/add`, {
      productId: testProductId,
      variantId: testVariantId,
      quantity: 1
    }, authHeaders);

    console.log('Thêm lần 2 (cùng biến thể, số lượng = 2)...');
    await axios.post(`${API_URL}/cart/add`, {
      productId: testProductId,
      variantId: testVariantId,
      quantity: 2
    }, authHeaders);

    cartRes = await axios.get(`${API_URL}/cart`, authHeaders);
    items = cartRes.data.data;
    const variantItems = items.filter(item => item.variantId === testVariantId);
    console.log(`📊 Số dòng sản phẩm có biến thể: ${variantItems.length} (Kỳ vọng: 1)`);
    if (variantItems.length === 1) {
      console.log(`✅ Số lượng thực tế: ${variantItems[0].quantity} (Kỳ vọng: 3)`);
    } else {
      console.error('❌ Thất bại: Bị trùng lặp sản phẩm có biến thể!');
    }
  }

  // Dọn dẹp
  await axios.delete(`${API_URL}/cart/clear`, authHeaders);
  console.log('\n🏁 HOÀN THÀNH TẤT CẢ KIỂM THỬ TRÙNG LẶP!');
}

testDuplicates();
