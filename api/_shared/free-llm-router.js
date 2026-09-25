/**
 * High-Speed Free LLM Fallback & Routing System for OpenRouter
 * Exclusively routes through OpenRouter's verified free tier (:free models)
 * with strict per-model timeouts (4.5s) to guarantee response within Vercel Edge execution windows.
 */

export const FREE_MODELS_LADDER = [
  'liquid/lfm-2.5-2.6b:free',
  'nex-agi/nex-n2.5-mini:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'inclusionai/ling-3.0-flash-fin:free',
]

/**
 * Universal request body parser compatible with both Node Serverless and Edge
 */
export async function parseRequestBody(req) {
  try {
    if (req.body) {
      return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    }
    if (typeof req.json === 'function') {
      return await req.json()
    }
  } catch (e) {
    console.warn('[Router] parseRequestBody failed:', e.message)
  }
  return {}
}

/**
 * Universal JSON response sender compatible with both Node Serverless and Edge
 */
export function sendJsonResponse(res, status, data) {
  if (res && typeof res.status === 'function') {
    return res.status(status).json(data)
  }
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

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

  // 4. Resilient partial/truncated JSON repair
  try {
    if (firstBrace !== -1) {
      let s = cleaned.slice(firstBrace)
      let stack = []
      let inString = false
      let escaped = false

      for (let i = 0; i < s.length; i++) {
        const char = s[i]
        if (escaped) { escaped = false; continue }
        if (char === '\\') { escaped = true; continue }
        if (char === '"') { inString = !inString; continue }
        if (!inString) {
          if (char === '{' || char === '[') stack.push(char)
          else if (char === '}' || char === ']') stack.pop()
        }
      }

      if (inString) s += '"'
      s = s.replace(/,\s*$/, '').replace(/,\s*"[^"]*"\s*:\s*$/, '').replace(/,\s*"[^"]*"\s*$/, '')

      while (stack.length > 0) {
        const top = stack.pop()
        if (top === '{') s += '}'
        else if (top === '[') s += ']'
      }

      return JSON.parse(s)
    }
  } catch {}

  return null
}

/**
 * Calls OpenRouter with fast sequential fallback across verified free models
 */
export async function callFreeLLMWithFallback({
  apiKey,
  messages,
  temperature = 0.3,
  max_tokens = 1500,
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

      if (requireJson) {
        payload.response_format = { type: 'json_object' }
      }

      // 12s timeout per model attempt to comfortably accommodate full ATS JSON generation
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://prakhar-cv-prakharmishra2026s-projects.vercel.app',
          'X-Title': 'Prakhar Executive Prep Studio (Free Tier)',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

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
      console.warn(`[FreeLLM Router] Error/timeout calling ${currentModel}:`, err.message)
      lastError = err
    }
  }

  throw lastError || new Error('All free model fallbacks were exhausted')
}
