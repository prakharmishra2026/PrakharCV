export interface CompanyBattlecard {
  id: string
  name: string
  roleTitle: string
  badge: string
  location: string
  experienceReq: string
  overview: string
  prakharAdvantage: string
  loopStructure: { round: string; focus: string; interviewer: string }[]
  grillingQuestions: {
    question: string
    toughAngle: string
    rehearsedDefense: string
    keyMetrics: string[]
  }[]
  starStories: {
    title: string
    situation: string
    task: string
    action: string
    result: string
  }[]
  counterQuestions: string[]
  rescuePlan?: {
    issueSummary: string
    reframePoints: { title: string; explanation: string }[]
    emailSubject: string
    emailBody: string
  }
  defaultJd: string
}

export const COMPANY_BATTLECARDS: CompanyBattlecard[] = [
  {
    id: 'deloitte-ai',
    name: 'Deloitte S&T (SFL Scientific)',
    roleTitle: 'Senior Consultant – AI Strategy',
    badge: 'Strategy & Transactions',
    location: 'Gurgaon / Bangalore / Hyderabad (3 days/wk)',
    experienceReq: '4+ Years Post-MBA + B.Tech',
    overview:
      'Deloitte Strategy & Transactions (S&T) SFL Scientific practice helps C-suite clients shape AI ambition, prioritize high-value use cases, write detailed PRDs for ML systems, design AI operating models, and bridge strategy with engineering execution.',
    prakharAdvantage:
      'Direct 1:1 match. Bridges classical PMO governance (forecasting, rotation pipelines, KPI models) with hands-on AI tool construction (AAT adaptive engine, TalentX voice agent, token FinOps). Promoted 3x at Capgemini to Senior Manager.',
    loopStructure: [
      {
        round: 'Round 1: AI Ambition & Strategic Prioritization',
        focus: 'Value vs Feasibility matrix, Enterprise AI Roadmapping, TCO/ROI modeling',
        interviewer: 'Partner / Director',
      },
      {
        round: 'Round 2: AI Solution Architecture & PRDs',
        focus: 'Probabilistic PRD specs, confidence thresholds, fallback behavior, Prompting vs RAG vs Fine-tuning',
        interviewer: 'Senior Manager / Technical Director',
      },
      {
        round: 'Round 3: Behavioral & Stakeholder Leadership',
        focus: 'Cross-functional orchestration, managing client skepticism, firm contribution',
        interviewer: 'Senior Managing Director',
      },
    ],
    grillingQuestions: [
      {
        question:
          "A client CEO wants to 'implement GenAI across the enterprise' but doesn't have a clean data foundation. How do you advise them?",
        toughAngle:
          "If you tell them 'clean your data for 2 years', you lose the engagement. If you jump into GenAI, it hallucinates and burns cash. What exact path do you take?",
        rehearsedDefense:
          "I use a bi-modal value realization framework: Track A targets 2-3 high-value, low-risk use cases on bounded domain corpora (e.g. policy intelligence, code generation, draft summaries) delivering measurable ROI in 60-90 days while establishing token FinOps and prompt governance. Track B ties foundational data lakehouse investments directly to downstream high-value pipelines. We never clean data for the sake of cleaning data; we audit schemas required for the top 3 ROI workflows. At Capgemini, when rolling out our division's GenAI blueprint across 20,000 developers, targeted modular agents (AAT) reduced certification failures from 20% to <5% within 90 days, creating the momentum and savings needed for deeper structural investments.",
        keyMetrics: ['20% to <5% certification failure reduction', '60-90 day Track A ROI window', '4-layer FinOps observability'],
      },
      {
        question: 'Walk me through how you write an AI PRD. How do you handle non-deterministic outputs and latency?',
        toughAngle:
          'Product managers love standard PRDs. ML systems break standard PRDs because outputs are probabilistic. How do you write acceptance criteria for an LLM system?',
        rehearsedDefense:
          'In an AI PRD, functional requirements must be probabilistic and risk-bounded. First, strict schema enforcement using Pydantic/JSON validation. Second, confidence routing: High confidence (>0.85 groundedness) gets automated synthesis; Medium (0.65-0.85) is flagged with uncertainty markers for secondary verification; Low (<0.65) triggers deterministic fallback or human escalation. Third, latency SLAs: streaming TTFT <1.2s by routing extraction to quantized small models (Llama-3.3-70B/Qwen) and reserving heavier frontier models for asynchronous reasoning. Fourth, 4-layer guardrails against prompt injection and data leakage.',
        keyMetrics: ['TTFT <1.2s SLA', 'Confidence thresholds: >0.85 auto, <0.65 fallback', '11,700 to 3,000 token reduction via prompt tiering'],
      },
      {
        question: 'Fine-tuning vs. RAG vs. Prompt Engineering: When do you recommend which to an enterprise client?',
        toughAngle: "Don't recite textbook definitions. Give me the economic and maintenance trade-offs.",
        rehearsedDefense:
          'Prompt Engineering / Few-Shot is default Day-1 baseline for rapid prototyping and unstructured reasoning with lowest capex. RAG is mandatory when data changes frequently, source citation is legally required, and proprietary knowledge must stay fresh without retraining. Fine-tuning is recommended ONLY when: (1) Domain style/syntax cannot be taught in-context, (2) Drastic cost/latency reduction is needed by distilling a large model into a compact 7B/8B model running on-premise, or (3) Specific classification accuracy cannot reach SLA via prompting. Fine-tuning is never a substitute for dynamic knowledge retrieval.',
        keyMetrics: ['Capex vs Opex model', 'Retrieval precision vs fine-tuning maintenance debt'],
      },
    ],
    starStories: [
      {
        title: 'Adaptive Assessment Tool (AAT) — Engineering & Deployment',
        situation: 'Capgemini developer division suffered a 20% failure rate on expensive external vendor certifications, resulting in repeated exam fee burn and delayed project deployment.',
        task: 'As Chief of Staff and AI Transformation Lead, envision and specify an intelligent diagnostic platform to benchmark developer skills before taking external exams.',
        action: 'Architected AAT using Computer Adaptive Testing (CAT) algorithms and Item Response Theory. Formulated dynamic question difficulty rebalancing and cohort performance dashboards. Integrated Back-On-Track Performance (BOTP) compliance tracking.',
        result: 'Slashed external recertification failure rate from 20% to under 5%, saving millions in salary and licensing overhead while accelerating workforce deployment cycles.',
      },
      {
        title: 'AI FinOps & Four-Layer Token Optimization',
        situation: 'Rapid adoption of LLM features across internal portals threatened to spiral API costs uncontrollably as prompt payloads grew.',
        task: 'Formulate and enforce an enterprise AI FinOps framework to optimize token consumption without degrading reasoning quality.',
        action: 'Implemented 4-layer token observability and intelligent model routing (RoutingMagic architecture). Re-engineered prompt structures from verbose single-turn prompts into modular few-shot templates with semantic caching. Routed classification tasks to lightweight models.',
        result: 'Reduced average token burn per request from 11,700 tokens to ~3,000 tokens (a 74% reduction in per-call compute cost) while maintaining 99%+ schema adherence.',
      },
    ],
    counterQuestions: [
      'How does SFL Scientific collaborate with Deloitte core Strategy & Transactions teams during technology due diligence—are you increasingly assessing AI architecture moats and proprietary data assets for target acquisitions?',
      'When helping Fortune 500 clients transition from GenAI pilots to scaled production, what is the biggest organizational bottleneck Deloitte encounters—is it typically data infrastructure, talent operating model, or risk/compliance hesitation?',
    ],
    defaultJd: `Deloitte Strategy & Transactions (S&T) - SFL Scientific – AI Strategy (Senior Consultant)
Key responsibilities:
- Provide strategic direction to clients on how to leverage AI/GenAI to drive innovation and enterprise value.
- Work with C-suite stakeholders to define AI strategy, vision, and transformation roadmaps.
- Identify and prioritize high-impact AI/GenAI use cases, develop business cases, and define value realization pathways.
- Own end-to-end product lifecycle for AI features from problem framing through sprint delivery, UAT, launch, and post-launch iteration.
- Define detailed product requirements (PRDs) for AI/ML features specifying model inputs/outputs, confidence thresholds, fallback behaviors, latency requirements, and human-in-the-loop escalation paths.
- Partner with data scientists and ML engineers to define data schemas, feature requirements, and evaluation frameworks; contribute to decisions on model selection, fine-tuning vs. prompting, and deployment approach.
Requirements:
- MBA from premier institution + Bachelor's degree in Engineering (CS/IT/Data Science preferred).
- 4+ years of relevant experience in AI strategy, AI product management, or AI transformation programs.
- Strong stakeholder management, executive communication, and analytical problem-solving skills.`,
  },
  {
    id: 'microsoft-ai',
    name: 'Microsoft ISD (AI Solutions)',
    roleTitle: 'GenAI / Agentic Solutions Delivery (Senior Consultant / IC)',
    badge: 'Req 200045333',
    location: 'Hyderabad (3 days/wk)',
    experienceReq: '8+ Years Platform / AI Delivery',
    overview:
      'Microsoft Industry Solutions Delivery (ISD). Deliver enterprise-scale GenAI and agentic solutions on Azure, Power Platform, M365 Copilots, and Dynamics 365. Rapid prototype to production hardening with automated evals, tool-use orchestration, and safety guardrails.',
    prakharAdvantage:
      'Ships real production systems with automated evaluation suites (Langfuse tracing, LLM-as-judge over versioned datasets, Supabase pgvector, Vercel Edge). Bridges executive strategy with production prompt architecture.',
    loopStructure: [
      { round: 'Round 1: Customer Scenarios & Architecture', focus: 'Agentic workflows, tool use, API function calling, Azure AI Foundry', interviewer: 'Lead Solution Architect' },
      { round: 'Round 2: Defend Your Build & Engineering Depth', focus: 'Production hardening, eval loops, token FinOps, safety/guardrails', interviewer: 'Principal Engineer' },
      { round: 'Round 3: As-Appropriate (AA) Leadership & Culture', focus: 'Growth mindset, customer obsession, influencing without authority', interviewer: 'Partner Director / Practice Lead' },
    ],
    grillingQuestions: [
      {
        question: 'How do you prevent hallucinations and ensure groundedness in a multi-step agentic workflow?',
        toughAngle: 'Agents with tool use can wander off or execute dangerous API calls based on fabricated outputs. How do you architect safety gates?',
        rehearsedDefense:
          'I implement a 3-layer deterministic safety loop: First, Retrieval Grounding with semantic thresholding—the agent only executes tools if the retrieved context vector confidence exceeds a tuned similarity cutoff (e.g. 0.82 on cosine similarity). Second, Function Calling Validation with strict schema enforcement—all parameters returned by the LLM are validated against Pydantic models before triggering downstream APIs. Third, Eval & Guardrail Gates—we implement offline and online evaluators (deterministic assertions + LLM-as-judge scoring groundedness, relevance, and toxicity). If an agent attempts an irreversible action (e.g., executing a financial transaction or updating an external customer record), it triggers an asynchronous human-in-the-loop approval token.',
        keyMetrics: ['Cosine similarity cutoff >0.82', 'Pydantic strict schema validation', 'Deterministic assertion pass rate >98%'],
      },
    ],
    starStories: [
      {
        title: 'Interactive AI CV & Production Agentic RAG System',
        situation: 'Needed a live proof-of-work demonstration for technical recruiters showcasing modern production LLMOps rather than theoretical slides.',
        task: 'Build a production-grade agentic conversational system with full observability and evaluation.',
        action: 'Engineered first-person conversational agent with agentic RAG over Supabase pgvector, Vercel Edge streaming, Langfuse per-span cost attribution, and an automated evaluation suite combining deterministic unit tests and LLM-as-judge.',
        result: 'Live production deployment with sub-second response times, zero hallucination on career facts, and complete cost/token tracing in a private /ops dashboard.',
      },
    ],
    counterQuestions: [
      'In customer deployments with Azure AI Foundry and Copilot Studio, how are ISD delivery teams managing the balance between low-code Copilot Studio extensibility and pro-code Azure Functions orchestration when scaling to thousands of enterprise users?',
    ],
    defaultJd: `Microsoft Industry Solutions Delivery - GenAI / Agentic Solutions Delivery (Job # 200045333)
Responsibilities:
- Embed with customer stakeholders to translate ambiguous needs into requirements, solution hypotheses, and sprint deliverables for GenAI/agentic scenarios.
- Design and implement agentic and GenAI solutions on Microsoft platforms (Dynamics 365, M365 Copilots, Power Platform, Azure).
- Prototype rapidly, then harden to production: build POCs for agentic workflows (multi-step tasks, tool-use, orchestration), validate with users, and evolve to production-ready implementations.
- Own end-to-end delivery: define build/test specs, create eval and quality gates for GenAI outputs, produce runbooks for reliability, safety, and maintainability.
- Mitigate risks: prompt injection, hallucinations, privacy, compliance, latency, cost. Propose safeguards and fallback behaviors.`,
  },
  {
    id: 'microsoft-pm',
    name: 'Microsoft ISD (Consulting PM)',
    roleTitle: 'Consulting Project Management / Delivery Management',
    badge: 'Req 200046018',
    location: 'Hyderabad (3 days/wk)',
    experienceReq: '12+ Years Delivery / 5+ Yrs Enterprise Transformation',
    overview:
      'Manage complex multi-million dollar Cloud & AI customer engagements across the delivery lifecycle. Commercial governance, cloud consumption acceleration, P&L margins, steering committee leadership, and executive risk mitigation.',
    prakharAdvantage:
      'Runs the Chief of Staff and strategic operations office for a 20,000-person division at Capgemini, directly governing 9 strategic transformation programs across 38+ business leaders. Combines program economics with AI technical literacy.',
    loopStructure: [
      { round: 'Round 1: Delivery Governance & Commercials', focus: 'WBS, SOW change control, revenue forecasting, margin optimization', interviewer: 'Delivery Practice Director' },
      { round: 'Round 2: Stakeholder Escalation & Crisis Management', focus: 'Steering committee conflict, scope creep, partner coordination', interviewer: 'Senior Consulting Manager' },
      { round: 'Round 3: Cloud & AI Adoption Strategy', focus: 'Driving consumption, AI governance, Responsible AI', interviewer: 'General Manager' },
    ],
    grillingQuestions: [
      {
        question: 'A strategic customer is 3 months into an AI transformation engagement. Scope has ballooned, margins have slipped by 15%, and the customer sponsor is threatening to halt. How do you recover the engagement?',
        toughAngle: "Don't blame the customer or the sales team. How do you negotiate commercial recovery without damaging the Microsoft account relationship?",
        rehearsedDefense:
          'Recovery requires a 4-step stabilization playbook: First, immediate Delivery Audit—freeze unapproved scope expansion by re-baselining the WBS against the signed SOW, categorizing deliverables into Core Contracted vs Value-Add Scope. Second, Executive Pre-Wire—meet the customer sponsor 1-on-1 before the formal steering committee, acknowledging delivery friction and presenting a clear Tradeoff Menu: Option 1 (re-sequence high-consumption milestone to deliver immediate value within existing budget), Option 2 (formal Change Order for Phase 2 expanded capabilities). Third, Resource & Consumption Optimization—rebalance onshore/offshore ratios to recover delivery margins while working with Customer Success teams to unlock Azure consumption incentives. Fourth, Establish KANBAN + RAIDO cadence with joint bi-weekly milestone sign-offs. At Capgemini, I managed cross-account governance across dozens of enterprise clients, converting chaotic escalations into structured SLA scorecards that protected account profitability.',
        keyMetrics: ['Re-baselined WBS & SOW within 7 days', 'Recovered 15% margin slip via onshore/offshore rebalancing', 'Joint RAIDO cadence'],
      },
    ],
    starStories: [
      {
        title: 'PMO Control Tower Reframing & Division-Wide Governance',
        situation: 'Delivery governance across 38+ business leaders operated as a disjointed reporting unit, causing chronic delivery blindspots and margin slippage.',
        task: 'Re-architect delivery management into a predictive operational control tower.',
        action: 'Standardized KANBAN and RAIDO governance frameworks. Built unified operational dashboards combining utilization, sold vs fulfilled demand, and revenue forecasting. Re-engineered talent rotation workflows across accounts.',
        result: 'Reduced requirement-gathering cycle time by 80%, protected enterprise engagement margins, and orchestrated 637 seamless rotations.',
      },
    ],
    counterQuestions: [
      'In large ISD customer transformation accounts, how do Consulting PMs collaborate most effectively with Customer Success Managers (CSMs) to ensure delivered solutions translate directly into sustained Azure cloud consumption?',
    ],
    defaultJd: `Microsoft ISD - Consulting Project Management / Delivery Management (Job # 200046018)
Responsibilities:
- Drive customer obligations across delivery lifecycle: envisioning, solution development, delivery planning, cloud consumption, delivery management.
- Lead steering committee meetings with strategic customers to discuss progress toward delivery success.
- Accountable for project delivery forecast, revenue attainment, cost management, and margin health.
- Manage contracting, SOWs, WBS, change control, and partner resources.
- Manage risks and issues, qualitative probability/impact analyses, and customer satisfaction (CPE).
- AI technical fluency: engage technically on Azure AI, OpenAI, Copilots, and Data & Analytics at scale.`,
  },
  {
    id: 'google-gtech',
    name: 'Google gTech Ads Solutions',
    roleTitle: 'Strategy and Operations Lead',
    badge: 'gTech Solutions',
    location: 'Hyderabad, India',
    experienceReq: '4+ Years Consulting / BizOps / Strategy',
    overview:
      'Drive critical strategic priorities for gTech Ads teams. Facilitate cross-functional alignment of goals, provide business-critical insights using analytics, remove execution roadblocks, and act as strategic thought partner to executive leadership.',
    prakharAdvantage:
      'Promoted 3x at Capgemini to Senior Manager & Chief of Staff. Mastered structured executive problem-solving, KPI architecture (Account Matrix), and cross-functional orchestration across 38+ senior business leaders.',
    loopStructure: [
      { round: 'Round 1: General Cognitive Ability (GCA)', focus: 'Structured problem solving, market sizing, operational root-cause analysis', interviewer: 'Senior Strategy Lead' },
      { round: 'Round 2: Role-Related Knowledge (RRK)', focus: 'Ads operations strategy, sales alignment, process optimization, metric dashboards', interviewer: 'Operations Director' },
      { round: 'Round 3: Googleyness & Leadership', focus: 'Navigating ambiguity, bias to action, inclusive leadership, doing the right thing for users', interviewer: 'Director / VP' },
    ],
    grillingQuestions: [
      {
        question:
          'gTech Ads customer escalations have surged by 25% quarter-over-quarter, and account managers claim support is slowing down large deals. How do you diagnose and solve this?',
        toughAngle:
          "Don't give me a generic 'I'll look at the data' answer. What is your exact diagnostic taxonomy in the first 72 hours, and how do you prioritize fixes?",
        rehearsedDefense:
          'I structure this into 3 diagnostic vectors: Volume (Demand), Velocity (Throughput), and Value (Impact). First, Deconstruct the 25% Surge: Segment by ad surface (Performance Max vs YouTube vs Search) and advertiser tier (Tier 1 Global vs Long-tail SMB) to isolate whether this is a product release regression or operational bottleneck. Second, Velocity Analysis: Map the ticket lifecycle (Time to Triage, Time to Assign, Time to Engineering Resolution). At Capgemini, when our delivery division faced requirement delays, our KANBAN + RAIDO control tower exposed that 60% of idle time was caused by vague client input schemas. Third, Segment by Revenue Exposure: Prioritize fast-track workflows for top-ARR accounts while creating automated self-service resolution templates for recurring ticket patterns. Fourth, institute bi-weekly joint gTech-Sales Ops reviews with shared SLA scorecards to shift from adversarial finger-pointing to joint root-cause ownership.',
        keyMetrics: ['Volume / Velocity / Value taxonomy', '80% cycle-time reduction via standardized input schemas', 'Shared cross-functional SLA scorecard'],
      },
    ],
    starStories: [
      {
        title: 'Division-Wide KPI Framework & Operational Reporting Ecosystem',
        situation: 'Senior leadership lacked real-time visibility into operational health, with disparate teams reporting conflicting metrics across accounts.',
        task: 'Architect a unified business KPI architecture and reporting control tower.',
        action: 'Formulated the business unit KPI framework linking program execution to gross margins. Built Account Matrix 1.0/2.0 and Smart Insights reporting ecosystem to track utilization, demand-supply, and forecast accuracy in a single pane.',
        result: 'Eliminated manual reporting overhead across 38+ leaders, accelerated leadership decision cycles, and gave executives complete transparency across dozens of global client accounts.',
      },
    ],
    counterQuestions: [
      'As gTech Ads Solutions scales support for increasingly autonomous AI ad formats like Performance Max, how is the team evolving its balance between human operational consultation and automated algorithmic troubleshooting?',
    ],
    defaultJd: `Google - Strategy and Operations Lead, gTech Ads Solutions (Hyderabad)
Responsibilities:
- Define, structure, launch and drive strategic and operational initiatives for gTech Ads Solutions teams, while acting as a strategic thought partner to leadership.
- Work with cross-functional stakeholders and leaders to gather context, drive business analysis with effective project communication.
- Enable critical business decision making by working with cross-functional stakeholders and cross-pollinating learnings.
- Partner with gTech Ads Solutions leadership in end-to-end driving of strategic initiatives.
- Provide oversight and connectivity to business-focused standalone initiatives and remove roadblocks to execution.
Qualifications:
- Bachelor's degree (MBA preferred).
- 4+ years of experience in management consulting, sales operations, business strategy, or corporate advisory.`,
  },
  {
    id: 'onmobile-cos',
    name: 'OnMobile Global',
    roleTitle: 'Chief of Staff to CEO & CXO Office',
    badge: 'CEO Office',
    location: 'Bangalore (Hybrid)',
    experienceReq: '12-18+ Yrs in JD (Reframe to High-Velocity Operator)',
    overview:
      'Strategic extension of CEO & CXO Office for a listed mobile gaming & digital entertainment leader (Challenges Arena, ONMO, Gamize, Buzzmo) across 65+ countries. Drive business performance, tech & AI transformation, M&A due diligence, and cross-functional execution.',
    prakharAdvantage:
      'Rare hybrid: Currently Chief of Staff to EVP running a 20,000-person division at Capgemini. Bridges strategic KPI architecture, P&L levers, and hands-on AI engineering (built AAT, TalentX, and FinOps prompt routers).',
    loopStructure: [
      { round: 'Round 1: HR Screening (Completed & Audited)', focus: 'Role alignment, IC structure, CTC, notice period, culture', interviewer: 'HR Lead' },
      { round: 'Round 2: Head of HR / COO Round', focus: 'Organizational design, cross-functional leadership, transition plan', interviewer: 'Head of HR / COO' },
      { round: 'Round 3: CEO Comprehensive Evaluation', focus: 'CEO agenda acceleration, P&L diagnostic, gaming/AI growth, board presentations', interviewer: 'Chief Executive Officer' },
    ],
    grillingQuestions: [
      {
        question: 'The JD asks for 12-18 years of experience. You have ~6 years. Why should the CEO trust you as their strategic right hand?',
        toughAngle: 'Our division heads and senior SVPs have 20+ years in the industry. Why will they take direction or collaborate with someone with 6 years of experience?',
        rehearsedDefense:
          'I respect that tenure brings judgment. But in fast-moving digital entertainment and AI-native markets, execution velocity, structured rigor, and the ability to bridge technology with commercial execution matter far more than years on a resume. In my 6 years at Capgemini, I earned 3 accelerated promotions because I delivered outcomes that typically take decades: As Chief of Staff, I ran the strategic execution office of a 20,000-person division, governing 9 transformation programs across 38+ business leaders. Senior leaders respected my office because I brought objective data, eliminated operational friction, and gave them operating systems that helped them hit their numbers. Crucially, unlike traditional Chiefs of Staff who act as passive coordinators, I build the systems myself—designing KPI frameworks, building custom portals, and personally coding AI platforms that slashed cert failures and saved millions. For OnMobile CEO, I offer a tireless, technically fluent force multiplier who can analyze P&L performance in the morning, interrogate an AI/product architecture in the afternoon, and prepare board-ready decision papers by evening.',
        keyMetrics: ['3 promotions in 4 years', 'Chief of Staff for 20,000-person division', 'Governed 38+ leaders and 9 transformation programs'],
      },
      {
        question: 'The OnMobile Chief of Staff is a sole individual contributor (IC) with no team. How will you succeed without an army to delegate to?',
        toughAngle: 'At Capgemini you had 7 direct reports and 50+ indirects. Here you will be making your own slides, crunching your own Excel models, and chasing CXOs yourself.',
        rehearsedDefense:
          'That is exactly why I want this role. The best work of my career has been as an individual contributor builder. When I built AAT, I wrote the algorithm logic myself. When I built our prompt routing and token FinOps systems, I personally engineered the schemas. Having 7 directs at Capgemini was necessary due to the 20,000-person headcount, but managing layers of delegation slows down execution. In OnMobile, being an IC means zero administrative drag, direct intimacy with the data, and rapid turnaround for the CEO. I do not delegate problem-solving; I execute it directly.',
        keyMetrics: ['Hands-on builder: personally built AAT, TalentX, FinOps routers', 'Zero delegation overhead', 'Rapid CEO turnaround'],
      },
    ],
    starStories: [
      {
        title: 'Executive KPI Architecture & Leadership Governance',
        situation: 'Business unit leaders operated in departmental silos with conflicting metrics, causing margin leakage and lack of accountability across delivery leaders.',
        task: 'Formulate a unified business KPI architecture and governance rhythm for the Executive Vice President.',
        action: 'Formulated the division holistic KPI architecture, connecting operational execution (utilization, billability, project milestones) with top-line financial indicators. Instituted executive decision papers, board review dashboards, and structured steering committee reviews.',
        result: 'Provided executive leadership with complete cross-functional visibility, accelerated strategic decision cycles, and removed chronic delivery roadblocks across accounts.',
      },
    ],
    counterQuestions: [
      'In expanding ONMO and Challenges Arena globally, what is the single largest operational friction point between game development, telco partnership distribution, and user monetization?',
      'How is the CEO Office currently evaluating corporate development and M&A opportunities—are you prioritizing tuck-in gaming studios for IP, or distribution partnerships in emerging telecom markets?',
    ],
    rescuePlan: {
      issueSummary:
        'During the 32-minute HR screening call, 3 specific friction points triggered an automated or soft cancellation: (1) Quoting 65-70 LPA against current 29 LPA caused budget shock for an IC role; (2) Over-emphasizing 7 directs and 50+ indirects clashed with OnMobile pure IC structure; (3) Rigidly stating 90-day notice with near-zero buyout chance flagged high drop-off risk. Sending the high-conviction email below to Vishy and the HR Lead immediately dissolves all three concerns and re-opens the CEO round.',
      reframePoints: [
        {
          title: 'Embrace the IC Structure',
          explanation: 'Clarify that you are a hands-on builder who personally engineers AI tools and models P&L, and you thrive on zero-delegation agility.',
        },
        {
          title: 'Reframe Compensation Flexibly',
          explanation: 'Anchor within OnMobile internal band: 40-48 LPA (fixed + variable/performance-linked incentives) rather than the rigid 65-70L quote.',
        },
        {
          title: 'Provide Concrete Notice Period Solution',
          explanation: 'Commit to early release within 45-60 days with EVP and HRBP support, backed by already groomed successors.',
        },
      ],
      emailSubject: 'Following Up: Excitement for Chief of Staff Role & Next Steps — Prakhar Mishra',
      emailBody: `Dear HR Team and Vishy,

Thank you both for the insightful and engaging discussion regarding the Chief of Staff role at OnMobile. I truly enjoyed learning more about OnMobile's vision, product-centric culture, and high-growth initiatives like Challenges Arena and ONMO. My excitement for this opportunity has only deepened.

I wanted to proactively follow up on three specific discussion points from our conversation to share complete clarity:

1. Embracing the Individual Contributor (IC) Mandate:
I fully appreciate that the Chief of Staff at OnMobile is a high-impact individual contributor position directly supporting the CEO. While my current role at Capgemini oversees team structures due to the 20,000-person division scale, my greatest professional impact has always been as a hands-on builder—personally designing our BU's KPI frameworks, building custom talent platforms, and engineering AI architectures (AAT and TalentX). I thrive on direct execution without managerial drag, and I am energized by the prospect of rolling up my sleeves as a dedicated strategic operator for the CEO.

2. Compensation Flexibility & Alignment:
Regarding compensation, I want to clarify that my primary driver is joining a dynamic product company where I can create measurable enterprise value. I am completely flexible and committed to aligning with OnMobile's internal compensation bands for this role—specifically in the 40-48 LPA range (fixed + performance-linked variable), which fairly reflects both the role scope and my demonstrated business impact.

3. Structured Notice Period & Early Release (45-60 Days):
While my contractual notice period is 90 days, I have proactively groomed internal successors within my division. With the active support of my EVP and HRBP, I am confident in securing a smooth transition and early release within 45-60 days to meet OnMobile's immediate strategic priorities.

I remain deeply enthusiastic about the opportunity to serve as a tireless force multiplier for OnMobile's CEO and leadership team. I look forward to connecting with the Head of HR and the CEO next week.

Warm regards,
Prakhar Mishra
+91 62395 54160
linkedin.com/in/prakhar-mishra-b74b85124`,
    },
    defaultJd: `OnMobile Global - Chief of Staff to CEO & CXO Office (Bangalore / Hybrid)
Responsibilities:
- Strategic extension of CEO & CXO Office driving strategic agenda across business performance, tech & AI, commercial priorities, and corporate development.
- Partner with CEO/CXOs on strategic priorities, board/investor materials, and executive decision papers.
- Deep understanding of products (Challenges Arena, ONMO, Gamize), revenue, profitability, and operating metrics.
- Partner with global Tech & Product teams on digital transformation, AI/GenAI, and automation opportunities.
- Support M&A, investments, joint ventures, valuation, due diligence, and investor data rooms.
- Pure Individual Contributor role: shape decisions and drive execution without direct authority.`,
  },
]

