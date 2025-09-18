// UseFirst AI Proxy Server - Main Entry Point
export default function handler(req, res) {
  return res.status(200).json({
    message: "UseFirst AI Proxy Server",
    status: "Active",
    endpoints: {
      vision: "/api/vision",
      usage: "/api/usage"
    },
    version: "1.0.0"
  });
}
