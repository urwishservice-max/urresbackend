require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function check() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ["gemini-1.5-flash", "gemini-flash-latest", "gemini-1.5-flash-8b"];
  
  for (const m of models) {
    console.log(`Testing ${m}...`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      const response = await result.response;
      console.log(`✅ Success with ${m}:`, response.text().substring(0, 20));
      process.exit(0);
    } catch (err) {
      console.log(`❌ Failed with ${m}:`, err.message);
    }
  }
}

check();
