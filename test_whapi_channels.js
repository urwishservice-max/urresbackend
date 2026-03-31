require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

const WHAPI_TOKEN = process.env.WHAPI_TOKEN;

async function checkChannels() {
  console.log("Checking Whapi Channels for token:", WHAPI_TOKEN);
  try {
    const response = await axios.get('https://gate.whapi.cloud/channels', {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`
      }
    });
    console.log("Channels:", JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error("Failed to fetch channels:", err.response?.data || err.message);
  }
}

checkChannels();
