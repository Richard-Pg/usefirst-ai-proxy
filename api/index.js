// 主页端点
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({
    message: "UseFirst AI Proxy Server",
    status: "Active",
    endpoints: {
      vision: "/api/vision",
      usage: "/api/usage",
      debug: "/api/debug"
    },
    version: "1.0.0"
  });
}
