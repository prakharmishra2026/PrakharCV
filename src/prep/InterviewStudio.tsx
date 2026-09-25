import { useState, useEffect } from 'react'
import {
  Briefcase,
  Flame,
  FileText,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Send,
  Building2,
  ArrowRight,
  Clock,
} from 'lucide-react'
import {
  COMPANY_BATTLECARDS,
  RAPID_FIRE_QUESTIONS,
} from './prepData'

type TabType = 'battlecards' | 'griller' | 'rapidfire' | 'tailor'

interface GrillerHistoryItem {
  role: 'interviewer' | 'candidate'
  text: string
  scoreResult?: {
    overallScore: number
    verdict: string
    rubric: {
      starStructure: { score: number; comment: string }
      quantifiableImpact: { score: number; comment: string }
      strategicTradeoffs: { score: number; comment: string }
      executivePresence: { score: number; comment: string }
    }
    topStrength: string
    criticalVulnerability: string
    rewordedScript: string
  }
}

export default function InterviewStudio() {
  const [activeTab, setActiveTab] = useState<TabType>('battlecards')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('deloitte-ai')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Griller state
  const [grillerCompany, setGrillerCompany] = useState<string>('deloitte-ai')
  const [grillerRound, setGrillerRound] = useState<string>('AI Strategy Case')
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    COMPANY_BATTLECARDS[0].grillingQuestions[0].question
  )
  const [candidateResponse, setCandidateResponse] = useState<string>('')
  const [isGrilling, setIsGrilling] = useState<boolean>(false)
  const [grillerHistory, setGrillerHistory] = useState<GrillerHistoryItem[]>([])
  const [timerSeconds, setTimerSeconds] = useState<number>(0)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false)

  // Rapid fire state
  const [rapidFireIndex, setRapidFireIndex] = useState<number>(0)
  const [showRapidHint, setShowRapidHint] = useState<boolean>(false)

  // Tailor state
  const [tailorCompany, setTailorCompany] = useState<string>('Deloitte')
  const [tailorRole, setTailorRole] = useState<string>('Senior Consultant – AI Strategy')
  const [tailorJdText, setTailorJdText] = useState<string>(COMPANY_BATTLECARDS[0].defaultJd)
  const [isTailoring, setIsTailoring] = useState<boolean>(false)
  const [tailorResult, setTailorResult] = useState<any>(null)

  // Expandable state for battlecard questions
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(0)

  const activeCompany =
    COMPANY_BATTLECARDS.find((c) => c.id === selectedCompanyId) || COMPANY_BATTLECARDS[0]

  // Timer effect
  useEffect(() => {
    let interval: any = null
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000)
    } else if (!isTimerRunning && timerSeconds !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timerSeconds])

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  async function handleSendGrill(mode: 'grill' | 'score') {
    if (!candidateResponse.trim()) return

    setIsGrilling(true)
    const companyObj =
      COMPANY_BATTLECARDS.find((c) => c.id === grillerCompany) || COMPANY_BATTLECARDS[0]

    // Push candidate answer to history
    const updatedHistory: GrillerHistoryItem[] = [
      ...grillerHistory,
      { role: 'candidate', text: candidateResponse },
    ]
    setGrillerHistory(updatedHistory)
    const answerToEvaluate = candidateResponse
    setCandidateResponse('')
    setIsTimerRunning(false)

    try {
      const res = await fetch('/api/prep-grill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyObj.name,
          round: grillerRound,
          question: currentQuestion,
          candidateAnswer: answerToEvaluate,
          history: updatedHistory.slice(-4),
          mode,
        }),
      })

      const data = await res.json()
      if (mode === 'score') {
        setGrillerHistory((prev) => [
          ...prev,
          {
            role: 'interviewer',
            text: `Scorecard Generated for "${currentQuestion}"`,
            scoreResult: data,
          },
        ])
      } else {
        const probeText = data.probe || data.error || 'Challenge probe unavailable'
        setGrillerHistory((prev) => [
          ...prev,
          {
            role: 'interviewer',
            text: probeText,
          },
        ])
        setCurrentQuestion(probeText)
        setTimerSeconds(0)
        setIsTimerRunning(true)
      }
    } catch (err: any) {
      setGrillerHistory((prev) => [
        ...prev,
        {
          role: 'interviewer',
          text: `Error connecting to AI Bar Raiser: ${err.message}`,
        },
      ])
    } finally {
      setIsGrilling(false)
    }
  }

  async function handleRunTailor() {
    if (!tailorJdText.trim()) return
    setIsTailoring(true)
    try {
      const res = await fetch('/api/prep-tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jdText: tailorJdText,
          companyName: tailorCompany,
          roleTitle: tailorRole,
        }),
      })
      const data = await res.json()
      setTailorResult(data)
    } catch (err) {
      console.error('Tailor error:', err)
    } finally {
      setIsTailoring(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Studio Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Flame className="w-5 h-5 text-primary animate-pulse" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-foreground flex items-center gap-2">
                  Executive Interview Prep Studio
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono font-medium">
                    Live Simulator
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  AI Bar Raiser grilling · Pre-loaded Company Battlecards · Verified ATS CV Tailor
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 border border-border/80 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('battlecards')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'battlecards'
                  ? 'bg-card text-foreground shadow-sm border border-border font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Battle Cards
            </button>
            <button
              onClick={() => setActiveTab('griller')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'griller'
                  ? 'bg-card text-foreground shadow-sm border border-border font-semibold text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-primary" />
              Live Mock Room
            </button>
            <button
              onClick={() => setActiveTab('rapidfire')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'rapidfire'
                  ? 'bg-card text-foreground shadow-sm border border-border font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Rapid-Fire Drills
            </button>
            <button
              onClick={() => setActiveTab('tailor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'tailor'
                  ? 'bg-card text-foreground shadow-sm border border-border font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              1-Click CV Tailor
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ================= TAB 1: BATTLE CARDS ================= */}
        {activeTab === 'battlecards' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Company Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {COMPANY_BATTLECARDS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCompanyId(c.id)
                    setExpandedQuestionIdx(0)
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shrink-0 cursor-pointer ${
                    selectedCompanyId === c.id
                      ? 'bg-primary/10 border-primary text-primary shadow-sm'
                      : 'bg-card/70 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{c.name}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {c.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Target Role Hero Header */}
            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/15 text-primary border border-primary/25">
                      {activeCompany.badge}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {activeCompany.experienceReq}
                    </span>
                    <span className="text-xs text-muted-foreground">• {activeCompany.location}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    {activeCompany.name}
                  </h2>
                  <p className="text-base font-medium text-primary/90">{activeCompany.roleTitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                    {activeCompany.overview}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setGrillerCompany(activeCompany.id)
                      setGrillerRound(activeCompany.loopStructure[0].round)
                      setCurrentQuestion(activeCompany.grillingQuestions[0]?.question || '')
                      setActiveTab('griller')
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-md cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    Mock Grill This Role
                  </button>
                  <button
                    onClick={() => {
                      setTailorCompany(activeCompany.name)
                      setTailorRole(activeCompany.roleTitle)
                      setTailorJdText(activeCompany.defaultJd)
                      setActiveTab('tailor')
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-medium hover:border-primary/40 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Tailor CV for this JD
                  </button>
                </div>
              </div>

              {/* Prakhar Advantage Callout */}
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-400">Prakhar's Strategic Edge: </span>
                    <span className="text-muted-foreground">{activeCompany.prakharAdvantage}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Section: OnMobile Rescue Plan if viewing OnMobile */}
            {activeCompany.rescuePlan && (
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                      <AlertTriangle className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        HR Interview Forensic Audit & Reinstatement Protocol
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                          Action Required
                        </span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Diagnosed from your 32-minute HR screening audio recording
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(activeCompany.rescuePlan!.emailBody, 'onmobile-rescue-email')
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedKey === 'onmobile-rescue-email' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied Email!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Reinstatement Email
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-background/50 p-3 rounded-xl border border-amber-500/20">
                  {activeCompany.rescuePlan.issueSummary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {activeCompany.rescuePlan.reframePoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-card border border-border space-y-1.5"
                    >
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        {pt.title}
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{pt.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-4 rounded-xl bg-background border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                      Subject: {activeCompany.rescuePlan.emailSubject}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Send to Vishy & HR Lead immediately
                    </span>
                  </div>
                  <pre className="text-xs font-sans whitespace-pre-wrap text-foreground/80 leading-relaxed max-h-48 overflow-y-auto p-2 rounded bg-card/50">
                    {activeCompany.rescuePlan.emailBody}
                  </pre>
                </div>
              </div>
            )}

            {/* Loop Structure Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Official Interview Loop & Rounds
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeCompany.loopStructure.map((loop, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-card border border-border/80 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="text-xs font-mono text-primary font-semibold">
                        Round {idx + 1}
                      </div>
                      <h4 className="text-sm font-bold text-foreground mt-0.5">{loop.round}</h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {loop.focus}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>Interviewer:</span>
                      <span className="font-medium text-foreground">{loop.interviewer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anticipated Grilling Questions & Rehearsed Answers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Anticipated Grilling Questions & Rehearsed Defenses
                </h3>
                <span className="text-xs text-muted-foreground">Click question to inspect defense</span>
              </div>

              <div className="space-y-3">
                {activeCompany.grillingQuestions.map((gq, idx) => {
                  const isExpanded = expandedQuestionIdx === idx
                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-card border border-border overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-mono text-primary font-semibold">
                            Question {idx + 1}
                          </span>
                          <h4 className="text-sm sm:text-base font-semibold text-foreground">
                            {gq.question}
                          </h4>
                        </div>
                        <span className="p-1 rounded-md text-muted-foreground shrink-0 mt-1">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-border/60 bg-muted/10 animate-fadeIn">
                          {/* Tough Angle Probe */}
                          <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs sm:text-sm">
                            <span className="font-bold text-red-400">Tough Bar Raiser Probe: </span>
                            <span className="text-foreground/90">{gq.toughAngle}</span>
                          </div>

                          {/* Rehearsed Defense */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-primary uppercase font-mono">
                                Prakhar's Rehearsed Executive Defense:
                              </span>
                              <button
                                onClick={() => handleCopy(gq.rehearsedDefense, `gq-def-${idx}`)}
                                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                              >
                                {copiedKey === `gq-def-${idx}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" /> Copy Script
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-background/80 p-3.5 rounded-xl border border-border">
                              {gq.rehearsedDefense}
                            </p>
                          </div>

                          {/* Metrics anchors */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-xs text-muted-foreground font-mono">
                              Key Metrics to Speak:
                            </span>
                            {gq.keyMetrics.map((m, mIdx) => (
                              <span
                                key={mIdx}
                                className="text-xs px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-mono"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* STAR Stories Bank */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Dedicated STAR Stories Bank
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCompany.starStories.map((story, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-5 rounded-2xl bg-card border border-border space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          STAR Story #{sIdx + 1}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              `SITUATION: ${story.situation}\nTASK: ${story.task}\nACTION: ${story.action}\nRESULT: ${story.result}`,
                              `star-${sIdx}`
                            )
                          }
                          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `star-${sIdx}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <h4 className="text-base font-bold text-foreground">{story.title}</h4>
                      <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
                        <p>
                          <strong className="text-foreground">S:</strong> {story.situation}
                        </p>
                        <p>
                          <strong className="text-foreground">T:</strong> {story.task}
                        </p>
                        <p>
                          <strong className="text-foreground">A:</strong> {story.action}
                        </p>
                        <p className="text-emerald-400/90 font-medium">
                          <strong>R:</strong> {story.result}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Counter Questions */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Sharp Counter-Questions to Ask Leadership
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/90">
                {activeCompany.counterQuestions.map((cq, qIdx) => (
                  <li key={qIdx} className="flex items-start gap-2.5">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{cq}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ================= TAB 2: LIVE MOCK ROOM ================= */}
        {activeTab === 'griller' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            {/* Top Selector Card */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">
                    TARGET COMPANY
                  </label>
                  <select
                    value={grillerCompany}
                    onChange={(e) => {
                      setGrillerCompany(e.target.value)
                      const comp = COMPANY_BATTLECARDS.find((c) => c.id === e.target.value)
                      if (comp) {
                        setGrillerRound(comp.loopStructure[0].round)
                        setCurrentQuestion(comp.grillingQuestions[0]?.question || '')
                      }
                    }}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    {COMPANY_BATTLECARDS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">
                    INTERVIEW ROUND
                  </label>
                  <input
                    type="text"
                    value={grillerRound}
                    onChange={(e) => setGrillerRound(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Current Question Display */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-primary flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    ACTIVE INTERVIEW QUESTION:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-background/80 px-2 py-0.5 rounded text-foreground border border-border">
                      ⏱ {formatTime(timerSeconds)}
                    </span>
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="text-xs text-primary underline cursor-pointer"
                    >
                      {isTimerRunning ? 'Pause' : 'Start Timer'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent border-0 text-sm sm:text-base font-semibold text-foreground focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Conversation Stream & Scorecards */}
            <div className="space-y-4">
              {grillerHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    item.role === 'candidate'
                      ? 'bg-card border-border/80 ml-6'
                      : 'bg-primary/5 border-primary/20 mr-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                    <span className="font-bold flex items-center gap-1.5">
                      {item.role === 'candidate' ? (
                        <>👤 Prakhar (Candidate)</>
                      ) : (
                        <span className="text-primary flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" /> Tough Bar Raiser / Partner
                        </span>
                      )}
                    </span>
                  </div>

                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {item.text}
                  </p>

                  {/* If Scorecard Result */}
                  {item.scoreResult && (
                    <div className="mt-4 p-4 rounded-xl bg-card border border-border space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <span className="text-xs font-mono text-muted-foreground">OVERALL RATING</span>
                          <div className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
                            {item.scoreResult.overallScore}/100
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                                item.scoreResult.verdict === 'STRONG HIRE'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : item.scoreResult.verdict === 'LEAN HIRE'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {item.scoreResult.verdict}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4 Rubric Scores */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {item.scoreResult.rubric &&
                          Object.entries(item.scoreResult.rubric).map(([k, v]: any) => (
                            <div key={k} className="p-2.5 rounded-lg bg-background border border-border">
                              <span className="text-muted-foreground capitalize block truncate">
                                {k.replace(/([A-Z])/g, ' $1')}
                              </span>
                              <span className="text-sm font-bold text-primary">{v.score}/25</span>
                            </div>
                          ))}
                      </div>

                      <div className="space-y-2 text-xs">
                        <p>
                          <strong className="text-emerald-400">Top Strength:</strong>{' '}
                          {item.scoreResult.topStrength}
                        </p>
                        <p>
                          <strong className="text-red-400">Critical Vulnerability:</strong>{' '}
                          {item.scoreResult.criticalVulnerability}
                        </p>
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-1">
                          <span className="text-[11px] font-mono font-bold text-primary uppercase">
                            Executive Re-worded Script:
                          </span>
                          <p className="text-xs text-foreground/90 leading-relaxed italic">
                            "{item.scoreResult.rewordedScript}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Answer Input Box */}
            <div className="p-4 rounded-2xl bg-card border border-border shadow-md space-y-3">
              <label className="text-xs font-mono text-muted-foreground flex items-center justify-between">
                <span>YOUR RESPONSE (STAR FORMAT)</span>
                <span>Speak or type as Prakhar</span>
              </label>
              <textarea
                value={candidateResponse}
                onChange={(e) => {
                  setCandidateResponse(e.target.value)
                  if (!isTimerRunning && e.target.value.length === 1) {
                    setIsTimerRunning(true)
                  }
                }}
                rows={4}
                placeholder="Structure with: Situation -> Task -> Action (tools, governance) -> Result (metrics)..."
                className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary resize-y"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCandidateResponse('')
                      setTimerSeconds(0)
                      setIsTimerRunning(false)
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={isGrilling || !candidateResponse.trim()}
                    onClick={() => handleSendGrill('grill')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:border-primary/50 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    Pressure Probe (Grill)
                  </button>
                  <button
                    disabled={isGrilling || !candidateResponse.trim()}
                    onClick={() => handleSendGrill('score')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50 shadow cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Score My Answer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: RAPID-FIRE DRILLS ================= */}
        {activeTab === 'rapidfire' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Rapid-Fire Conditioning
              </span>
              <h2 className="text-2xl font-display font-bold text-foreground">
                Executive Flash Drills
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Drill through unpredictable scenarios. Deliver crisp 45-60 second answers.
              </p>
            </div>

            {/* Drill Card */}
            <div className="p-8 rounded-2xl bg-card border border-border shadow-lg space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="px-2.5 py-1 rounded bg-muted text-foreground font-semibold">
                  {RAPID_FIRE_QUESTIONS[rapidFireIndex].category}
                </span>
                <span>
                  Question {rapidFireIndex + 1} of {RAPID_FIRE_QUESTIONS.length}
                </span>
              </div>

              <div className="text-lg sm:text-xl font-display font-semibold text-foreground leading-relaxed">
                "{RAPID_FIRE_QUESTIONS[rapidFireIndex].question}"
              </div>

              {showRapidHint ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed animate-fadeIn">
                  <strong>Prakhar's Defense Cue: </strong>
                  {RAPID_FIRE_QUESTIONS[rapidFireIndex].hint}
                </div>
              ) : (
                <button
                  onClick={() => setShowRapidHint(true)}
                  className="text-xs text-muted-foreground hover:text-amber-400 underline cursor-pointer"
                >
                  Need a hint / metric anchor?
                </button>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/80">
                <button
                  onClick={() => {
                    setShowRapidHint(false)
                    setRapidFireIndex((idx) =>
                      idx > 0 ? idx - 1 : RAPID_FIRE_QUESTIONS.length - 1
                    )
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Previous
                </button>

                <button
                  onClick={() => {
                    setShowRapidHint(false)
                    setRapidFireIndex((idx) =>
                      idx < RAPID_FIRE_QUESTIONS.length - 1 ? idx + 1 : 0
                    )
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Next Drill
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: 1-CLICK CV TAILOR ================= */}
        {activeTab === 'tailor' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            {/* Header info */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                Automated ATS Resume Tailoring Engine
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Strict claim traceability to verified Master Profile facts · Zero hallucination
              </p>
            </div>

            {/* Input Form */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">
                    TARGET COMPANY
                  </label>
                  <input
                    type="text"
                    value={tailorCompany}
                    onChange={(e) => setTailorCompany(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">
                    TARGET ROLE TITLE
                  </label>
                  <input
                    type="text"
                    value={tailorRole}
                    onChange={(e) => setTailorRole(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">
                  JOB DESCRIPTION (PASTE RAW JD)
                </label>
                <textarea
                  value={tailorJdText}
                  onChange={(e) => setTailorJdText(e.target.value)}
                  rows={6}
                  placeholder="Paste complete job description text here..."
                  className="w-full bg-background border border-border rounded-xl p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Grounded against: <code className="text-primary">master_profile.json</code> (Capgemini C&CA Senior Manager)
                </span>
                <button
                  disabled={isTailoring || !tailorJdText.trim()}
                  onClick={handleRunTailor}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all disabled:opacity-50 shadow cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {isTailoring ? 'Analyzing ATS Alignment...' : 'Generate Tailored Resume & Pitch'}
                </button>
              </div>
            </div>

            {/* Tailor Output Results */}
            {tailorResult && (
              <div className="space-y-6 animate-fadeIn">
                {/* Score & Summary Card */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <span className="text-xs font-mono text-muted-foreground">ATS MATCH RATING</span>
                      <div className="text-3xl font-display font-bold text-emerald-400 flex items-center gap-2">
                        {tailorResult.atsMatchScore}%
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-medium">
                          High Fit
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                      {tailorResult.matchRationale}
                    </p>
                  </div>

                  {/* Keywords Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        MATCHING KEYWORDS:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tailorResult.matchingKeywords?.map((kw: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        UNDEREMPHASIZED KEYWORDS TO INSERT:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tailorResult.missingKeywords?.map((kw: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tailored Executive Summary */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold font-mono text-primary uppercase">
                      Tailored Executive Resume Summary
                    </h3>
                    <button
                      onClick={() => handleCopy(tailorResult.tailoredSummary, 'tailor-summary')}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'tailor-summary' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Summary
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-background/50 p-4 rounded-xl border border-border">
                    {tailorResult.tailoredSummary}
                  </p>
                </div>

                {/* Tailored Bullets */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold font-mono text-primary uppercase">
                      Tailored Verified Bullet Points (Anti-Hallucination)
                    </h3>
                    <button
                      onClick={() => {
                        const allBullets = tailorResult.tailoredBulletPoints
                          ?.map((b: any) => `• ${b.bullet}`)
                          .join('\n')
                        handleCopy(allBullets, 'all-bullets')
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'all-bullets' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied All
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy All Bullets
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3 pt-2">
                    {tailorResult.tailoredBulletPoints?.map((bp: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-background border border-border space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="font-mono text-primary font-semibold">
                            {bp.category || `Bullet ${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-muted-foreground/80 italic truncate max-w-xs">
                            Source: {bp.sourceFact}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/95 leading-relaxed font-sans">
                          • {bp.bullet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 60-Second Elevator Pitch */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold font-mono text-emerald-400 uppercase">
                      60-Second Spoken Elevator Pitch ('Tell Me About Yourself')
                    </h3>
                    <button
                      onClick={() => handleCopy(tailorResult.interviewElevatorPitch, 'pitch')}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'pitch' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Pitch
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-background/50 p-4 rounded-xl border border-border italic">
                    "{tailorResult.interviewElevatorPitch}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
