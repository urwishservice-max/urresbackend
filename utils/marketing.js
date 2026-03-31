const axios = require('axios');
const User = require('../models/User');
const { sendWhatsApp } = require('./whatsapp');

const checkWeatherAndMarket = async () => {
  try {
    const WEATHER_API_KEY = process.env.WEATHER_API_KEY || "8952848b030b4d00890123456260325"; // Example key
    const city = "Chennai";
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}`);
    
    const weather = response.data.weather[0].main; // e.g., "Rain", "Clear"
    console.log(`Current weather in ${city}: ${weather}`);

    if (weather === "Rain" || weather === "Clouds") {
      console.log("Weather trigger: RAIN detected. Sending marketing messages...");
      
      // Get customers who ordered in last 10 days
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      
      const recentCustomers = await User.find({ 
        role: "customer",
        lastVisit: { $gte: tenDaysAgo }
      });

      const deployedUrl = process.env.DEPLOYED_URL || "https://urwish.com";
      for (const customer of recentCustomers) {
        await sendWhatsApp(customer.phone, `It's raining! ☔ How about a hot cup of tea and some snacks from UrWish? ☕🥐 \n\nCheck our rainy day specials here: ${deployedUrl}/menu`);
      }
    }
  } catch (err) {
    console.error("Weather marketing check failed:", err.message);
  }
};

module.exports = { checkWeatherAndMarket };
