import masterProfile from '../src/data/master_profile.json'
import { callFreeLLMWithFallback, extractJsonFromText } from './_shared/free-llm-router.js'

export const config = {
  runtime: 'edge',
}

function stripThinkingTags(text) {
  if (!text) return ''
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { jdText = '', companyName = 'Target Company', roleTitle = 'Target Role' } = await req.json()

    if (!jdText || jdText.trim().length < 20) {
      return new Response(JSON.stringify({ error: 'Job description text is too short or empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const systemPrompt = `You are an elite Applicant Tracking System (ATS) optimization specialist and executive resume writer.
You are tailoring the CV for Prakhar Mishra (Senior Manager / Chief of Staff & AI Transformation Lead at Capgemini India).

STRICT ANTI-HALLUCINATION GUARDRAILS:
- You may rephrase verified profile facts only.
- You MUST NOT invent any metrics, titles, employers, dates, skills, certifications, or outcomes not found in the Master Profile.
- Zero mention of "myNaukri" or personal automated scraper workspaces.
- Protect confidentiality: use "large-scale developer division" instead of exact headcount; use "major US retail client" instead of proprietary names.

MASTER PROFILE JSON (GROUND TRUTH):
${JSON.stringify(masterProfile)}

TASK:
Analyze the provided Job Description for ${companyName} (${roleTitle}) against Prakhar's Master Profile.
Produce a JSON response with the following schema:
{
  "atsMatchScore": number (0-100),
  "matchRationale": "2-sentence summary of candidate strength vs. the JD requirements",
  "matchingKeywords": ["list", "of", "top", "matching", "keywords"],
  "missingKeywords": ["list", "of", "missing", "or", "underemphasized", "keywords"],
  "tailoredSummary": "A 3-sentence high-impact executive summary customized for ${companyName} - ${roleTitle}",
  "tailoredBulletPoints": [
    {
      "category": "AI Architecture & Strategy / Operations / Governance",
      "bullet": "Action verb + verified task + quantified result incorporating JD keywords cleanly",
      "sourceFact": "Which verified fact in master profile this maps to"
    }
  ],
  "interviewElevatorPitch": "60-second spoken intro ('Tell me about yourself') tailored specifically for the hiring manager of this JD."
}`

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Analyze this Job Description and generate tailored ATS assets:\n\nCOMPANY: ${companyName}\nROLE: ${roleTitle}\n\nJOB DESCRIPTION:\n${jdText}`,
      },
    ]

    const { content, modelUsed } = await callFreeLLMWithFallback({
      apiKey,
      messages,
      temperature: 0.2,
      requireJson: true,
    })

    const cleanContent = stripThinkingTags(content)
    const parsed = extractJsonFromText(cleanContent)

    if (parsed) {
      return new Response(JSON.stringify({ ...parsed, _modelUsed: modelUsed }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(cleanContent, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
