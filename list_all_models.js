require('dotenv').config();
const axios = require('axios');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const res = await axios.get(url);
    console.log("Available Models:");
    res.data.models.forEach(m => console.log(`- ${m.name}`));
  } catch (err) {
    console.error("Failed to list models:", err.response ? err.response.data : err.message);
  }
}

listModels();
