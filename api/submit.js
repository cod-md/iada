
export async function onRequestPost(context) {
  try {
    // 1. Get form data from the request
    const formData = await context.request.formData();
    const doctor = formData.get('doctor');
    const appointment = formData.get('appointment');
    const name = formData.get('name');
    const phone = formData.get('phone');

    // 2. Get Bot Token and Chat ID from Cloudflare's secure environment variables
    const BOT_TOKEN = context.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = context.env.CHAT_ID;

    // 3. Basic validation
    if (!name || !phone || !doctor || !appointment) {
      return new Response(JSON.stringify({ result: 'error', details: 'Missing required form fields.' }), { status: 400 });
    }
    if (!BOT_TOKEN || !CHAT_ID) {
      return new Response(JSON.stringify({ result: 'error', details: 'Server is not configured correctly.' }), { status: 500 });
    }

    // 4. Construct the message for Telegram
    let message = `<b>🚨 حجز موعد جديد 🚨</b>\n\n`;
    message += `<b>👤 اسم المريض:</b> ${name}\n`;
    message += `<b>📞 رقم الهاتف:</b> ${phone}\n`;
    message += `<b>👨‍⚕️ الطبيب:</b> ${doctor}\n`;
    message += `<b>🗓️ الموعد:</b> ${appointment}`;

    // 5. Send the message to the Telegram Bot API
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const telegramResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' }),
    });

    const telegramResult = await telegramResponse.json();
    if (!telegramResult.ok) {
      // If Telegram returns an error, forward it
      throw new Error(telegramResult.description);
    }
    
    // 6. Return a success response to the website's frontend
    return new Response(JSON.stringify({ result: 'success' }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    // If any error occurs, return an error response
    return new Response(JSON.stringify({ result: 'error', details: error.message }), { status: 500 });
  }
}
