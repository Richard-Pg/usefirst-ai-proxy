// 诊断端点：检查环境变量
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const googleKey = process.env.GOOGLE_API_KEY;
  
  return res.status(200).json({
    hasGoogleKey: !!googleKey,
    keyLength: googleKey ? googleKey.length : 0,
    keyPreview: googleKey ? `${googleKey.substring(0, 10)}...` : 'none',
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('GOOGLE') || key.includes('API')
    ),
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
}
