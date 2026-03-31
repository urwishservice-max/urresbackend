require('dotenv').config();
const { sendWhatsApp } = require('./utils/whatsapp');

async function testWhapi() {
  const testNumber = '919003534563'; // Replace with a real test number if needed
  const testMessage = '🚀 *Urwish Restaurant*: whapi.cloud integration is active! This is a test message.';

  console.log(`Testing Whapi.Cloud with number: ${testNumber}...`);
  try {
    const result = await sendWhatsApp(testNumber, testMessage);
    if (result) {
      console.log("✅ Whapi Test Success!");
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error("❌ Whapi Test Failed: No result returned.");
    }
  } catch (err) {
    console.error("❌ Whapi Test Exception:", err.message);
  }
}

testWhapi();
