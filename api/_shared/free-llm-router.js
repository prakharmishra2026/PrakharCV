/**
 * Free LLM Fallback & RoutingMagic System for OpenRouter
 * Exclusively routes through OpenRouter's free tier (:free models)
 * with multi-tier automatic fallback so no credits are ever consumed.
 */

export const FREE_MODELS_LADDER = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-r1:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-small-24b-instruct-2501:free',
]

/**
 * Robust JSON extractor for LLM output (handles raw JSON, markdown codeblocks, or surrounding text)
 */
export function extractJsonFromText(text) {
  if (!text || typeof text !== 'string') return null
  const cleaned = text.trim()
  
  // 1. Direct parse attempt
  try {
    return JSON.parse(cleaned)
  } catch {}

  // 2. Extract from markdown ```json ... ``` block
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim())
    } catch {}
  }

  // 3. Substring between first '{' and last '}'
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1))
    } catch {}
  }

  return null
}

/**
 * Calls OpenRouter with routingmagic fallback across free models
 */
export async function callFreeLLMWithFallback({
  apiKey,
  messages,
  temperature = 0.3,
  max_tokens = 2000,
  requireJson = false,
}) {
  let lastError = null

  for (let i = 0; i < FREE_MODELS_LADDER.length; i++) {
    const primaryModel = FREE_MODELS_LADDER[i]
    const remainingModels = FREE_MODELS_LADDER.slice(i)

    try {
      const payload = {
        model: primaryModel,
        models: remainingModels,
        route: 'fallback',
        messages,
        temperature,
        max_tokens,
      }

      // Add response_format if required and not deepseek-r1 (which can conflict with strict json format)
      if (requireJson && !primaryModel.includes('deepseek-r1')) {
        payload.response_format = { type: 'json_object' }
      }

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://prakhar-cv-prakharmishra2026s-projects.vercel.app',
          'X-Title': 'Prakhar Executive Prep Studio (Free Tier)',
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content && content.trim()) {
          return {
            content: content.trim(),
            modelUsed: data.model || primaryModel,
          }
        }
      } else {
        const errorText = await res.text()
        console.warn(`[FreeLLM Router] ${primaryModel} failed with status ${res.status}: ${errorText}`)
        lastError = new Error(`OpenRouter (${primaryModel}) ${res.status}: ${errorText}`)
      }
    } catch (err) {
      console.warn(`[FreeLLM Router] Error invoking ${primaryModel}:`, err.message)
      lastError = err
    }
  }

  throw lastError || new Error('All free model fallbacks were exhausted')
}
