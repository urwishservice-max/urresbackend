require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

const WHAPI_TOKEN = process.env.WHAPI_TOKEN;

async function checkHealth() {
  console.log("Checking Whapi Health with token as query param...");
  try {
    const response = await axios.get(`https://gate.whapi.cloud/messages/text?token=${WHAPI_TOKEN}`);
    console.log("Success (Wait, this should be a GET 405 or something but not 404):", response.status);
  } catch (err) {
    console.error("Result:", err.response?.data || err.message);
  }
}

checkHealth();
