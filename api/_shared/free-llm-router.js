/**
 * Free LLM Fallback & Routing System for OpenRouter
 * Exclusively routes through OpenRouter's verified free tier (:free models and openrouter/free)
 * with individual multi-tier automatic fallback so no credits are ever consumed.
 */

export const FREE_MODELS_LADDER = [
  'openrouter/free',
  'google/gemma-4-31b-it:free',
  'qwen/qwen3.8-27b:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3.5-lightning:free',
  'liquid/lfm-2.5-2.6b:free',
  'nex-agi/nex-n2.5-pro:free',
  'nex-agi/nex-n2.5-mini:free',
  'thinkingmachines/inkling:free',
  'cohere/north-mini-code:free',
  'z-ai/glm-5.2:free',
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
 * Calls OpenRouter with sequential fallback across verified free models
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
    const currentModel = FREE_MODELS_LADDER[i]

    try {
      const payload = {
        model: currentModel,
        messages,
        temperature,
        max_tokens,
      }

      // Add response_format only when supported (avoid on openrouter/free router)
      if (requireJson && currentModel !== 'openrouter/free') {
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
            modelUsed: data.model || currentModel,
          }
        }
      } else {
        const errorText = await res.text()
        console.warn(`[FreeLLM Router] ${currentModel} returned ${res.status}: ${errorText}`)
        lastError = new Error(`OpenRouter (${currentModel}) ${res.status}: ${errorText}`)
      }
    } catch (err) {
      console.warn(`[FreeLLM Router] Network error calling ${currentModel}:`, err.message)
      lastError = err
    }
  }

  throw lastError || new Error('All free model fallbacks were exhausted')
}
