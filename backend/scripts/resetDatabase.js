require('dotenv').config();
const mongoose = require('mongoose');

const wipeActiveDb = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in .env');
    process.exit(1);
  }

  try {
    console.log(`Connecting to database to reset collections...`);
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[Connected to ${conn.connection.name}] Dropping all collections...`);

    const collections = await conn.connection.db.collections();
    for (const collection of collections) {
      await collection.drop();
      console.log(`- Dropped collection: ${collection.collectionName}`);
    }

    console.log(`\n✅ Database '${conn.connection.name}' is now completely clean and empty!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Reset error: ${error.message}`);
    process.exit(1);
  }
};

wipeActiveDb();
