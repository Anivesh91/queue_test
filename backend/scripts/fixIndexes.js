const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const fixIndexes = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  try {
    console.log('Connecting to MongoDB Atlas at:', uri ? uri.substring(0, 30) + '...' : 'undefined');
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    const usersCol = conn.connection.db.collection('users');

    // 1. Unset googleId on documents where googleId is null
    const updateRes = await usersCol.updateMany({ googleId: null }, { $unset: { googleId: '' } });
    console.log('Unset null googleId on documents count:', updateRes.modifiedCount);

    // 2. Drop old googleId_1 index
    try {
      await usersCol.dropIndex('googleId_1');
      console.log('Dropped old googleId_1 index');
    } catch (err) {
      console.log('Old index note:', err.message);
    }

    // 3. Create proper sparse unique index
    await usersCol.createIndex({ googleId: 1 }, { unique: true, sparse: true });
    console.log('✅ Created proper sparse unique index on googleId');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error fixing indexes:', err.message);
    process.exit(1);
  }
};

fixIndexes();
