import { useState, useEffect, useRef } from 'react'
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
  Play,
  Pause,
  Award,
  BookOpen,
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
  const [tailorCompany, setTailorCompany] = useState<string>('Deloitte S&T')
  const [tailorRole, setTailorRole] = useState<string>('Senior Consultant – AI Strategy')
  const [tailorJdText, setTailorJdText] = useState<string>(COMPANY_BATTLECARDS[0].defaultJd)
  const [isTailoring, setIsTailoring] = useState<boolean>(false)
  const [tailorResult, setTailorResult] = useState<any>(null)

  // Expandable question state
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const activeCompany =
    COMPANY_BATTLECARDS.find((c) => c.id === selectedCompanyId) || COMPANY_BATTLECARDS[0]

  // Stopwatch timer
  useEffect(() => {
    let interval: any = null
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Keyboard shortcut: Cmd+Enter or Ctrl+Enter to submit grill
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (activeTab === 'griller' && candidateResponse.trim() && !isGrilling) {
          e.preventDefault()
          handleSendGrill('score')
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, candidateResponse, isGrilling])

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2400)
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
            text: `Executive Evaluation & Scorecard Generated for "${currentQuestion}"`,
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

  function fillSampleAnswer() {
    const comp = COMPANY_BATTLECARDS.find((c) => c.id === grillerCompany)
    if (comp && comp.grillingQuestions[0]) {
      setCandidateResponse(comp.grillingQuestions[0].rehearsedDefense)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
      {/* Ambient Top Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-44 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent blur-3xl -z-10" />

      {/* Studio Header (Apple-inspired translucent topbar) */}
      <header className="relative md:sticky md:top-14 z-30 border-b border-border/80 bg-background/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
          {/* Brand & Context */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 text-white font-bold shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-display font-bold tracking-tight text-foreground">
                  Executive Prep Studio
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Bar Raiser Mode
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate max-w-xs sm:max-w-none">
                Deloitte · Microsoft · Google · OnMobile
              </p>
            </div>
          </div>

          {/* Segmented Control Navigation (Desktop only; mobile uses dedicated bottom dock) */}
          <nav
            aria-label="Studio Mode"
            className="hidden md:flex items-center p-1 bg-muted/60 dark:bg-card/70 border border-border/80 rounded-2xl shadow-inner overflow-x-auto scrollbar-none"
          >
            {[
              { id: 'battlecards', label: 'Battle Cards', icon: Briefcase },
              { id: 'griller', label: 'Mock Room', icon: Flame },
              { id: 'rapidfire', label: 'Rapid Drills', icon: Zap },
              { id: 'tailor', label: 'CV Tailor', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 ease-out shrink-0 cursor-pointer active:scale-[0.97] ${
                    isActive
                      ? 'bg-card dark:bg-foreground/10 text-foreground shadow-sm border border-border/80'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-28 md:pb-12">
        {/* ========================================================================= */}
        {/* TAB 1: BATTLE CARDS                                                       */}
        {/* ========================================================================= */}
        {activeTab === 'battlecards' && (
          <div className="space-y-6">
            {/* Horizontal Company Switcher (Tactile pills with smooth mobile swipe) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
              {COMPANY_BATTLECARDS.map((c) => {
                const isSelected = selectedCompanyId === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCompanyId(c.id)
                      setExpandedQuestionIdx(0)
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border text-xs sm:text-sm font-semibold tracking-tight transition-all duration-150 shrink-0 cursor-pointer active:scale-[0.97] snap-start min-h-[44px] ${
                      isSelected
                        ? 'bg-card text-foreground border-primary shadow-md shadow-primary/10 ring-1 ring-primary/30'
                        : 'bg-card/40 text-muted-foreground border-border/70 hover:border-primary/40 hover:text-foreground hover:bg-card/70'
                    }`}
                  >
                    <Building2 className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span>{c.name}</span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-primary/15 text-primary border border-primary/25'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {c.badge}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Target Role Hero Banner (Apple frosted glass) */}
            <section className="relative overflow-hidden rounded-3xl bg-card/75 backdrop-blur-xl border border-border shadow-xl p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-primary/15 text-primary border border-primary/25">
                      {activeCompany.badge}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {activeCompany.experienceReq}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{activeCompany.location}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
                    {activeCompany.roleTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {activeCompany.overview}
                  </p>

                  {/* Strategic Edge Callout */}
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/25">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm">
                        <strong className="text-emerald-400 font-semibold">Prakhar's Strategic Edge: </strong>
                        <span className="text-foreground/90">{activeCompany.prakharAdvantage}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto min-w-[200px]">
                  <button
                    onClick={() => {
                      setGrillerCompany(activeCompany.id)
                      setGrillerRound(activeCompany.loopStructure[0].round)
                      setCurrentQuestion(activeCompany.grillingQuestions[0]?.question || '')
                      setActiveTab('griller')
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
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
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-2xl bg-card border border-border text-foreground text-xs font-semibold hover:border-primary/40 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    Tailor CV for this JD
                  </button>
                </div>
              </div>
            </section>

            {/* Special Section: OnMobile Rescue Center (If Viewing OnMobile) */}
            {activeCompany.rescuePlan && (
              <section className="rounded-3xl bg-amber-500/10 border border-amber-500/30 p-5 sm:p-7 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-display font-bold text-foreground flex items-center gap-2">
                        HR Interview Forensic Audit & Reinstatement Protocol
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 font-bold">
                          Diagnosed from Audio
                        </span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Extracted from your 32-minute HR screening call · Vishy remains single point of contact
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleCopy(activeCompany.rescuePlan!.emailBody, 'onmobile-rescue-email')
                    }
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 active:scale-[0.98] transition-all shrink-0 shadow cursor-pointer"
                  >
                    {copiedKey === 'onmobile-rescue-email' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Reinstatement Email
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-foreground/90 bg-background/60 p-4 rounded-2xl border border-amber-500/20 leading-relaxed">
                  {activeCompany.rescuePlan.issueSummary}
                </p>

                {/* 3 Pillars of Reframe */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activeCompany.rescuePlan.reframePoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-card/80 border border-border/80 space-y-1.5"
                    >
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                        {pt.title}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{pt.explanation}</p>
                    </div>
                  ))}
                </div>

                {/* Email Preview */}
                <div className="rounded-2xl bg-background border border-border/90 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span>SUBJECT: {activeCompany.rescuePlan.emailSubject}</span>
                    <span className="text-[11px] text-amber-400 font-semibold">Ready to Send</span>
                  </div>
                  <pre className="text-xs font-sans whitespace-pre-wrap text-foreground/80 leading-relaxed max-h-48 overflow-y-auto p-3 rounded-xl bg-card/60">
                    {activeCompany.rescuePlan.emailBody}
                  </pre>
                </div>
              </section>
            )}

            {/* Loop Map Grid */}
            <section className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Official Interview Pipeline & Rounds
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {activeCompany.loopStructure.map((loop, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="text-[11px] font-mono text-primary font-bold">
                        ROUND 0{idx + 1}
                      </div>
                      <h4 className="text-sm font-bold text-foreground mt-0.5">{loop.round}</h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {loop.focus}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-between font-mono">
                      <span>Interviewer</span>
                      <span className="text-foreground font-semibold">{loop.interviewer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Anticipated Grilling Questions & Rehearsed Defenses */}
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Anticipated Grilling Questions & Rehearsed Defenses
                </h3>
                <span className="text-xs text-muted-foreground">Click to inspect breakdown</span>
              </div>

              <div className="space-y-3">
                {activeCompany.grillingQuestions.map((gq, idx) => {
                  const isExpanded = expandedQuestionIdx === idx
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                        className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-muted/20 active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <div className="space-y-1">
                          <span className="text-[11px] font-mono text-primary font-bold">
                            PRESSURE SCENARIO 0{idx + 1}
                          </span>
                          <h4 className="text-sm sm:text-base font-semibold text-foreground">
                            {gq.question}
                          </h4>
                        </div>
                        <div className="p-1 rounded-lg bg-muted text-muted-foreground shrink-0 mt-0.5">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-5 pt-0 space-y-4 border-t border-border/60 bg-muted/10">
                          {/* Tough Bar Raiser Angle */}
                          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm">
                            <span className="font-bold text-red-400">Tough Bar Raiser Probe: </span>
                            <span className="text-foreground/90">{gq.toughAngle}</span>
                          </div>

                          {/* Rehearsed Defense Script */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-primary uppercase">
                                Prakhar's Rehearsed Executive Defense
                              </span>
                              <button
                                onClick={() => handleCopy(gq.rehearsedDefense, `gq-def-${idx}`)}
                                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                              >
                                {copiedKey === `gq-def-${idx}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy Script
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-background/80 p-4 rounded-2xl border border-border">
                              {gq.rehearsedDefense}
                            </p>
                          </div>

                          {/* Metrics to Hit */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-xs text-muted-foreground font-mono">
                              Mandatory Metric Anchors:
                            </span>
                            {gq.keyMetrics.map((m, mIdx) => (
                              <span
                                key={mIdx}
                                className="text-xs px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono font-medium"
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
            </section>

            {/* STAR Stories Bank */}
            <section className="space-y-3.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Verified STAR Story Bank
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCompany.starStories.map((story, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          STAR STORY #{sIdx + 1}
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
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <h4 className="text-base font-bold text-foreground">{story.title}</h4>

                      <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed pt-1">
                        <p>
                          <strong className="text-foreground font-semibold">S:</strong> {story.situation}
                        </p>
                        <p>
                          <strong className="text-foreground font-semibold">T:</strong> {story.task}
                        </p>
                        <p>
                          <strong className="text-foreground font-semibold">A:</strong> {story.action}
                        </p>
                        <p className="text-emerald-400/90 font-medium pt-1">
                          <strong>R:</strong> {story.result}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Counter Questions to Ask Leadership */}
            <section className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Executive Counter-Questions to Ask the Interviewer
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/90">
                {activeCompany.counterQuestions.map((cq, qIdx) => (
                  <li key={qIdx} className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{cq}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE MOCK ROOM                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'griller' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Config Card */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-muted-foreground block mb-1.5">
                    SELECT TARGET ROLE
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
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-medium"
                  >
                    {COMPANY_BATTLECARDS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-muted-foreground block mb-1.5">
                    ROUND FOCUS
                  </label>
                  <input
                    type="text"
                    value={grillerRound}
                    onChange={(e) => setGrillerRound(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>

              {/* Active Question Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-primary" />
                    ACTIVE INTERVIEW QUESTION
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-3 py-1 rounded-lg bg-background/80 text-foreground border border-border font-bold">
                      ⏱ {formatTime(timerSeconds)}
                    </span>
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="w-3 h-3" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" /> Start
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <textarea
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent border-0 text-sm sm:text-base font-bold text-foreground focus:outline-none resize-none pt-1"
                />
              </div>
            </div>

            {/* Conversation Log & Evaluation Cards */}
            <div className="space-y-4">
              {grillerHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl border transition-all duration-200 ${
                    item.role === 'candidate'
                      ? 'bg-card border-border ml-4 sm:ml-8'
                      : 'bg-primary/5 border-primary/25 mr-4 sm:mr-8 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                    <span className="font-bold flex items-center gap-2">
                      {item.role === 'candidate' ? (
                        <span className="text-foreground">👤 Prakhar (Your Response)</span>
                      ) : (
                        <span className="text-primary flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-primary" /> Tough Bar Raiser / Partner
                        </span>
                      )}
                    </span>
                  </div>

                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {item.text}
                  </p>

                  {/* Rubric Scorecard */}
                  {item.scoreResult && (
                    <div className="mt-5 p-5 rounded-2xl bg-card border border-border shadow-md space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                        <div>
                          <span className="text-xs font-mono text-muted-foreground">OVERALL EVALUATION SCORE</span>
                          <div className="text-3xl font-display font-bold text-foreground flex items-center gap-3 mt-0.5">
                            {item.scoreResult.overallScore}/100
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-mono font-bold ${
                                item.scoreResult.verdict === 'STRONG HIRE'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : item.scoreResult.verdict === 'LEAN HIRE'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {item.scoreResult.verdict}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4 Dimension Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        {item.scoreResult.rubric &&
                          Object.entries(item.scoreResult.rubric).map(([k, v]: any) => (
                            <div key={k} className="p-3 rounded-xl bg-background border border-border/90">
                              <span className="text-muted-foreground capitalize block truncate font-medium">
                                {k.replace(/([A-Z])/g, ' $1')}
                              </span>
                              <div className="text-base font-bold text-primary mt-1">{v.score}/25</div>
                            </div>
                          ))}
                      </div>

                      {/* Strengths & Vulnerabilities */}
                      <div className="space-y-2.5 text-xs sm:text-sm">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <strong className="text-emerald-400">Top Resonating Strength: </strong>
                          <span className="text-foreground/90">{item.scoreResult.topStrength}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <strong className="text-red-400">Critical Vulnerability Exposed: </strong>
                          <span className="text-foreground/90">{item.scoreResult.criticalVulnerability}</span>
                        </div>

                        {/* Rewritten Executive Script */}
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-primary uppercase">
                              Executive Re-worded Script:
                            </span>
                            <button
                              onClick={() => handleCopy(item.scoreResult!.rewordedScript, 'reworded-script')}
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === 'reworded-script' ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy Script
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm text-foreground/95 leading-relaxed italic bg-background/50 p-3 rounded-lg border border-border">
                            "{item.scoreResult.rewordedScript}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Response Input Panel */}
            <div className="p-5 rounded-3xl bg-card border border-border shadow-xl space-y-3.5">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="font-bold">YOUR RESPONSE (STAR FRAMEWORK)</span>
                <span className="hidden sm:inline">Shortcut: ⌘ + Enter to Score</span>
              </div>

              <textarea
                ref={textareaRef}
                value={candidateResponse}
                onChange={(e) => {
                  setCandidateResponse(e.target.value)
                  if (!isTimerRunning && e.target.value.length === 1) {
                    setIsTimerRunning(true)
                  }
                }}
                rows={5}
                placeholder="Deliver your structured response: Situation -> Task -> Action (tools, governance) -> Result (metrics)..."
                className="w-full bg-background border border-border rounded-2xl p-4 text-sm text-foreground focus:outline-none focus:border-primary resize-y leading-relaxed font-sans"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={fillSampleAnswer}
                    className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-muted/60 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Fill Verified STAR Sample
                  </button>
                  <button
                    onClick={() => {
                      setCandidateResponse('')
                      setTimerSeconds(0)
                      setIsTimerRunning(false)
                    }}
                    className="p-2 min-h-[38px] rounded-xl text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    disabled={isGrilling || !candidateResponse.trim()}
                    onClick={() => handleSendGrill('grill')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-card border border-border text-foreground text-xs font-bold hover:border-primary/50 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Flame className="w-4 h-4 text-red-400" />
                    Pressure Probe (Grill)
                  </button>
                  <button
                    disabled={isGrilling || !candidateResponse.trim()}
                    onClick={() => handleSendGrill('score')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-primary/20 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Score My Answer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RAPID-FIRE DRILLS                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'rapidfire' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Cognitive Conditioning
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                Rapid-Fire Executive Drills
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Practice crisp 60-second spontaneous executive framing under pressure.
              </p>
            </div>

            {/* Flashcard Component */}
            <div className="p-8 sm:p-10 rounded-3xl bg-card/80 backdrop-blur-xl border border-border shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold">
                  {RAPID_FIRE_QUESTIONS[rapidFireIndex].category}
                </span>
                <span>
                  Drill {rapidFireIndex + 1} of {RAPID_FIRE_QUESTIONS.length}
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-display font-bold text-foreground leading-relaxed">
                "{RAPID_FIRE_QUESTIONS[rapidFireIndex].question}"
              </div>

              {showRapidHint ? (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-200 leading-relaxed animate-fadeIn">
                  <strong className="text-amber-400 font-semibold">Prakhar's Metric Anchor Cue: </strong>
                  {RAPID_FIRE_QUESTIONS[rapidFireIndex].hint}
                </div>
              ) : (
                <button
                  onClick={() => setShowRapidHint(true)}
                  className="text-xs font-medium text-muted-foreground hover:text-amber-400 underline cursor-pointer"
                >
                  Need a metric anchor or STAR hint?
                </button>
              )}

              <div className="flex items-center justify-between gap-3 pt-6 border-t border-border/80">
                <button
                  onClick={() => {
                    setShowRapidHint(false)
                    setRapidFireIndex((idx) =>
                      idx > 0 ? idx - 1 : RAPID_FIRE_QUESTIONS.length - 1
                    )
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.97] transition-all"
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
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 active:scale-[0.97] transition-all cursor-pointer shadow"
                >
                  Next Drill
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: 1-CLICK CV TAILOR                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'tailor' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                Automated ATS Resume Tailor
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Generates tailored resume bullets and elevator pitch strictly verified against your Master Profile.
              </p>
            </div>

            {/* Input Form Card */}
            <div className="p-5 sm:p-7 rounded-3xl bg-card border border-border shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-muted-foreground block mb-1.5">
                    TARGET COMPANY
                  </label>
                  <input
                    type="text"
                    value={tailorCompany}
                    onChange={(e) => setTailorCompany(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-medium min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-muted-foreground block mb-1.5">
                    ROLE TITLE
                  </label>
                  <input
                    type="text"
                    value={tailorRole}
                    onChange={(e) => setTailorRole(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-medium min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-muted-foreground block mb-1.5">
                  JOB DESCRIPTION (RAW TEXT)
                </label>
                <textarea
                  value={tailorJdText}
                  onChange={(e) => setTailorJdText(e.target.value)}
                  rows={6}
                  placeholder="Paste complete job description text..."
                  className="w-full bg-background border border-border rounded-xl p-3.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-mono leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <span className="text-xs text-muted-foreground">
                  Grounded strictly in: <code className="text-primary font-mono">master_profile.json</code> (Zero Hallucination)
                </span>
                <button
                  disabled={isTailoring || !tailorJdText.trim()}
                  onClick={handleRunTailor}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-primary/20 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {isTailoring ? 'Analyzing ATS Match...' : 'Generate Tailored Resume & Pitch'}
                </button>
              </div>
            </div>

            {/* Results Display */}
            {tailorResult && (
              <div className="space-y-6">
                {/* Score & Rationale */}
                <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
                    <div>
                      <span className="text-xs font-mono text-muted-foreground">ATS FIT ESTIMATE</span>
                      <div className="text-3xl font-display font-bold text-emerald-400 flex items-center gap-3 mt-1">
                        {tailorResult.atsMatchScore}%
                        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-semibold border border-emerald-500/25">
                          High Strategic Match
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                      {tailorResult.matchRationale}
                    </p>
                  </div>

                  {/* Keywords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> MATCHED ATS KEYWORDS:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tailorResult.matchingKeywords?.map((kw: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> MISSING / UNDEREMPHASIZED KEYWORDS:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tailorResult.missingKeywords?.map((kw: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold text-primary uppercase">
                      Tailored Executive Summary
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
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-background/60 p-4 rounded-2xl border border-border">
                    {tailorResult.tailoredSummary}
                  </p>
                </div>

                {/* Tailored Bullets */}
                <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold text-primary uppercase">
                      Tailored Verified Resume Bullets
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

                  <div className="space-y-3 pt-1">
                    {tailorResult.tailoredBulletPoints?.map((bp: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-background border border-border/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                          <span className="text-primary font-bold">{bp.category || `Bullet 0${idx + 1}`}</span>
                          <span className="text-[10px] text-muted-foreground italic truncate max-w-xs">
                            Source: {bp.sourceFact}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/95 leading-relaxed">
                          • {bp.bullet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 60-Second Elevator Pitch */}
                <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-2">
                      <Award className="w-4 h-4" /> 60-Second Spoken Elevator Pitch ('Tell Me About Yourself')
                    </h3>
                    <button
                      onClick={() => handleCopy(tailorResult.interviewElevatorPitch, 'pitch')}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'pitch' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Pitch
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Pitch
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-background/60 p-4 rounded-2xl border border-border italic">
                    "{tailorResult.interviewElevatorPitch}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Dock (Apple-style Tactile Tab Bar) */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-40">
        <div className="bg-card/90 dark:bg-card/95 backdrop-blur-2xl border border-border/90 rounded-2xl shadow-2xl p-1.5 flex items-center justify-around ring-1 ring-black/10">
          {[
            { id: 'battlecards', label: 'Battlecards', icon: Briefcase },
            { id: 'griller', label: 'Mock Room', icon: Flame },
            { id: 'rapidfire', label: 'Drills', icon: Zap },
            { id: 'tailor', label: 'CV Tailor', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
                  isActive
                    ? 'text-primary font-bold bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-[10px] leading-tight tracking-tight">{tab.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
