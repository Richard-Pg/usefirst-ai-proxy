// 诊断端点：检查环境变量 (Vertex AI)
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 获取环境变量
  const projectId = process.env.GCLOUD_PROJECT_ID;
  const location = process.env.GCLOUD_LOCATION;
  const model = process.env.GEMINI_MODEL;
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  
  // 旧的 AI Studio Key（兼容性检查）
  const googleKey = process.env.GOOGLE_API_KEY;
  
  return res.status(200).json({
    mode: 'Vertex AI',
    vertexAI: {
      hasProjectId: !!projectId,
      projectId: projectId || 'NOT_SET',
      hasLocation: !!location,
      location: location || 'NOT_SET',
      hasModel: !!model,
      model: model || 'NOT_SET',
      hasCredentials: !!credentialsJson,
      credentialsLength: credentialsJson ? credentialsJson.length : 0
    },
    aiStudio: {
      hasGoogleKey: !!googleKey,
      keyLength: googleKey ? googleKey.length : 0,
      keyPreview: googleKey ? `${googleKey.substring(0, 10)}...` : 'none'
    },
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('GOOGLE') || 
      key.includes('GCLOUD') || 
      key.includes('GEMINI') ||
      key.includes('API')
    ),
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    status: (!!projectId && !!credentialsJson) ? 'READY' : 'CONFIGURATION_INCOMPLETE'
  });
}
