const mongoose = require('mongoose');
require('dotenv').config();

async function cleanDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    console.log("Dropping 'users' collection to clear old indexes and polluted data...");
    await db.collection('users').drop();
    console.log("✅ Collection 'users' dropped.");
    
    process.exit(0);
  } catch (err) {
    if (err.codeName === 'NamespaceNotFound') {
        console.log("ℹ️ Collection 'users' not found, nothing to drop.");
        process.exit(0);
    }
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

cleanDB();