export const RAPID_FIRE_QUESTIONS = [
  {
    category: 'Behavioral & Leadership',
    question: 'Tell me about a time you had to influence a senior leader who fundamentally disagreed with your recommendation.',
    hint: 'Use the Capgemini 637 talent rotations story: account managers resisted releasing top talent; introduced Account Health Scorecards aligning rotation health to executive bonuses.',
  },
  {
    category: 'AI Architecture & FinOps',
    question: 'How do you design a cost-efficient LLM routing system for enterprise applications?',
    hint: 'Mention 4-layer token observability, semantic caching, small-model classification (Qwen/Llama-70B) vs frontier reasoning (Claude/Nemotron), cutting tokens from 11.7k to 3k.',
  },
  {
    category: 'Executive Operations',
    question: 'How do you diagnose margin leakage across dozens of distributed client accounts?',
    hint: 'Walk through utilization hygiene, sold vs fulfilled demand forecasting, unbilled bench reduction, and standardized KANBAN + RAIDO governance.',
  },
  {
    category: 'Crisis & Conflict',
    question: 'A critical client deliverable is 2 weeks late, engineering blames vague specs, and the client threatens cancellation. What do you do in the next 4 hours?',
    hint: 'Freeze scope, triage blockers into RAIDO matrix, hold 1-on-1 discovery with client sponsor, re-baseline WBS, establish daily standup.',
  },
  {
    category: 'Product & AI Systems',
    question: 'How do you define confidence thresholds and fallback behavior in an AI-powered evaluation system?',
    hint: 'Reference TalentX and AAT: high-confidence (>0.85) automated rubric; medium (0.65-0.85) human-in-the-loop review; low (<0.65) deterministic fallback question.',
  },
]
