const axios = require('axios');

async function testVerifyOtp() {
  const phone = "9876543210";
  const otp = "789777"; // OTP from server log

  try {
    console.log("--- Verifying OTP ---");
    const verifyRes = await axios.post('http://127.0.0.1:5000/api/auth/customer/verify-otp', { phone, otp });
    console.log("Verify OTP Res:", JSON.stringify(verifyRes.data, null, 2));

    if (verifyRes.data.status === "success") {
       console.log("✅ Step 2: Verify OTP works. JWT issued.");
    }

  } catch (err) {
    console.error("FAILED:", err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
  }
}

testVerifyOtp();
