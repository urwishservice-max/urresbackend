require('dotenv').config();
const { sendWhatsApp } = require('./utils/whatsapp');

async function debugMaddy() {
  const maddyPhone = '6380200248';
  console.log(`Debugging WhatsApp send to Maddy (${maddyPhone})...`);
  const result = await sendWhatsApp(maddyPhone, "Diagnostic test message for Maddy 🛠️");
  console.log("Whapi Result:", JSON.stringify(result, null, 2));
}

debugMaddy();
