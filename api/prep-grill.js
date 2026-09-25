import {
  callFreeLLMWithFallback,
  extractJsonFromText,
  parseRequestBody,
  sendJsonResponse,
} from './_shared/free-llm-router.js'

export const maxDuration = 60

function stripThinkingTags(text) {
  if (!text) return ''
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJsonResponse(res, 405, { error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    return sendJsonResponse(res, 500, { error: 'OpenRouter API key not configured' })
  }

  try {
    const body = await parseRequestBody(req)
    const {
      company = 'Deloitte',
      round = 'AI Strategy Case',
      question = '',
      candidateAnswer = '',
      history = [],
      mode = 'grill', // 'grill' (tough follow-up) | 'score' (rubric evaluation)
    } = body

    if (!candidateAnswer && mode === 'score') {
      return sendJsonResponse(res, 400, { error: 'candidateAnswer is required for scoring' })
    }

    const systemPrompt = `You are a legendary Senior Partner, VP, and Bar Raiser conducting an elite, high-stakes interview for ${company} in the ${round} round.
Candidate: Prakhar Mishra (Senior Manager / Chief of Staff & AI Transformation Lead at Capgemini India, B.Tech + MBA).

YOUR PERSONA:
- Demanding, intellectually rigorous, and zero-fluff.
- You challenge hand-wavy claims, unquantified metrics, missing trade-offs, and lack of concrete technical/operational depth.
- You respect crisp structured thinking (STAR, First Principles, clear trade-off framing).

${
  mode === 'score'
    ? `TASK:
Evaluate the candidate's answer strictly against this interview question:
Question: "${question}"
Candidate Answer: "${candidateAnswer}"

Return ONLY a valid JSON object matching this exact schema:
{
  "overallScore": number (0-100),
  "verdict": "STRONG HIRE" | "LEAN HIRE" | "LEAN REJECT" | "STRONG REJECT",
  "rubric": {
    "starStructure": { "score": number (0-25), "comment": "string" },
    "quantifiableImpact": { "score": number (0-25), "comment": "string" },
    "strategicTradeoffs": { "score": number (0-25), "comment": "string" },
    "executivePresence": { "score": number (0-25), "comment": "string" }
  },
  "topStrength": "string summarizing what resonated most",
  "criticalVulnerability": "string summarizing where the answer failed or sounded weak",
  "rewordedScript": "A 3-4 sentence punchy, bulletproof executive-level STAR answer Prakhar should say instead, leveraging his actual verified metrics (e.g., AAT 20% to <5% cert failure reduction, TalentX, 637 rotations, 11.7k to 3k token optimization, 38+ leaders governance)."
}`
    : `TASK:
The candidate just answered your question in the ${company} - ${round} round.
Question asked: "${question}"
Candidate Answer: "${candidateAnswer}"

Respond as the tough interviewer in character:
1. Immediately challenge ONE specific vulnerability, vague metric, or unaddressed risk in their answer (e.g., "You mentioned X, but what happens when...", or "How did you measure that without Y...").
2. Demand an uncompromising technical or commercial trade-off defense.
3. Keep it punchy, direct, and under 90 words. Do not praise them or say "Great answer!". Jump straight into the pressure probe.`
}`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({
        role: h.role === 'candidate' ? 'user' : 'assistant',
        content: h.text,
      })),
      {
        role: 'user',
        content:
          mode === 'score'
            ? `Evaluate and score this answer strictly according to the JSON format.`
            : `Here is my answer to "${question}":\n\n"${candidateAnswer}"\n\nGrill me on it.`,
      },
    ]

    const { content, modelUsed } = await callFreeLLMWithFallback({
      apiKey,
      messages,
      temperature: mode === 'score' ? 0.2 : 0.6,
      requireJson: mode === 'score',
    })

    const cleanContent = stripThinkingTags(content)

    if (mode === 'score') {
      const parsed = extractJsonFromText(cleanContent)
      if (parsed) {
        return sendJsonResponse(res, 200, { ...parsed, _modelUsed: modelUsed })
      }
      return sendJsonResponse(res, 200, { raw: cleanContent, _modelUsed: modelUsed })
    }

    return sendJsonResponse(res, 200, { probe: cleanContent, _modelUsed: modelUsed })
  } catch (err) {
    return sendJsonResponse(res, 500, { error: err.message || 'Server error' })
  }
}
