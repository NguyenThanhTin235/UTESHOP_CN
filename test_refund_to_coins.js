const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const API_URL = 'http://localhost:5000/api';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uteshop_db';

async function runTest() {
  console.log('🧪 Starting refund-to-coins integration test...');
  
  // 1. Connect to MongoDB
  await mongoose.connect(MONGO_URI);
  console.log('🔌 Connected to MongoDB');
  
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Address = mongoose.model('Address', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const ProductVariant = mongoose.model('ProductVariant', new mongoose.Schema({}, { strict: false }));
  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
  const CoinTransaction = mongoose.model('CoinTransaction', new mongoose.Schema({}, { strict: false }));

  const user = await User.findOne({ email: 'tung@gmail.com' });
  if (!user) {
    console.error('❌ User tung@gmail.com not found');
    await mongoose.connection.close();
    process.exit(1);
  }
  
  const address = await Address.findOne({ user_id: user._id });
  if (!address) {
    console.error('❌ No address found for user');
    await mongoose.connection.close();
    process.exit(1);
  }
  
  const product = await Product.findOne({ is_active: true, approval_status: 'approved' });
  const variant = await ProductVariant.findOne({ product_id: product._id });
  
  const initialCoins = user.coin_balance || 0;
  console.log(`👤 Found user: ${user.fullName || user.full_name}, current coins: ${initialCoins}`);
  console.log(`🏠 Found address ID: ${address._id}`);
  console.log(`📦 Found product: ${product.name}, stock: ${variant.stock_quantity}`);

  // 2. Log in via API
  let token = '';
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'tung@gmail.com',
      password: 'password123'
    });
    token = loginRes.data.data.token;
    console.log('✅ Logged in successfully via API');
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
  
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // 3. Add to cart
  try {
    await axios.delete(`${API_URL}/cart/clear`, authHeaders);
    console.log('🧹 Cart cleared');
  } catch (err) {}

  let cartItem = null;
  try {
    await axios.post(`${API_URL}/cart/add`, {
      productId: product._id,
      variantId: variant._id,
      quantity: 1
    }, authHeaders);
    console.log('🛒 Product added to cart');

    const cartRes = await axios.get(`${API_URL}/cart`, authHeaders);
    cartItem = cartRes.data.data[0];
    console.log(`🛒 Found cart item ID: ${cartItem.id}`);
  } catch (error) {
    console.error('❌ Add to cart failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }

  // 4. Place order
  let orderId = '';
  let orderCode = '';
  let totalFinal = 0;
  let paymentCode = '';
  try {
    const checkoutRes = await axios.post(`${API_URL}/checkout/place-order`, {
      itemIds: [cartItem.id],
      addressId: address._id,
      paymentMethod: 'vnpay',
      useCoins: false
    }, authHeaders);

    const PaymentOrder = mongoose.model('PaymentOrder', new mongoose.Schema({}, { strict: false }));
    paymentCode = checkoutRes.data.data.paymentCode;
    console.log(`✅ Order placed. paymentCode: ${paymentCode}`);
    
    const paymentOrder = await PaymentOrder.findOne({ payment_code: paymentCode });
    const subOrders = await Order.find({ payment_order_id: paymentOrder._id });
    
    const orderData = subOrders[0];
    orderId = orderData._id;
    orderCode = orderData.order_code;
    totalFinal = orderData.total_final;
    console.log(`✅ SubOrder found: ID: ${orderId}, Code: ${orderCode}, Total: ${totalFinal}`);
  } catch (error) {
    console.error('❌ Checkout failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }

  // 5. Call vnpay-callback API to simulate successful payment
  const orderBefore = await Order.findById(orderId);
  console.log(`🔍 Before update - payment_status: ${orderBefore.payment_status}, status: ${orderBefore.status}`);
  
  try {
    const callbackRes = await axios.post(`${API_URL}/checkout/vnpay-callback`, {
      paymentCode: paymentCode,
      status: 'success'
    }, authHeaders);
    console.log(`⚡ Simulated VNPAY payment via callback API: ${callbackRes.data.message}`);
  } catch (error) {
    console.error('❌ Callback API simulation failed:', error.response?.data || error.message);
    await mongoose.connection.close();
    process.exit(1);
  }

  // 6. Call cancelOrder API as customer (within 30 mins)
  try {
    const cancelRes = await axios.post(`${API_URL}/orders/${orderId}/cancel`, {
      reason: 'Change my mind, I want refund to coins'
    }, authHeaders);
    console.log(`✅ Cancel Order API call result: ${cancelRes.data.message}`);
    console.log(`- Data returned: ${JSON.stringify(cancelRes.data.data)}`);
  } catch (error) {
    console.error('❌ Cancel Order API call failed:', error.response?.data || error.message);
    await mongoose.connection.close();
    process.exit(1);
  }

  // 7. Verify database changes
  const orderAfter = await Order.findById(orderId);
  const userAfter = await User.findById(user._id);
  const latestTx = await CoinTransaction.findOne({ user_id: user._id }).sort({ createdAt: -1 });

  console.log('\n--- VERIFICATION RESULTS ---');
  console.log(`Order status: ${orderAfter.status} (Expected: canceled)`);
  console.log(`Order payment status: ${orderAfter.payment_status} (Expected: refunded)`);
  console.log(`User coins balance: ${userAfter.coin_balance} (Expected: ${initialCoins + totalFinal})`);
  console.log(`Latest Coin Transaction:`);
  console.log(`- Amount: ${latestTx?.amount} (Expected: ${totalFinal})`);
  console.log(`- Type: ${latestTx?.type} (Expected: refund)`);
  console.log(`- Description: "${latestTx?.description}"`);
  
  const isStatusCorrect = orderAfter.status === 'canceled';
  const isPaymentStatusCorrect = orderAfter.payment_status === 'refunded';
  const isCoinsCorrect = userAfter.coin_balance === (initialCoins + totalFinal);
  const isTxCorrect = latestTx && latestTx.amount === totalFinal && latestTx.type === 'refund';

  if (isStatusCorrect && isPaymentStatusCorrect && isCoinsCorrect && isTxCorrect) {
    console.log('\n🎉 ALL REFUND-TO-COINS INTEGRATION TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('\n❌ SOME VERIFICATIONS FAILED.');
  }

  await mongoose.connection.close();
}

runTest().catch(console.error);
