# Gemini 3.8 Flash migration

Validated on 2026-10-21.

## Deployment configuration

Set these Vercel variables in Production, Preview and Development:

- `GEMINI_MODEL=gemini-3.8-flash`
- `GCLOUD_LOCATION=global`

Reuse the existing `GCLOUD_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS_JSON`.
Model selection is controlled by the server; legacy clients sending `gemini-2.5-flash` use the server's configured model.
The global endpoint uses `aiplatform.googleapis.com`, without a region prefix.
A successful response adds `model` (selected ID) and `modelVersion` (upstream-reported version), preserving existing `success`, `result` and `usage` fields.

## Compatibility changes

- Use `thinking_level: LOW` for 3.8 Flash; do not send `thinking_budget: 0` or `MINIMAL`.
- Join visible text parts and exclude thought parts when parsing upstream responses.
- Honor the App's receipt output-token budget, bounded to 256–16384 tokens.
- Reject empty or truncated responses rather than returning incomplete JSON as success.
- Allow 60 seconds per function invocation and limit the upstream fetch to 50 seconds.

## Validation

The preview deployment returned `modelVersion: gemini-3.8-flash` for:

- A text health check.
- A generated image containing a blue rectangle and a red circle.
- A generated milk carton using the App's actual item-recognition prompt (valid JSON, refrigerator storage).
- A generated seven-item receipt using the App's actual receipt prompt (all seven items, valid JSON array).

The iOS simulator build passed. Offline handler checks covered legacy-client model overrides, global/regional endpoints, thought filtering, multipart output, receipt token limits, rollback configuration, incomplete output and HTTP methods.

## References

- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-8-flash
- https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing
