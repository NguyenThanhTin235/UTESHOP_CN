const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uteshop_db';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
  const PaymentOrder = mongoose.model('PaymentOrder', new mongoose.Schema({}, { strict: false }));
  const Payment = mongoose.model('Payment', new mongoose.Schema({}, { strict: false }));

  // Find the latest order that is canceled
  const latestOrder = await Order.findOne({ status: 'canceled' }).sort({ createdAt: -1 });
  if (!latestOrder) {
    console.log('No canceled orders found');
    await mongoose.connection.close();
    return;
  }

  console.log('\n--- LATEST CANCELED ORDER ---');
  console.log(`Order ID: ${latestOrder._id}`);
  console.log(`Order Code: ${latestOrder.order_code}`);
  console.log(`Order Status: ${latestOrder.status}`);
  console.log(`Order Payment Status: ${latestOrder.payment_status}`);
  console.log(`Payment Order ID: ${latestOrder.payment_order_id}`);

  const paymentOrder = await PaymentOrder.findById(latestOrder.payment_order_id);
  if (paymentOrder) {
    console.log('\n--- PARENT PAYMENT ORDER ---');
    console.log(`Payment Code: ${paymentOrder.payment_code}`);
    console.log(`Payment Status: ${paymentOrder.payment_status}`);
    console.log(`Transaction ID: ${paymentOrder.transaction_id}`);
  } else {
    console.log('\nParent Payment Order not found');
  }

  const payments = await Payment.find({ payment_order_id: latestOrder.payment_order_id });
  console.log(`\n--- RELATED PAYMENTS (${payments.length}) ---`);
  payments.forEach((p, idx) => {
    console.log(`Payment #${idx + 1}:`);
    console.log(`  ID: ${p._id}`);
    console.log(`  Transaction ID: ${p.transaction_id}`);
    console.log(`  Amount: ${p.amount}`);
    console.log(`  Status: ${p.status}`);
  });

  await mongoose.connection.close();
}

run().catch(console.error);
