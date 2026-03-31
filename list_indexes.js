const mongoose = require('mongoose');
require('dotenv').config();

async function listIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const indexes = await db.collection('users').indexes();
    console.log("Indexes on 'users' collection:");
    console.log(JSON.stringify(indexes, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

listIndexes();
