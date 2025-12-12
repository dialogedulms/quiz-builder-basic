export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Domain restriction
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';
  
  const allowedPatterns = [
    'dialogedu.com',
    'vercel.app',
    'localhost'
  ];
  
  const isAllowed = allowedPatterns.some(pattern => 
    origin.includes(pattern) || referer.includes(pattern)
  );

  if ((origin || referer) && !isAllowed) {
    return res.status(403).json({ error: 'Unauthorized domain' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    // Use gemini-1.5-flash for paid tier (stable and fast)
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      }),
    });

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.error('Gemini API error:', JSON.stringify(data.error));
      return res.status(400).json({ 
        error: data.error.message || 'Gemini API error',
        details: data.error.status || ''
      });
    }

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      return res.status(400).json({ error: 'No response generated' });
    }

    return res.status(200).json({ text });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
}
