const cron = require("node-cron");
const Menu = require("../models/Menu");
const { checkWeatherAndMarket } = require('./marketing');

// Morning Reset: Every day at 06:00 AM
const setupCron = () => {
  cron.schedule('0 6 * * *', async () => {
    try {
      console.log("Running Morning Reset: Marking all items as AVAILABLE...");
      await Menu.updateMany({}, { isAvailable: true });
      console.log("Morning Reset completed.");
    } catch (err) {
      console.error("Morning Reset failed:", err);
    }
  });

  // Daily Joke: Every day at 11:00 AM (1 day after last order)
  cron.schedule('0 11 * * *', async () => {
    try {
      const { sendWhatsApp } = require('./whatsapp');
      const User = require('../models/User');
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBeforeYesterday = new Date();
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

      const users = await User.find({ 
        lastOrderDate: { $gte: dayBeforeYesterday, $lt: yesterday } 
      });

      const jokes = [
        "Why did the tomato turn red? Because it saw the salad dressing! 🍅",
        "What do you call a fake noodle? An Impasta! 🍝",
        "Why don't eggs tell jokes? They'd crack each other up! 🥚",
        "I'm on a seafood diet. I see food and I eat it! 🍤"
      ];

      for (const user of users) {
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        await sendWhatsApp(user.phone, `Hey ${user.name}! Hope you enjoyed your meal yesterday. Here is a joke for you: \n\n${joke} \n\nSee you soon at UrWish! ❤️`);
      }
    } catch (err) {
      console.error("1-Day Joke Cron failed:", err);
    }
  });

  // 5-Day Re-engagement: Every day at 05:00 PM
  cron.schedule('0 17 * * *', async () => {
    try {
      const { sendWhatsApp } = require('./whatsapp');
      const User = require('../models/User');
      
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

      const users = await User.find({ 
        lastOrderDate: { $gte: sixDaysAgo, $lt: fiveDaysAgo } 
      });

      for (const user of users) {
        await sendWhatsApp(user.phone, `Hey ${user.name}, we miss you at UrWish! 👋 \n\nIt's been a few days since your last treat. Use code MISSYOU10 for 10% off your next order today! 🍕`);
      }
    } catch (err) {
      console.error("5-Day Re-engagement Cron failed:", err);
    }
  });

  // Holiday Greetings: Every day at 09:00 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      const { sendWhatsApp } = require('./whatsapp');
      const User = require('../models/User');
      
      const today = new Date();
      const dateStr = `${today.getMonth() + 1}-${today.getDate()}`; // M-D format

      const holidays = {
        "1-1": "Happy New Year! 🎆 Start your year with a feast at UrWish!",
        "1-14": "Happy Pongal! 🌾 Celebrate the harvest with our special traditional menu!",
        "10-31": "Happy Diwali! 🪔 Wishing you a sparkling and delicious festival of lights!",
        "12-25": "Merry Christmas! 🎄 Enjoy our festive holiday treats today!"
      };

      if (holidays[dateStr]) {
        const users = await User.find({ role: 'customer' });
        for (const user of users) {
          await sendWhatsApp(user.phone, `Dearest ${user.name}, ${holidays[dateStr]} \n\n- From your UrWish Restaurant Family ❤️`);
        }
      }
    } catch (err) {
      console.error("Holiday Greeting Cron failed:", err);
    }
  });

  // Birthday Wishes: Every day at 12:00 AM
  cron.schedule('0 0 * * *', async () => {
    try {
      const { sendWhatsApp } = require('./whatsapp');
      const User = require('../models/User');
      
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const searchStr = `${month}-${day}`;

      const users = await User.find({ 
        dateOfBirth: { $regex: searchStr }
      });

      for (const user of users) {
        await sendWhatsApp(user.phone, `🎂 Happy Birthday, ${user.name}! 🎉 \n\nWishing you a fantastic day ahead! To celebrate, why not enjoy your favorite meal at UrWish Restaurant today? We'd love to host you! 🎁🍲`);
      }
    } catch (err) {
      console.error("Birthday Cron failed:", err);
    }
  });

  // 4-Day Follow-up: Every day at 12:00 PM
  cron.schedule('0 12 * * *', async () => {
    try {
      const { sendWhatsApp } = require('./whatsapp');
      const User = require('../models/User');
      const deployedUrl = process.env.DEPLOYED_URL || "https://urwish.com";
      
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const users = await User.find({ 
        lastOrderDate: { $gte: fiveDaysAgo, $lt: fourDaysAgo } 
      });

      const funnyFoodMessages = [
        "Is your stomach growling? Or is it just singing for our Biryani? 🍛 Let's settle it at UrWish!",
        "Life is short. Eat dessert first! 🍨 Check out our sweet treats today.",
        "Your kitchen called... it needs a break. 🍕 Let us do the cooking!",
        "Don't worry, even our pizza thinks you're talented. 🍕 Boost your confidence with a slice!"
      ];

      for (const user of users) {
        const msg = funnyFoodMessages[Math.floor(Math.random() * funnyFoodMessages.length)];
        await sendWhatsApp(user.phone, `Hey ${user.name}! ${msg} \n\nBrowse our menu: ${deployedUrl}/menu 🚀`);
      }
    } catch (err) {
      console.error("4-Day Follow-up Cron failed:", err);
    }
  });

  // Weather Marketing: Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log("Running Weather Marketing Check...");
    await checkWeatherAndMarket();
  });
};

module.exports = setupCron;
