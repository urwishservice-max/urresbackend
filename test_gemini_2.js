require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Say 'Gemini 2.0 is active!'");
    const response = await result.response;
    console.log(response.text());
  } catch (err) {
    console.error("Gemini 2.0 Test Failed:", err.message);
  }
}

test();
