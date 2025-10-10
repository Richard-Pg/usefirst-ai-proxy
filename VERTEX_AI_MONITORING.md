# Vertex AI 使用数据监控指南

## 📊 监控方式概览

| 方式 | 用途 | 推荐度 |
|------|------|--------|
| Vertex AI Dashboard | 快速查看总体使用情况 | ⭐⭐⭐⭐⭐ |
| Cloud Logging | 查看详细请求日志 | ⭐⭐⭐⭐ |
| API Metrics | 查看 API 性能指标 | ⭐⭐⭐⭐ |
| Billing Reports | 查看费用和成本 | ⭐⭐⭐⭐⭐ |
| gcloud CLI | 命令行查询 | ⭐⭐⭐ |

---

## 1️⃣ Vertex AI Dashboard

### 直接链接
```
https://console.cloud.google.com/vertex-ai?project=usefirst
```

### 手动导航
1. 访问 https://console.cloud.google.com
2. 选择项目：`usefirst`
3. 左侧菜单 → **Vertex AI** → **Dashboard**

### 可查看内容
- ✅ API 调用总数
- ✅ 成功/失败率
- ✅ 平均延迟
- ✅ 使用的模型列表
- ✅ 实时流量图表

---

## 2️⃣ Cloud Logging（详细日志）

### 直接链接
```
https://console.cloud.google.com/logs/query?project=usefirst
```

### 常用查询语句

#### 查看所有 Vertex AI 请求
```
protoPayload.serviceName="aiplatform.googleapis.com"
```

#### 查看 Gemini 生成内容请求
```
protoPayload.serviceName="aiplatform.googleapis.com"
protoPayload.methodName=~".*GenerateContent"
```

#### 查看最近 1 小时的请求
```
protoPayload.serviceName="aiplatform.googleapis.com"
timestamp>="-1h"
```

#### 查看失败的请求
```
protoPayload.serviceName="aiplatform.googleapis.com"
severity>="ERROR"
```

#### 查看特定模型的调用
```
protoPayload.serviceName="aiplatform.googleapis.com"
protoPayload.resourceName=~".*gemini-2.5-flash.*"
```

#### 查看 Token 使用量
```
protoPayload.serviceName="aiplatform.googleapis.com"
protoPayload.metadata.usageMetadata.totalTokenCount>0
```

### 查看日志详情
点击任意日志条目，可以看到：
- 请求时间戳
- 请求的模型
- Token 使用量（`usageMetadata`）
- 请求响应时间
- HTTP 状态码
- 错误信息（如果有）

---

## 3️⃣ API Metrics（性能指标）

### 直接链接
```
https://console.cloud.google.com/apis/api/aiplatform.googleapis.com/metrics?project=usefirst
```

### 手动导航
1. Google Cloud Console
2. **APIs & Services** → **Enabled APIs**
3. 搜索并点击 **Vertex AI API**
4. 点击 **Metrics** 标签

### 可查看指标
- ✅ **Traffic**（流量）
  - 请求数量趋势
  - QPS（每秒请求数）
- ✅ **Errors**（错误）
  - 错误数量
  - 错误率百分比
- ✅ **Latency**（延迟）
  - 50/95/99 百分位延迟
  - 平均响应时间

### 自定义时间范围
- 最近 1 小时
- 最近 24 小时
- 最近 7 天
- 最近 30 天
- 自定义范围

---

## 4️⃣ Billing & Cost（费用监控）

### A. 查看总体费用

#### 直接链接
```
https://console.cloud.google.com/billing?project=usefirst
```

#### 步骤
1. Google Cloud Console
2. **Billing** → **Reports**
3. 筛选器：
   - **Service**: 选择 `Vertex AI`
   - **Time range**: 选择时间范围

### B. 查看详细 SKU 费用

**Vertex AI 主要 SKU：**
- `Gemini 1.5 Flash Input`
- `Gemini 1.5 Flash Output`
- `Gemini 2.5 Flash Input`
- `Gemini 2.5 Flash Output`

### C. 费用明细示例

```
Gemini 2.5 Flash:
- Input:  $0.075 / 1M tokens
- Output: $0.30 / 1M tokens

示例计算：
- 1000 次请求
- 平均每次 500 input tokens + 200 output tokens
- 总成本 = (500K × $0.075) + (200K × $0.30) = $0.0375 + $0.06 = $0.0975
```

### D. 设置预算警报

#### 直接链接
```
https://console.cloud.google.com/billing/budgets?project=usefirst
```

#### 创建预算警报
1. 点击 **"Create Budget"**
2. 设置预算金额（例如：$50/月）
3. 设置警报阈值：
   - 50% - 发送邮件通知
   - 80% - 发送邮件通知
   - 100% - 发送邮件通知 + 可选禁用 API
4. 输入通知邮箱
5. 点击 **"Finish"**

---

## 5️⃣ 使用 gcloud CLI（可选）

