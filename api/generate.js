export default async function handler(req, res) {
  // CORS and domain restriction
  const origin = req.headers.origin || req.headers.referer || '';
  const allowedDomains = [
    '.dialogedu.com',
    'localhost:3000',  // For local testing
    'localhost:5173',  // Vite dev server
  ];
  
  const isAllowed = allowedDomains.some(domain => origin.includes(domain));
  
  if (!isAllowed && origin) {
    return res.status(403).json({ error: 'Unauthorized domain' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
