const axios = require('axios');

const WHAPI_TOKEN = process.env.WHAPI_TOKEN;
const WHAPI_URL = 'https://gate.whapi.cloud/messages/text';

/**
 * Send a WhatsApp message using Whapi.Cloud
 * @param {string} to - Recipient's phone number in international format
 * @param {string} body - Message body
 */
const sendWhatsApp = async (to, body) => {
  try {
    // Whapi requires international format WITHOUT the +
    let formattedTo = to.replace(/\D/g, '');
    
    // Auto-prefix 10-digit numbers with 91 (India) if no country code provided
    if (formattedTo.length === 10) {
      formattedTo = '91' + formattedTo;
    }
    
    // Basic validation: must have at least 11 digits (e.g., 91 + 10 digits)
    if (formattedTo.length < 11) {
      console.error(`[Whapi] Invalid phone number (too short): ${to}`);
      return null;
    }

    const response = await axios.post(WHAPI_URL, {
      to: formattedTo,
      body: body,
      typing_time: 0
    }, {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[Whapi WhatsApp] Sent to ${formattedTo}. Message ID: ${response.data.message?.id || 'N/A'}`);
    return response.data;
  } catch (err) {
    console.error(`[Whapi WhatsApp ERROR] Failed to send to ${to}:`, err.response?.data || err.message);
    return null; // Return null instead of throwing to prevent crashing the server
  }
};

module.exports = { sendWhatsApp };
