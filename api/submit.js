// This is the Vercel serverless function handler.
export default async function handler(req, res) {
  // We only want to handle POST requests for form submissions.
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed.' });
  }

  try {
    // 1. Get data from the request. Vercel automatically parses JSON.
    const { doctor, appointment, name, phone } = req.body;

    // 2. Get secrets from Vercel's Environment Variables.
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    // 3. Basic validation
    if (!name || !phone || !doctor || !appointment) {
      return res.status(400).json({ result: 'error', details: 'Missing required form fields.' });
    }
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error("Server is not configured correctly. Secrets are missing.");
      return res.status(500).json({ result: 'error', details: 'Server is not configured correctly.' });
    }

    // 4. Construct the message for Telegram (using HTML for bold text).
    let message = `<b>🚨 حجز موعد جديد 🚨</b>\n\n`;
    message += `<b>👤 اسم المريض:</b> ${name}\n`;
    message += `<b>📞 رقم الهاتف:</b> ${phone}\n`;
    message += `<b>👨‍⚕️ الطبيب:</b> ${doctor}\n`;
    message += `<b>🗓️ الموعد:</b> ${appointment}`;

    // 5. Send the message using the Telegram Bot API.
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const telegramResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    const telegramResult = await telegramResponse.json();
    if (!telegramResult.ok) {
      console.error("Telegram API Error:", telegramResult.description);
      throw new Error(telegramResult.description);
    }
    
    // 6. Return a success response to your website.
    return res.status(200).json({ result: 'success' });

  } catch (error) {
    // If any error occurs, log it and return an error response.
    console.error("Function Error:", error.message);
    return res.status(500).json({ result: 'error', details: error.message });
  }
}
