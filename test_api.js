const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/customer/login', {
      name: "Test User",
      phone: "1112223333"
    });
    console.log("SUCCESS:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("FAILED:", err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
  }
}

testLogin();
