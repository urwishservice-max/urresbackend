require('dotenv').config({ path: './backend/.env' });
const { sendWhatsApp } = require('./utils/whatsapp');

async function test() {
  console.log("Testing Whapi.Cloud directly...");
  console.log("Token:", process.env.WHAPI_TOKEN ? "FOUND" : "MISSING");
  
  const testPhone = "919003507115"; // Replace with your number for testing if needed
  const testMessage = "Test message from Urwish Restaurant Diagnostic Tool 🚀";
  
  try {
    const result = await sendWhatsApp(testPhone, testMessage);
    console.log("Result:", result);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
