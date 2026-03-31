const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const count = await db.collection('users').countDocuments();
    const withEmail = await db.collection('users').countDocuments({ email: { $exists: true } });
    const nullEmail = await db.collection('users').countDocuments({ email: null });
    
    console.log("Total users:", count);
    console.log("Users with 'email' field:", withEmail);
    console.log("Users with 'email' null:", nullEmail);
    
    if (count > 0) {
      const sample = await db.collection('users').findOne();
      console.log("Sample user:", JSON.stringify(sample, null, 2));
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

checkData();
