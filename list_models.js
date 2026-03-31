require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // The SDK doesn't have a direct listModels, but we can try to infer or use the fetch API if needed.
  // Actually, let's just try the most common model name: "gemini-1.5-flash" again but check spelling.
  console.log("Testing gemini-1.5-flash...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Test");
    console.log("Success with gemini-1.5-flash");
  } catch (e) {
    console.log("Failed with gemini-1.5-flash:", e.message);
    console.log("Trying gemini-pro...");
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent("Test");
      console.log("Success with gemini-pro");
    } catch (e2) {
      console.log("Failed with gemini-pro:", e2.message);
    }
  }
}
listModels();
