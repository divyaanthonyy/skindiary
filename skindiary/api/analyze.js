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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', data);
      return res.status(500).json({ error: 'Anthropic API error', detail: data });
    }

    const text = data.content
      .map((b) => b.text || '')
      .join('')
      .replace(/```json|```/g, '')
      .trim();

    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Something went wrong', detail: err.message });
  }
}
