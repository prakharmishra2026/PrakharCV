import masterProfile from '../src/data/master_profile.json'

export const config = {
  runtime: 'edge',
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
    return new Response(JSON.stringify({ error: 'AI API key not configured' }), {
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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Analyze this Job Description and generate tailored ATS assets:\n\nCOMPANY: ${companyName}\nROLE: ${roleTitle}\n\nJOB DESCRIPTION:\n${jdText}`,
          },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return new Response(JSON.stringify({ error: `AI provider error: ${errText}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '{}'

    return new Response(content, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
