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
    const { jdText = '', companyName = 'Target Company', roleTitle = 'Target Role' } = body

    if (!jdText || jdText.trim().length < 20) {
      return sendJsonResponse(res, 400, { error: 'Job description text is too short or empty' })
    }

    // High-density compacted profile (1.5KB vs 14KB) for sub-second LLM processing
    const compactedProfile = {
      candidate: 'Prakhar Mishra',
      currentRole: 'Senior Manager & Chief of Staff / AI Transformation Lead at Capgemini India',
      verifiedMetrics: [
        'AAT Certification failure rate reduced from 20% to <5% via automated skill drift detection',
        'TalentX AI resource allocation platform scaling across 637 cross-functional rotations',
        'GenAI prompt caching and token optimization: 11,700 tokens down to 3,000 tokens (74% latency cut)',
        'Enterprise AI governance board orchestration across 38 practice leaders',
        'Led unit of 7 direct reports and 50+ indirect contributors across global accounts',
      ],
      coreCompetencies: [
        'Enterprise Generative AI Strategy & Operating Model Design',
        'Chief of Staff Governance & Strategic Cadence Execution',
        'Large-Scale Delivery Modernization & Cost-to-Serve Optimization',
        'Client AI Advisory & Transformation Architecture',
      ],
    }

    const systemPrompt = `You are an elite Applicant Tracking System (ATS) optimization specialist and executive resume writer.
You are tailoring the CV for Prakhar Mishra (Senior Manager / Chief of Staff & AI Transformation Lead at Capgemini India).

STRICT ANTI-HALLUCINATION GUARDRAILS:
- You may rephrase verified profile facts only.
- You MUST NOT invent any metrics, titles, employers, dates, skills, certifications, or outcomes not found in the Master Profile.
- Zero mention of "myNaukri" or personal automated scraper workspaces.
- Protect confidentiality: use "large-scale developer division" instead of exact headcount; use "major US retail client" instead of proprietary names.

VERIFIED MASTER PROFILE FACTS:
${JSON.stringify(compactedProfile)}

TASK:
Analyze the provided Job Description for ${companyName} (${roleTitle}) against Prakhar's Master Profile.
Produce a JSON response with the following schema:
{
  "atsMatchScore": number (0-100),
  "matchRationale": "1-sentence summary of candidate strength vs. the JD requirements",
  "matchingKeywords": ["top 4-6 matching keywords"],
  "missingKeywords": ["top 2-3 missing or underemphasized keywords"],
  "tailoredSummary": "A 2-sentence high-impact executive summary customized for ${companyName} - ${roleTitle}",
  "tailoredBulletPoints": [
    {
      "category": "AI Strategy & Governance",
      "bullet": "Action verb + verified task + quantified result incorporating JD keywords cleanly",
      "sourceFact": "Which verified fact in master profile this maps to"
    },
    {
      "category": "Delivery & Talent Optimization",
      "bullet": "Action verb + verified task + quantified result incorporating JD keywords cleanly",
      "sourceFact": "Which verified fact in master profile this maps to"
    }
  ],
  "interviewElevatorPitch": "35-second spoken intro ('Tell me about yourself') tailored specifically for the hiring manager of this JD."
}`

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Analyze this Job Description and generate tailored ATS assets:\n\nCOMPANY: ${companyName}\nROLE: ${roleTitle}\n\nJOB DESCRIPTION:\n${jdText.slice(0, 2000)}`,
      },
    ]

    const { content, modelUsed } = await callFreeLLMWithFallback({
      apiKey,
      messages,
      temperature: 0.2,
      max_tokens: 650,
      requireJson: true,
    })

    const cleanContent = stripThinkingTags(content)
    const parsed = extractJsonFromText(cleanContent)

    if (parsed) {
      return sendJsonResponse(res, 200, { ...parsed, _modelUsed: modelUsed })
    }

    return sendJsonResponse(res, 200, { raw: cleanContent, _modelUsed: modelUsed })
  } catch (err) {
    return sendJsonResponse(res, 500, { error: err.message || 'Server error' })
  }
}
