// Vercel Serverless Function: AI视觉识别代理
// 路径: /api/vision

export default async function handler(req, res) {
  // 启用 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Device-ID, X-App-Version');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { imageData, prompt, model, deviceID } = req.body;

    // 验证请求数据
    if (!imageData || !prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: imageData, prompt' 
      });
    }

    // 从环境变量获取API密钥
    const API_KEY = process.env.GOOGLE_API_KEY;
    
    if (!API_KEY) {
      console.error('❌ GOOGLE_API_KEY not configured in environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'API key not configured' 
      });
    }

    console.log('🚀 Processing AI request...');
    console.log('📱 Device ID:', deviceID);
    console.log('🤖 Model:', model);

    // 调用Google Gemini API
    const result = await callGeminiAPI(imageData, prompt, API_KEY);
    
    console.log('✅ AI request successful');
    return res.status(200).json({
      success: true,
      result: result,
      usage: {
        tokensUsed: 1000 // 模拟token使用量
      }
    });

  } catch (error) {
    console.error('❌ Vision API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// 调用Google Gemini API
async function callGeminiAPI(imageData, prompt, API_KEY) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageData
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.0,
          maxOutputTokens: 500,
          candidateCount: 1
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
}
