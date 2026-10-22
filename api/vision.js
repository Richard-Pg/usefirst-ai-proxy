// Vercel Serverless Function: AI视觉识别代理 (Vertex AI)
// 路径: /api/vision

import { GoogleAuth } from 'google-auth-library';

// 全局令牌缓存（Vercel Serverless 每个实例会保留）
let cachedToken = null;
let tokenExpiry = null;

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
    const { imageData, prompt, deviceID, maxOutputTokens = 4096 } = req.body;

    // 验证请求数据（允许纯文本测试，imageData 可以为空）
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: prompt' 
      });
    }

    // 从环境变量获取配置
    const PROJECT_ID = process.env.GCLOUD_PROJECT_ID;
    const LOCATION = process.env.GCLOUD_LOCATION || 'global';
    // Keep model selection on the server so installed clients upgrade together.
    const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const CREDENTIALS_JSON = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    console.log('🔍 Environment check:');
    console.log('  - PROJECT_ID:', PROJECT_ID);
    console.log('  - LOCATION:', LOCATION);
    console.log('  - MODEL:', MODEL);
    console.log('  - Has credentials:', !!CREDENTIALS_JSON);
    
    if (!PROJECT_ID || !CREDENTIALS_JSON) {
      console.error('❌ Missing required environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error: Missing PROJECT_ID or credentials' 
      });
    }

    console.log('🚀 Processing AI request via Vertex AI...');
    console.log('📱 Device ID:', deviceID);
    console.log('🤖 Model:', MODEL);

    // 调用 Vertex AI
    const outputLimit = Math.min(16384, Math.max(256, Math.trunc(Number(maxOutputTokens) || 4096)));
    const result = await callVertexAI(imageData, prompt, PROJECT_ID, LOCATION, MODEL, CREDENTIALS_JSON, outputLimit);
    
    console.log('✅ Vertex AI request successful');
    return res.status(200).json({
      success: true,
      result: result.text,
      model: MODEL,
      modelVersion: result.modelVersion,
      usage: result.usage
    });

  } catch (error) {
    console.error('❌ Vision API Error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    });
  }
}

// 获取 Vertex AI 访问令牌
async function getVertexAIAccessToken(credentialsJSON) {
  // 检查缓存的令牌是否仍然有效（提前5分钟过期）
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    console.log('🔄 Using cached access token');
    return cachedToken;
  }

  console.log('🔑 Fetching new access token...');
  
  try {
    // 解析服务账号凭证
    const credentials = JSON.parse(credentialsJSON);
    
    // 使用 google-auth-library 获取令牌
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    
    if (!tokenResponse.token) {
      throw new Error('Failed to obtain access token');
    }
    
    // 缓存令牌（默认1小时有效期）
    cachedToken = tokenResponse.token;
    tokenExpiry = Date.now() + 60 * 60 * 1000; // 1小时后过期
    
    console.log('✅ Access token obtained successfully');
    return cachedToken;
    
  } catch (error) {
    console.error('❌ Failed to get access token:', error);
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

// 调用 Vertex AI Gemini API
async function callVertexAI(imageData, prompt, projectId, location, model, credentialsJSON, maxOutputTokens) {
  // 获取访问令牌
  const accessToken = await getVertexAIAccessToken(credentialsJSON);
  
  // 构建 Vertex AI 端点（使用 v1beta1 以支持更多模型）
  const host = location === 'global' ? 'aiplatform.googleapis.com' : `${location}-aiplatform.googleapis.com`;
  const endpoint = `https://${host}/v1beta1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
  
  console.log('🌐 Vertex AI endpoint:', endpoint);
  
  // 构建请求体（Vertex AI 格式 - 使用 snake_case）
  const requestBody = {
    contents: [{
      role: "user",
      parts: (imageData && imageData.length > 10) ? [
        { text: prompt },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: imageData
          }
        }
      ] : [
        { text: prompt }
      ]
    }],
    generation_config: {
      temperature: model === 'gemini-3.8-flash' ? 1.0 : 0.1,
      max_output_tokens: maxOutputTokens,
      ...(model === 'gemini-3.8-flash' ? { thinking_config: { thinking_level: 'LOW' } } : {})
    }
  };
  
  // 打印请求详情（调试）
  console.log('📤 Output token limit:', maxOutputTokens);
  
  // 发送请求到 Vertex AI
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    signal: AbortSignal.timeout(50000),
    body: JSON.stringify(requestBody)
  });

  console.log('📥 Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Vertex AI error response:', errorText);
    throw new Error(`Vertex AI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // 解析响应
  const candidate = data.candidates?.[0];
  const text = (candidate?.content?.parts || [])
    .filter(part => !part.thought && typeof part.text === 'string')
    .map(part => part.text)
    .join('');
  if (!text || candidate.finishReason === 'MAX_TOKENS') {
    throw new Error(`Incomplete model response (${candidate?.finishReason || 'no text'})`);
  }
  const usageMetadata = data.usageMetadata || {};
  
  console.log('📊 Usage metadata:', usageMetadata);
  
  return {
    text: text,
    modelVersion: data.modelVersion,
    usage: {
      tokensUsed: usageMetadata.totalTokenCount || 0,
      promptTokens: usageMetadata.promptTokenCount || 0,
      candidatesTokens: usageMetadata.candidatesTokenCount || 0
    }
  };
}
