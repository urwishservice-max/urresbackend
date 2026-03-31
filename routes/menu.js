const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");
const axios = require("axios");

const OLLAMA_URL = "http://localhost:11434/api/generate";

// Middleware to check admin (simplified)
const isAdmin = (req, res, next) => {
  // In a real app, use JWT middleware. For now, simple check or assume handled by frontend for display.
  // We'll add JWT check in production logic.
  next();
};

/* ================= GET ALL MENU ITEMS ================= */
router.get("/", async (req, res) => {
  try {
    const menu = await Menu.find({ isAvailable: true });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= GET SINGLE MENU ITEM ================= */
router.get("/:id", async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= AI SEARCH (MULTI-LANGUAGE + FUZZY) ================= */
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.json([]);

    // 1. Fetch menu for AI context
    const menuItems = await Menu.find({ isAvailable: true }, 'name');
    const menuList = menuItems.map(m => m.name).join(", ");

    // 2. Ask AI to identify the dish
    const aiPrompt = `The user is searching for food in a restaurant. 
    They might use Tamil, another language, or have spelling mistakes.
    Available Menu Items: [${menuList}]
    
    User Query: "${query}"
    
    Task: Identify which of the "Available Menu Items" the user is likely looking for. 
    Return ONLY the closest matching item name from the list. 
    If it's a completely different language like Tamil, translate it to identify the match (e.g., 'தக்காளி சாதம்' -> 'Tomato Rice').
    If NO match is found, return the original query.
    Return ONLY the string, no explanation.`;

    const aiRes = await axios.post(OLLAMA_URL, {
      model: "llama3",
      prompt: aiPrompt,
      stream: false
    });

    const identifiedName = aiRes.data.response.trim();
    console.log(`[AI-SEARCH] Query: "${query}" -> Identified: "${identifiedName}"`);

    // 3. Search DB with the AI-identified name (using regex for flexibility)
    const results = await Menu.find({
      $or: [
        { name: { $regex: identifiedName, $options: 'i' } },
        { category: { $regex: identifiedName, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } } // Fallback to original query
      ],
      isAvailable: true
    });

    res.json(results);
  } catch (err) {
    console.error("AI Search Error:", err.message);
    // Fallback to basic regex search if AI fails
    const results = await Menu.find({
      name: { $regex: req.body.query, $options: 'i' },
      isAvailable: true
    });
    res.json(results);
  }
});

/* ================= ADMIN: ADD DISH ================= */
router.post("/", async (req, res) => {
  try {
    const { name, price, image, category, stock, description, isVisible, isFeatured, isFavourite, isTodaysSpecial } = req.body;
    const item = new Menu({ 
      name, price, image, category, stock, 
      description, isVisible, isFeatured, isFavourite, isTodaysSpecial 
    });
    await item.save();
    res.json({ status: "created", item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= ADMIN: UPDATE DISH ================= */
router.put("/:id", async (req, res) => {
  try {
    const item = await Menu.findByIdAndUpdate(
      req.params.id, 
      { ...req.body }, 
      { new: true }
    );
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ status: "updated", item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= ADMIN: DELETE DISH ================= */
router.delete("/:id", async (req, res) => {
  try {
    const item = await Menu.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ status: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Get Menu by Restaurant (for React Dashboard compatibility)
router.get('/restaurant/:id', async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

