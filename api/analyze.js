export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tone, type, concerns } = req.body;

  if (!tone || !type || !concerns?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const subreddits =
    tone === 'brown' || tone === 'deep'
      ? 'r/SkincareAddiction, r/brownskincare, and r/AsianBeauty'
      : 'r/SkincareAddiction and r/AsianBeauty';

  const prompt = `You are a skincare expert who has deeply read thousands of posts from ${subreddits}.

A user has the following profile:
- Skin tone: ${tone}
- Skin type: ${type}
- Concerns they want to target: ${concerns.join(', ')}

Based on what these Reddit communities genuinely recommend for people with this exact profile, provide:

1. A list of 4-6 key ingredients to SEEK (ingredients that are highly recommended in these communities for these concerns)
2. A list of 2-3 ingredients to AVOID (ingredients these communities warn against for this skin profile)
3. A list of 3-4 specific product recommendations that are frequently praised in these communities for this profile

Respond ONLY with a JSON object in this exact format, no preamble, no markdown:
{
  "seek": [
    { "name": "ingredient name", "why": "one sentence why, referencing community wisdom" }
  ],
  "avoid": [
    { "name": "ingredient name", "why": "one sentence why" }
  ],
  "products": [
    { "name": "full product name", "type": "e.g. serum, moisturiser, toner", "why": "2 sentences on why this community loves it for this profile", "source": "e.g. r/SkincareAddiction favourite" }
  ]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000 },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', data);
      return res.status(500).json({ error: 'Gemini API error', detail: data });
    }

    const text = (data.candidates?.[0]?.content?.parts?.[0]?.text || '')
      .replace(/```json|```/g, '')
      .trim();

    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Something went wrong', detail: err.message });
  }
}
