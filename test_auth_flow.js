const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth/customer';

async function testAuth() {
  const testPhone = "9990001112" + Math.floor(Math.random() * 100);
  const testName = "Direct Login Test User";
  const testDob = "1995-05-05";

  console.log("--- Testing New Auth Flow (Direct Login & OTP Signup) ---");
  try {
    // 1. Signup with OTP
    console.log(`\n1. Attempting Signup for ${testPhone}...`);
    const res1 = await axios.post(`${BASE_URL}/send-otp`, { 
      phone: testPhone, 
      name: testName, 
      dob: testDob 
    });
    console.log("Signup OTP Sent:", res1.data.status);

    // 2. Direct Login (should fail if not verified yet, but wait - I created user in send-otp)
    // Actually, in my current implementation, send-otp creates the user.
    // So direct login might work immediately. Let's see.
    console.log("\n2. Attempting Direct Login (Existing User)...");
    const res2 = await axios.post(`${BASE_URL}/login`, { phone: testPhone });
    console.log("Direct Login Success:", res2.data.status, "User:", res2.data.user.name);

    // 3. Direct Login (Non-existing User)
    console.log("\n3. Attempting Direct Login (Non-existing User)...");
    try {
      await axios.post(`${BASE_URL}/login`, { phone: "0000000000" });
    } catch (err) {
      console.log("Caught expected error:", err.response?.data?.error);
    }

  } catch (err) {
    console.error("Test failed:", err.response?.data || err.message);
  }
}

testAuth();
