# Vertex AI 配置说明

## ✅ 已完成
- [x] 代码迁移到 Vertex AI
- [x] 添加 OAuth2 认证逻辑
- [x] 更新 debug 端点
- [x] 推送到 GitHub

## ⚠️ 待完成：Vercel 环境变量配置

### 当前问题
Debug 端点显示 Vertex AI 配置为 `NOT_SET`，因为环境变量只在 Preview 环境中设置。

### 解决步骤

1. **访问 Vercel 环境变量设置页**
   - https://vercel.com/你的项目/settings/environment-variables

2. **为以下变量启用 Production 环境**

| 变量名 | 当前状态 | 需要状态 |
|--------|---------|---------|
| `GCLOUD_PROJECT_ID` | Preview only | ✅ Production + Preview + Development |
| `GCLOUD_LOCATION` | Preview only | ✅ Production + Preview + Development |
| `GEMINI_MODEL` | Preview only | ✅ Production + Preview + Development |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Preview only | ✅ Production + Preview + Development |

3. **操作步骤**
   - 点击每个环境变量右侧的 "..." 菜单
   - 选择 "Edit"
   - 在 "Environments" 部分，勾选所有三个选项：
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - 点击 "Save"

4. **触发重新部署**
   - 方式 1：在 Vercel Dashboard → Deployments → 最新部署 → "..." → "Redeploy"
   - 方式 2：推送任意改动到 GitHub

5. **验证配置**
   ```bash
   curl https://usefirst-ai-proxy.vercel.app/api/debug
   ```
   
   应该看到：
   ```json
   {
     "mode": "Vertex AI",
     "vertexAI": {
       "hasProjectId": true,
       "projectId": "usefirst",
       "hasLocation": true,
       "location": "us-central1",
       "hasModel": true,
       "model": "gemini-2.5-flash",
       "hasCredentials": true
     },
     "status": "READY"
   }
   ```

## 测试 AI 功能

配置完成后，iOS 应用的 AI 识别功能将自动切换到 Vertex AI，无需任何代码修改。

### 验证步骤
1. 打开 UseFirst App
2. 拍照或选择图片进行 AI 识别
3. 检查识别结果是否正常
4. （可选）在 GCP Console 查看 Vertex AI 使用日志

## 回滚方案

如果出现问题，可以快速回滚到 AI Studio 版本：

```bash
cd /path/to/usefirst-ai-proxy
git checkout v1.0.0-ai-studio
git push origin main --force
```

然后在 Vercel 中重新部署即可。

## 成本监控

- **Vertex AI 定价**：与 AI Studio 相似
  - Input: ~$0.075 / 1M tokens
  - Output: ~$0.30 / 1M tokens
  
- **监控位置**：
  - GCP Console → Vertex AI → Dashboard
  - 查看每日请求量和成本

## 支持

如有问题，检查：
1. Vercel 部署日志
2. `/api/debug` 端点输出
3. GCP Console → Vertex AI → Logs

