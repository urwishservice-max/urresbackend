const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Menu = require('./models/Menu'); // Fix model name

dotenv.config();

const sampleMenu = [
    {
        name: "Hyderabadi Biryani",
        price: 350,
        description: "Aromatic basmati rice cooked with tender meat and authentic spices.",
        image: "https://images.unsplash.com/photo-1563379091339-014389146f63?auto=format&fit=crop&q=80&w=800",
        category: "Indian"
    },
    {
        name: "Paneer Butter Masala",
        price: 280,
        description: "Soft paneer cubes in a rich, creamy tomato-based gravy.",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800",
        category: "Indian"
    },
    {
        name: "Masala Dosa",
        price: 150,
        description: "Crispy rice crepe filled with spiced potato mash, served with chutney.",
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=800",
        category: "South Indian"
    },
    {
        name: "Butter Chicken",
        price: 320,
        description: "Classic North Indian dish featuring tender chicken in a buttery gravy.",
        image: "https://images.unsplash.com/photo-1603894584100-3aa769a91439?auto=format&fit=crop&q=80&w=800",
        category: "Indian"
    },
    {
        name: "Samosa (4 pcs)",
        price: 120,
        description: "Crispy fried pastry with savory potato and pea filling.",
        image: "https://images.unsplash.com/photo-1601050690597-df056fb0ce28?auto=format&fit=crop&q=80&w=800",
        category: "Snacks"
    },
    {
        name: "Margherita Pizza",
        price: 299,
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800",
        category: "Italian"
    },
    {
        name: "Chicken Tacos",
        price: 320,
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800",
        category: "Mexican"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");
        
        await Menu.deleteMany({});
        await Menu.insertMany(sampleMenu);
        
        console.log("Database seeded successfully!");
        process.exit();
    } catch (err) {
        console.error("Error seeding database:", err);
        process.exit(1);
    }
};

seedDB();
