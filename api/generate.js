export default async function handler(req, res) {
  // CORS headers - allow all for iframe compatibility
  const origin = req.headers.origin || req.headers.referer || '';
  
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Domain restriction - check referer for iframe embeds
  const referer = req.headers.referer || '';
  const allowedPatterns = [
    'dialogedu.com',
    'vercel.app',      // Allow the Vercel-hosted app itself
    'localhost',        // For local testing
  ];
  
  const isAllowed = allowedPatterns.some(pattern => 
    origin.includes(pattern) || referer.includes(pattern)
  );
  
  // If there's an origin/referer and it's not allowed, block it
  // But allow requests with no origin (direct API testing)
  if ((origin || referer) && !isAllowed) {
    return res.status(403).json({ error: 'Unauthorized domain' });
  }

  try {
    const { prompt, file } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Build the request for Gemini
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    let contents = [];
    
    // If there's a file, include it
    if (file && file.data) {
      contents.push({
        parts: [
          {
            inline_data: {
              mime_type: file.type,
              data: file.data
            }
          },
          {
            text: prompt
          }
        ]
      });
    } else {
      contents.push({
        parts: [{ text: prompt }]
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message || 'Gemini API error' });
    }

    // Extract the text from Gemini's response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({ text });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to generate questions' });
  }
}