### 安装 gcloud CLI

**macOS：**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

**或使用 Homebrew：**
```bash
brew install --cask google-cloud-sdk
gcloud init
```

### 认证和设置项目

```bash
# 登录
gcloud auth login

# 设置项目
gcloud config set project usefirst

# 验证配置
gcloud config list
```

### 查询日志

**查看最近 10 条 Vertex AI 日志：**
```bash
gcloud logging read "protoPayload.serviceName=\"aiplatform.googleapis.com\"" \
  --limit 10 \
  --format json \
  --project usefirst
```

**查看最近 1 小时的请求：**
```bash
gcloud logging read "protoPayload.serviceName=\"aiplatform.googleapis.com\" AND timestamp>=\"$(date -u -v-1H '+%Y-%m-%dT%H:%M:%SZ')\"" \
  --limit 50 \
  --project usefirst
```

**统计今天的请求数量：**
```bash
gcloud logging read "protoPayload.serviceName=\"aiplatform.googleapis.com\" AND timestamp>=\"$(date -u '+%Y-%m-%d')T00:00:00Z\"" \
  --format json \
  --project usefirst | jq length
```

### 查看 API 使用情况

```bash
# 查看 Vertex AI API 配额
gcloud services quota list \
  --service=aiplatform.googleapis.com \
  --project=usefirst
```

---

## 6️⃣ 实时监控脚本（可选）

创建一个简单的监控脚本来实时查看使用情况：

```bash
#!/bin/bash
# vertex_ai_monitor.sh

PROJECT_ID="usefirst"

echo "🔍 Vertex AI 使用情况监控"
echo "=========================="
echo ""

# 查看最近 10 条请求
echo "📊 最近 10 条 API 调用："
gcloud logging read \
  "protoPayload.serviceName=\"aiplatform.googleapis.com\"" \
  --limit 10 \
  --format="table(timestamp, protoPayload.methodName, protoPayload.status.code)" \
  --project=$PROJECT_ID

echo ""
echo "💰 今日请求统计："
TODAY=$(date -u '+%Y-%m-%d')
REQUEST_COUNT=$(gcloud logging read \
  "protoPayload.serviceName=\"aiplatform.googleapis.com\" AND timestamp>=\"${TODAY}T00:00:00Z\"" \
  --format json \
  --project=$PROJECT_ID | jq length)

echo "  总请求数: $REQUEST_COUNT"
echo ""
```

---

## 7️⃣ 推荐监控策略

### 日常监控（每天查看）
1. ✅ **Vertex AI Dashboard** - 快速查看总体情况
2. ✅ **Billing Reports** - 检查每日费用

### 深度分析（每周/每月）
1. ✅ **Cloud Logging** - 分析详细请求日志
2. ✅ **API Metrics** - 查看性能趋势
3. ✅ **Billing Reports** - 生成月度费用报告

### 告警设置（一次性配置）
1. ✅ **Budget Alerts** - 设置预算警报
2. ✅ **Error Alerts** - 设置错误率警报（可选）

---

## 8️⃣ 常见问题排查

### Q: 看不到任何数据？
**可能原因：**
- 还没有实际调用过 API
- 日志需要几分钟才能显示
- 项目 ID 选择错误

**解决方案：**
1. 在 iOS App 中测试 AI 识别功能
2. 等待 2-3 分钟后刷新页面
3. 确认项目 ID 为 `usefirst`

### Q: 费用显示为 $0？
**可能原因：**
- 还在免费额度内
- 计费延迟（通常延迟 24 小时）

**解决方案：**
- 等待 24-48 小时后查看

### Q: 如何导出使用数据？
**方案：**
1. Billing Reports → 点击 **"Export"**
2. Cloud Logging → 点击 **"Export logs"** → BigQuery/Cloud Storage

---

## 📱 快速链接汇总

| 功能 | 直接链接 |
|------|---------|
| Vertex AI Dashboard | https://console.cloud.google.com/vertex-ai?project=usefirst |
| Cloud Logging | https://console.cloud.google.com/logs/query?project=usefirst |
| API Metrics | https://console.cloud.google.com/apis/api/aiplatform.googleapis.com/metrics?project=usefirst |
| Billing Reports | https://console.cloud.google.com/billing?project=usefirst |
| Budget Alerts | https://console.cloud.google.com/billing/budgets?project=usefirst |

---

## 🎯 快速验证

运行以下命令快速测试 Vertex AI 是否正常工作：

```bash
# 测试代理服务器
curl https://usefirst-ai-proxy.vercel.app/api/debug

# 在 iOS App 中测试 AI 识别
# 然后在 2-3 分钟后访问：
# https://console.cloud.google.com/logs/query?project=usefirst
```

在日志查询中粘贴：
```
protoPayload.serviceName="aiplatform.googleapis.com"
timestamp>="-10m"
```

应该能看到刚才的请求记录！

