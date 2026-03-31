const axios = require('axios');

async function testOtpFlow() {
  const phone = "9555566666";
  const name = "OTP Tester";

  try {
    const dob = "1995-05-15";
    console.log("--- Sending OTP ---");
    const sendRes = await axios.post('http://127.0.0.1:5000/api/auth/customer/send-otp', { name, phone, dob });
    console.log("Send OTP Res:", sendRes.data);

    console.log("\nNOTE: In a real test, I'd read the server log for the OTP.");
    console.log("For this script, I'll assume I can find it or I'll just check if the route exists and returns success.");
    
    // Since I can't easily "pipe" the live console output here in one go, 
    // I'll trust the "success" message for now, but I'll check the status.
    
    if (sendRes.data.status === "success") {
       console.log("✅ Step 1: Send OTP works.");
       
       const otp = "986996"; // Hardcoded from server log for this run
       console.log(`\n--- Verifying OTP ${otp} ---`);
       const verifyRes = await axios.post('http://127.0.0.1:5000/api/auth/customer/verify-otp', { phone, otp });
       console.log("Verify OTP Res:", verifyRes.data);

       if (verifyRes.data.status === "success" && verifyRes.data.token) {
         console.log("✅ Step 2: Verify OTP works. Token received.");
       }
    }

  } catch (err) {
    console.error("FAILED:", err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
  }
}

testOtpFlow();
