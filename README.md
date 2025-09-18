# UseFirst AI Proxy Server

这是UseFirst应用的AI代理服务器，用于安全地处理AI API请求。

## 部署到Vercel

1. 将此目录推送到GitHub仓库
2. 在Vercel中导入该仓库
3. 设置环境变量：`GOOGLE_API_KEY`
4. 部署

## API端点

- `/api/vision` - AI视觉识别
- `/api/usage` - 使用量统计

## 环境变量

- `GOOGLE_API_KEY` - Google Gemini API密钥
