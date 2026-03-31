require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testGroq() {
  try {
    console.log("Testing Groq API...");
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say 'Groq is active!'" }],
      model: "llama-3.3-70b-versatile",
    });

    console.log("Response:", completion.choices[0]?.message?.content);
    console.log("✅ Groq integration successful!");
  } catch (err) {
    console.error("❌ Groq Test Failed:", err.message);
  }
}

testGroq();
