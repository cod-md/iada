export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const data = req.body; // Vercel ي parse JSON تلقائيًا
      res.status(200).json({
        result: 'success',
        details: 'تم استلام الحجز (تجربة فقط)',
        data,
      });
    } catch (e) {
      res.status(500).json({ result: 'error', details: e.message });
    }
  } else {
    res.status(200).json({ result: 'success', details: 'Function is alive (GET)' });
  }
}
