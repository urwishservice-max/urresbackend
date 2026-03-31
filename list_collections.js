const mongoose = require('mongoose');
require('dotenv').config();

async function listCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections in 'urwish' database:");
    console.log(collections.map(c => c.name));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

listCollections();
