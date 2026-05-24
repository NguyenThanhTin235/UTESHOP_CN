const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 BẮT ĐẦU KIỂM THỬ API GIỎ HÀNG (CART API)...');
  
  let token = '';
  let customerEmail = 'tung@gmail.com';
  let password = 'password123';

  // 1. Đăng nhập
  try {
    console.log(`\n1. Đăng nhập tài khoản ${customerEmail}...`);
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: customerEmail,
      password: password
    });
    
    if (loginRes.data && loginRes.data.success) {
      token = loginRes.data.data.token;
      console.log('✅ Đăng nhập thành công! Token:', token.substring(0, 30) + '...');
    } else {
      console.error('❌ Đăng nhập thất bại:', loginRes.data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Lỗi khi đăng nhập:', error.message);
    if (error.response) console.error(error.response.data);
    process.exit(1);
  }

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // 2. Lấy danh sách sản phẩm từ Public API để chọn một sản phẩm ngẫu nhiên kiểm thử
  let testProductId = '';
  let testVariantId = '';
  let testProductPrice = 0;
  
  try {
    console.log('\n2. Lấy danh sách sản phẩm để chọn sản phẩm kiểm thử...');
    const prodRes = await axios.get(`${API_URL}/public/products?limit=5`);
    if (prodRes.data && prodRes.data.success && prodRes.data.data.length > 0) {
      const product = prodRes.data.data[0];
      testProductId = product._id || product.id;
      testProductPrice = product.selling_price;
      console.log(`✅ Chọn sản phẩm kiểm thử: ${product.name} (ID: ${testProductId}), Giá: ${testProductPrice}₫`);
      
      // Lấy chi tiết sản phẩm để lấy variantId nếu có
      const detailRes = await axios.get(`${API_URL}/public/product/${product.slug}`);
      if (detailRes.data && detailRes.data.success && detailRes.data.data.variants && detailRes.data.data.variants.length > 0) {
        testVariantId = detailRes.data.data.variants[0]._id || detailRes.data.data.variants[0].id;
        console.log(`✅ Chọn biến thể kiểm thử (ID: ${testVariantId})`);
      }
    } else {
      console.error('❌ Không tìm thấy sản phẩm nào để kiểm thử.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Lỗi khi lấy sản phẩm kiểm thử:', error.message);
    if (error.response) console.error(error.response.data);
    process.exit(1);
  }

  // 3. Lấy thông tin giỏ hàng hiện tại
  let initialCartSize = 0;
  try {
    console.log('\n3. Lấy thông tin giỏ hàng hiện tại...');
    const cartRes = await axios.get(`${API_URL}/cart`, authHeaders);
    if (cartRes.data && cartRes.data.success) {
      initialCartSize = cartRes.data.data.length;
      console.log(`✅ Lấy giỏ hàng thành công! Số lượng sản phẩm hiện tại: ${initialCartSize}`);
    } else {
      console.error('❌ Lấy giỏ hàng thất bại:', cartRes.data);
    }
  } catch (error) {
    console.error('❌ Lỗi khi lấy giỏ hàng:', error.message);
  }

  // 4. Thêm sản phẩm vào giỏ hàng
  let newCartItemId = '';
  try {
    console.log('\n4. Thêm sản phẩm kiểm thử vào giỏ hàng...');
    const addPayload = {
      productId: testProductId,
      quantity: 2,
      note: 'Yêu cầu gói quà màu xanh'
    };
    if (testVariantId) {
      addPayload.variantId = testVariantId;
    }
    
    const addRes = await axios.post(`${API_URL}/cart/add`, addPayload, authHeaders);
    if (addRes.data && addRes.data.success) {
      newCartItemId = addRes.data.data.id || addRes.data.data._id;
      console.log(`✅ Thêm sản phẩm vào giỏ hàng thành công! Item ID mới: ${newCartItemId}`);
    } else {
      console.error('❌ Thêm vào giỏ hàng thất bại:', addRes.data);
    }
  } catch (error) {
    console.error('❌ Lỗi khi thêm vào giỏ hàng:', error.message);
    if (error.response) console.error(error.response.data);
  }

  // 5. Kiểm tra giỏ hàng sau khi thêm
  try {
    console.log('\n5. Kiểm tra giỏ hàng sau khi thêm...');
    const cartRes = await axios.get(`${API_URL}/cart`, authHeaders);
    if (cartRes.data && cartRes.data.success) {
      const items = cartRes.data.data;
      console.log(`✅ Giỏ hàng hiện tại có ${items.length} sản phẩm.`);
      const addedItem = items.find(item => item.id === newCartItemId);
      if (addedItem) {
        console.log('✅ Tìm thấy sản phẩm vừa thêm trong giỏ hàng!');
        console.log(`   Tên: ${addedItem.name}`);
        console.log(`   Số lượng: ${addedItem.quantity} (Kỳ vọng: 2)`);
        console.log(`   Ghi chú: "${addedItem.note}" (Kỳ vọng: "Yêu cầu gói quà màu xanh")`);
      } else {
        console.error('❌ Không tìm thấy sản phẩm vừa thêm trong giỏ hàng!');
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra giỏ hàng:', error.message);
  }

  // 6. Cập nhật số lượng và ghi chú của mục trong giỏ hàng
  try {
    console.log('\n6. Cập nhật số lượng thành 3 và đổi ghi chú...');
    const updateRes = await axios.put(`${API_URL}/cart/update`, {
      itemId: newCartItemId,
      quantity: 3,
      note: 'Thay đổi ghi chú: gói quà màu đỏ'
    }, authHeaders);
    
    if (updateRes.data && updateRes.data.success) {
      console.log('✅ Cập nhật mục giỏ hàng thành công!');
    } else {
      console.error('❌ Cập nhật mục giỏ hàng thất bại:', updateRes.data);
    }
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật giỏ hàng:', error.message);
    if (error.response) console.error(error.response.data);
  }

  // 7. Xác minh sau khi cập nhật
  try {
    console.log('\n7. Xác minh sau khi cập nhật...');
    const cartRes = await axios.get(`${API_URL}/cart`, authHeaders);
    if (cartRes.data && cartRes.data.success) {
      const items = cartRes.data.data;
      const updatedItem = items.find(item => item.id === newCartItemId);
      if (updatedItem) {
        if (updatedItem.quantity === 3 && updatedItem.note === 'Thay đổi ghi chú: gói quà màu đỏ') {
          console.log('✅ Dữ liệu cập nhật chính xác trên DB!');
        } else {
          console.error('❌ Dữ liệu cập nhật không chính xác:', updatedItem);
        }
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi xác minh cập nhật:', error.message);
  }

  // 8. Xóa mục giỏ hàng vừa thêm
  try {
    console.log(`\n8. Xóa sản phẩm (Item ID: ${newCartItemId}) khỏi giỏ hàng...`);
    const removeRes = await axios.delete(`${API_URL}/cart/remove/${newCartItemId}`, authHeaders);
    if (removeRes.data && removeRes.data.success) {
      console.log('✅ Xóa sản phẩm khỏi giỏ hàng thành công!');
    } else {
      console.error('❌ Xóa sản phẩm thất bại:', removeRes.data);
    }
  } catch (error) {
    console.error('❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error.message);
    if (error.response) console.error(error.response.data);
  }

  // 9. Xác minh sau khi xóa
  try {
    console.log('\n9. Xác minh sau khi xóa...');
    const cartRes = await axios.get(`${API_URL}/cart`, authHeaders);
    if (cartRes.data && cartRes.data.success) {
      const items = cartRes.data.data;
      const deletedItem = items.find(item => item.id === newCartItemId);
      if (!deletedItem) {
        console.log('✅ Sản phẩm đã không còn trong giỏ hàng (Xóa thành công)!');
      } else {
        console.error('❌ Sản phẩm vẫn tồn tại trong giỏ hàng!');
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi xác minh sau khi xóa:', error.message);
  }

  // 10. Thêm lại và Test Clear Giỏ hàng
  try {
    console.log('\n10. Thêm lại sản phẩm để test chức năng xóa sạch giỏ hàng...');
    const addPayload = {
      productId: testProductId,
      quantity: 1
    };
    if (testVariantId) addPayload.variantId = testVariantId;
    await axios.post(`${API_URL}/cart/add`, addPayload, authHeaders);
    
    console.log('🧹 Gọi API xóa sạch giỏ hàng (Clear)...');
    const clearRes = await axios.delete(`${API_URL}/cart/clear`, authHeaders);
    if (clearRes.data && clearRes.data.success) {
      console.log('✅ Xóa sạch giỏ hàng thành công!');
      
      // Lấy lại giỏ hàng để đảm bảo rỗng
      const checkRes = await axios.get(`${API_URL}/cart`, authHeaders);
      if (checkRes.data && checkRes.data.success && checkRes.data.data.length === 0) {
        console.log('✅ Xác minh: Giỏ hàng trống hoàn toàn!');
      } else {
        console.error('❌ Xác minh thất bại: Giỏ hàng vẫn còn sản phẩm!', checkRes.data.data);
      }
    } else {
      console.error('❌ Xóa sạch giỏ hàng thất bại:', clearRes.data);
    }
  } catch (error) {
    console.error('❌ Lỗi khi test clear giỏ hàng:', error.message);
    if (error.response) console.error(error.response.data);
  }

  console.log('\n🏁 HOÀN THÀNH KIỂM THỬ API GIỎ HÀNG!');
}

runTests();
