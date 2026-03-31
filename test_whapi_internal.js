require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

const WHAPI_TOKEN = process.env.WHAPI_TOKEN;
const WHAPI_URL = 'https://gate.whapi.cloud/messages/text';

async function testInternalFormat() {
  const to = "919003507115@s.whatsapp.net";
  const body = "Test message using internal WhatsApp ID format.";
  
  console.log("Testing Whapi with @s.whatsapp.net...");
  try {
    const response = await axios.post(WHAPI_URL, {
      to: to,
      body: body
    }, {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("Result:", response.data);
  } catch (err) {
    console.error("Failed:", err.response?.data || err.message);
  }
}

testInternalFormat();
