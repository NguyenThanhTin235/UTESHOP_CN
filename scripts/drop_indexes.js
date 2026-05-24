const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const cartCollectionExists = collections.some(col => col.name === 'carts');

    if (cartCollectionExists) {
      console.log('Inspecting indexes for "carts" collection...');
      const indexes = await mongoose.connection.db.collection('carts').indexes();
      console.log('Current indexes:', indexes);

      const hasUserIndex = indexes.some(idx => idx.name === 'user_1');
      if (hasUserIndex) {
        console.log('Dropping stale index "user_1"...');
        await mongoose.connection.db.collection('carts').dropIndex('user_1');
        console.log('✅ Dropped index "user_1" successfully!');
      } else {
        console.log('No "user_1" index found.');
      }
    } else {
      console.log('Collection "carts" does not exist yet.');
    }

    // Drop all indexes on carts to let Mongoose recreate clean ones
    console.log('Dropping all indexes on "carts" (except _id) to clean up...');
    try {
      await mongoose.connection.db.collection('carts').dropIndexes();
      console.log('✅ Dropped all indexes on "carts" successfully. Mongoose will rebuild correct indexes on start.');
    } catch (e) {
      console.log('Note on dropping indexes:', e.message);
    }

    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error dropping index:', error);
    process.exit(1);
  }
}

run();
