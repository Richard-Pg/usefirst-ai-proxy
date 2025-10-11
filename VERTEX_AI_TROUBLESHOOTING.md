# Vertex AI 集成问题排查

## 当前状态

### ✅ 已完成
- [x] 代理代码已切换到 Vertex AI
- [x] OAuth2 认证逻辑已实现
- [x] 环境变量已配置（Vercel）
- [x] iOS 端已更新为主域名
- [x] 添加了 `role: "user"` 字段

### ❌ 当前问题
**错误：400 - Request contains an invalid argument**

```json
{
  "error": {
    "code": 400,
    "message": "Request contains an invalid argument.",
    "status": "INVALID_ARGUMENT"
  }
}
```

## 问题分析

### 可能原因 1: 模型名称格式

**当前设置：** `GEMINI_MODEL=gemini-2.5-flash`

**问题：**
- Vertex AI 可能需要完整的模型版本号
- `gemini-2.5-flash` 可能还未在 Vertex AI 正式发布
- 应该使用经过验证的稳定版本

**解决方案：**
在 Vercel 中修改环境变量 `GEMINI_MODEL` 为以下之一：
- `gemini-1.5-flash-001` （推荐，稳定版本）
- `gemini-1.5-flash-002`
- `gemini-1.5-pro-001`

### 可能原因 2: generationConfig 参数

某些参数在 Vertex AI 中可能不支持或格式不同。

**当前配置：**
```javascript
generationConfig: {
  temperature: 0.0,
  maxOutputTokens: 500
}
```

**建议尝试：**
```javascript
generationConfig: {
  temperature: 0.1,  // 改为非零值
  maxOutputTokens: 2048  // 使用常见值
}
```

### 可能原因 3: 模型端点格式

**当前端点：**
```
https://us-central1-aiplatform.googleapis.com/v1/projects/usefirst/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent
```

对于 Gemini 模型，这是正确的格式。

## 推荐解决步骤

### 步骤 1: 修改模型名称（最可能的解决方案）

1. 访问 Vercel Dashboard → usefirst-ai-proxy → Settings → Environment Variables
2. 找到 `GEMINI_MODEL`
3. 修改值为：`gemini-1.5-flash-001`
4. 确保勾选了 Production 环境
5. 保存后等待自动重新部署

### 步骤 2: 验证模型可用性

可以使用 gcloud CLI 检查可用模型：

```bash
gcloud ai models list \
  --region=us-central1 \
  --project=usefirst \
  --filter="displayName:gemini"
```

### 步骤 3: 测试 API

```bash
curl -X POST https://usefirst-ai-proxy.vercel.app/api/vision \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: test" \
  -d '{
    "imageData": "base64...",
    "prompt": "Test",
    "model": "gemini-1.5-flash-001",
    "deviceID": "test"
  }'
```

## Vertex AI 支持的 Gemini 模型

| 模型 | 状态 | 说明 |
|------|------|------|
| gemini-1.5-flash-001 | ✅ 稳定 | 推荐使用 |
| gemini-1.5-flash-002 | ✅ 稳定 | 更新版本 |
| gemini-1.5-pro-001 | ✅ 稳定 | 高级版本 |
| gemini-2.0-flash-exp | ⚠️ 实验性 | 可能不稳定 |
| gemini-2.5-flash | ❌ 未知 | 可能未发布 |

## 验证清单

- [ ] 模型名称是否正确（包含版本号）
- [ ] 环境变量是否在 Production 环境中
- [ ] 服务账号是否有 Vertex AI 权限
- [ ] GCP 项目是否启用了 Vertex AI API
- [ ] us-central1 区域是否支持该模型

## 查看日志

**Vercel 日志：**
1. Vercel Dashboard → 你的项目 → Deployments
2. 点击最新部署 → Functions
3. 点击 api/vision.js → View Logs

**GCP 日志：**
```
https://console.cloud.google.com/logs/query?project=usefirst
```

查询语句：
```
resource.type="aiplatform.googleapis.com/Endpoint"
protoPayload.methodName=~".*GenerateContent"
```

## 下一步

1. **立即尝试**：修改 `GEMINI_MODEL` 为 `gemini-1.5-flash-001`
2. **如果还不行**：在 GCP Console 验证模型可用性
3. **最后手段**：检查服务账号权限

## 联系支持

如果问题持续，可以：
- 查看 Google Cloud 状态页
- 联系 Google Cloud 支持
- 检查 Vertex AI 配额限制

