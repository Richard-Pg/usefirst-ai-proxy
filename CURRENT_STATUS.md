# Vertex AI 集成当前状态

## ✅ 已验证工作的部分

1. **OAuth2 认证** ✅ 
   - 服务账号 JSON 正常
   - 访问令牌获取成功

2. **基本 API 连接** ✅
   - 纯文本请求成功：
   ```bash
   curl -X POST .../api/vision \
     -d '{"imageData":"test","prompt":"Say hello","model":"gemini-1.5-flash-001"}'
   # 返回：{"success":true,"result":"Hello","usage":{...}}
   ```

3. **代理服务器配置** ✅
   - 环境变量正确
   - 端点构建正确
   - snake_case 格式正确

## ❌ 当前问题

**图片识别失败：400 - INVALID_ARGUMENT**

### 测试结果

| 测试 | 结果 | 说明 |
|------|------|------|
| 纯文本请求 | ✅ 成功 | 返回 "Hello" |
| 带图片请求 | ❌ 400 | INVALID_ARGUMENT |
| gemini-1.5-flash-001 | ❌ 400 | 文本可以，图片不行 |
| gemini-pro-vision | ❌ 400 | 图片仍然失败 |

### 当前请求格式

```javascript
{
  contents: [{
    role: "user",
    parts: [
      { text: prompt },
      {
        inline_data: {
          mime_type: "image/jpeg",
          data: imageData  // base64
        }
      }
    ]
  }],
  generation_config: {
    temperature: 0.1,
    max_output_tokens: 2048
  }
}
```

## 🔍 可能的原因

### 1. 模型不支持视觉输入

**问题：** `gemini-1.5-flash-001` 可能不支持图片输入

**解决方案：**
- 使用 `gemini-1.5-pro-vision` 或 `gemini-1.5-flash-vision`
- 检查 us-central1 区域支持的模型列表

**验证方法：**
```bash
gcloud ai models list --region=us-central1 --filter="displayName:gemini"
```

### 2. 端点格式问题

**当前：** `/v1beta1/projects/{project}/locations/{location}/publishers/google/models/{model}:generateContent`

**可能需要：**
- 对于视觉模型，可能需要不同的端点
- 或者需要使用 v1 而不是 v1beta1

### 3. 图片格式问题

**当前：** `inline_data` with `mime_type: "image/jpeg"`

**可能问题：**
- Base64 数据可能需要特殊处理
- MIME 类型可能需要调整
- 图片大小限制

### 4. 权限问题

**检查：**
- 服务账号是否有 Vertex AI Vision API 权限
- 是否需要启用额外的 API

## 📋 下一步调试步骤

### 步骤 1: 检查 Vercel 日志

访问：https://vercel.com/你的项目/deployments
- 查看最新部署的 Functions 日志
- 查看打印的完整请求体
- 查看 Vertex AI 返回的详细错误

### 步骤 2: 验证模型可用性

```bash
# 检查可用的视觉模型
gcloud ai models list \
  --region=us-central1 \
  --project=usefirst \
  --filter="displayName:gemini" \
  --format="table(name,displayName)"
```

### 步骤 3: 检查服务账号权限

在 GCP Console:
1. IAM & Admin → Service Accounts
2. 找到你的服务账号
3. 确认有以下角色：
   - Vertex AI User
   - Vertex AI Service Agent
   - (可能需要) AI Platform Admin

### 步骤 4: 尝试不同的端点

**选项 A: 使用 v1**
```
/v1/projects/{project}/locations/{location}/publishers/google/models/{model}:generateContent
```

**选项 B: 使用预测端点**
```
/v1/projects/{project}/locations/{location}/endpoints/{endpoint}:predict
```

### 步骤 5: 简化图片测试

使用非常小的测试图片（1x1 像素）：
```javascript
{
  inline_data: {
    mime_type: "image/png",
    data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }
}
```

## 🆘 如果以上都不行

### 方案 A: 回退到 AI Studio

临时解决方案：
1. 在 Vercel 添加开关环境变量 `USE_AI_STUDIO=true`
2. 代码中检测该变量，使用 AI Studio 格式
3. 至少保证功能可用

### 方案 B: 联系 Google 支持

如果确认配置正确但仍失败：
- 提交 Google Cloud Support ticket
- 附上详细的请求/响应日志
- 询问 Vertex AI Gemini 视觉功能的正确用法

## 📝 当前代码状态

- ✅ OAuth2 认证：正常
- ✅ 纯文本请求：成功
- ❌ 图片请求：失败（400）
- ✅ 字段格式：snake_case 正确
- ✅ 端点格式：标准 Vertex AI 格式

## 🎯 建议优先级

1. **高优先级：** 检查 Vercel 日志，查看完整错误
2. **高优先级：** 验证模型是否支持视觉（gcloud CLI）
3. **中优先级：** 尝试不同的端点版本（v1 vs v1beta1）
4. **中优先级：** 检查服务账号权限
5. **低优先级：** 尝试不同的图片格式

---

**更新时间：** 2025-10-11
**状态：** 调试中 - 纯文本成功，图片失败

