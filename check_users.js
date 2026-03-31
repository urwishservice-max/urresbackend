require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({ role: 'customer' });
  console.log(`Found ${users.length} customers:`);
  users.forEach(u => console.log(`- ${u.name} (${u.phone})`));
  mongoose.disconnect();
}

checkUsers();
