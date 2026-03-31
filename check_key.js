require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function check() {
  console.log("Checking Gemini API Key...");
  console.log("Key Prefix:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + "..." : "MISSING");
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hi");
    const response = await result.response;
    console.log("✅ Success! Response:", response.text());
  } catch (err) {
    console.error("❌ Diagnostic Failed!");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    if (err.response) {
      console.error("Response Data:", JSON.stringify(err.response.data, null, 2));
    }
  }
}

check();
