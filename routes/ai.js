const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Menu = require('../models/Menu');

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "Groq API Key is missing. Please add it to your .env file." });
    }

    const menuItems = await Menu.find({ isAvailable: true });
    const menuContext = menuItems.map(m => `- ${m.name} (Category: ${m.category}, Price: ₹${m.price})`).join("\n");

    const fullPrompt = `You are "Anotbot", an elite AI waiter for Urwish Restaurant.
    
    MENU DATA:
    ${menuContext}

    USER MESSAGE: "${prompt}"

    TASK:
    Identify the user's intent:
    - GREET: Standard greeting
    - SEARCH: User asking for menu, category, or specific dishes.
    - ORDER: User asking to add items to cart.
    - CANCEL: User asking to cancel or delete an existing order.
    - OTHER: General questions.

    RESPONSE RULES:
    1. Reply in the SAME LANGUAGE as the user (English or Tamil).
    2. If intent is SEARCH, list matching items in "text" AND provide them in "suggested_items".
    3. If the user mentions a GENERAL CATEGORY (e.g. "biriyani"), identify ALL matching items.
    4. RETURN ONLY VALID JSON.

    OUTPUT FORMAT:
    {
      "intent": "GREET" | "SEARCH" | "ORDER" | "CANCEL" | "OTHER",
      "text": "Your friendly response here (bilingual)",
      "detected_order": [{ "name": "Exact Name", "quantity": Number }],
      "suggested_items": ["Exact Name 1", "Exact Name 2"]
    }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: fullPrompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const text = completion.choices[0]?.message?.content;

    // Parse the JSON from Gemini
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { text: text, intent: "OTHER" };
    }

    if (data.intent === 'SEARCH' && data.suggested_items) {
      const fullItems = await Menu.find({
        name: { $in: data.suggested_items },
        isAvailable: true
      });
      data.suggested_items_full = fullItems;
    }

    res.json(data);
  } catch (err) {
    console.error("Gemini AI Error:", err.message);
    
    let errorMessage = "AI Service Unavailable (Gemini)";
    if (err.message.includes("429") || err.message.toLowerCase().includes("quota")) {
       errorMessage = "The AI is currently receiving too many requests (Free Tier Limit). Please try again in 30-60 seconds.";
    }
    
    res.status(err.message.includes("429") ? 429 : 500).json({ 
      text: errorMessage,
      intent: "OTHER" 
    });
  }
});

router.post('/suggest-drink', async (req, res) => {
  try {
    const foodList = items.map((i) => i.name).join(", ");
    const drinks = await Menu.find({ category: 'Drinks', isAvailable: true });
    if (drinks.length === 0) return res.json({ suggestion: null });

    const drinkList = drinks.map(d => d.name).join(", ");

    const systemPrompt = `The customer ordered: [${foodList}]. Available Drinks: [${drinkList}]. Suggest ONE drink that pairs perfectly. Return ONLY the drink name.`;
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }],
      model: "llama-3.3-70b-versatile",
    });

    const suggestion = completion.choices[0]?.message?.content.trim();
    
    res.json({ suggestion });
  } catch (err) {
    console.error("AI Suggestion Error:", err.message);
    res.json({ suggestion: "Fresh Lime Soda" });
  }
});

module.exports = router;
