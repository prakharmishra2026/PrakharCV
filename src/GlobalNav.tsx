import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, House, ChevronRight, Flame, Lock, X, KeyRound } from 'lucide-react'
import { getPageTitles } from './articles/registry'
import { useAdminAuth } from './prep/useAdminAuth'

const PAGE_TITLE = getPageTitles()

function useLang() {
  const { pathname } = useLocation()
  const isHome = pathname === '/' || pathname === '/en'
  const pageTitle = PAGE_TITLE[pathname] ?? null
  return { pathname, isHome, pageTitle }
}

function useTheme() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  useEffect(() => {
    if (localStorage.getItem('theme')) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
      document.documentElement.classList.toggle('dark', e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return { isDark, toggleTheme }
}

/** Controls: Segmented Portfolio/Prep Switcher (Admin only) + Theme button */
function NavControls({
  isDark,
  toggleTheme,
  isAdmin,
  onLock,
}: {
  isDark: boolean
  toggleTheme: () => void
  isAdmin: boolean
  onLock: () => void
}) {
  const { pathname } = useLocation()
  const isPrep = pathname.startsWith('/prep') || pathname.startsWith('/cockpit')

  return (
    <div className="flex items-center gap-2">
      {/* Universal Mode Switcher (Visible ONLY to Admin) */}
      {isAdmin && (
        <div
          role="tablist"
          aria-label="Navigation Mode"
          className="flex items-center p-1 bg-muted/80 dark:bg-card/90 backdrop-blur-xl border border-border/80 rounded-full shadow-sm animate-fadeIn"
        >
          <Link
            to="/"
            role="tab"
            aria-selected={!isPrep}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-150 active:scale-95 cursor-pointer ${
              !isPrep
                ? 'bg-background text-foreground shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Switch to Portfolio"
          >
            <House className="w-3.5 h-3.5 shrink-0" />
            <span className="inline">Portfolio</span>
          </Link>
          <Link
            to="/prep"
            role="tab"
            aria-selected={isPrep}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-150 active:scale-95 cursor-pointer ${
              isPrep
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Switch to Prep Studio"
          >
            <Flame className={`w-3.5 h-3.5 shrink-0 ${isPrep ? 'text-white' : 'text-primary'}`} />
            <span className="inline">Prep Studio</span>
            {!isPrep && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            )}
          </Link>
        </div>
      )}

      {/* Lock Studio button (Admin only) */}
      {isAdmin && (
        <button
          onClick={onLock}
          title="Lock Executive Studio (Switch to Public View)"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-card/85 dark:bg-card/90 backdrop-blur-xl border border-border/80 flex items-center justify-center shadow-sm hover:border-amber-500/50 text-muted-foreground hover:text-amber-400 transition-all active:scale-95 shrink-0 cursor-pointer"
          aria-label="Lock Studio"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-card/85 dark:bg-card/90 backdrop-blur-xl border border-border/80 flex items-center justify-center shadow-sm hover:border-primary/50 transition-all active:scale-95 shrink-0 cursor-pointer"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
      </button>
    </div>
  )
}

export default function GlobalNav() {
  const { pathname, isHome, pageTitle } = useLang()
  const { isDark, toggleTheme } = useTheme()
  const { isAdmin, unlock, lock } = useAdminAuth()
  const isPrep = pathname.startsWith('/prep') || pathname.startsWith('/cockpit')

  const [hydrated, setHydrated] = useState(false)
  const [showPasscodeModal, setShowPasscodeModal] = useState(false)
  const [passcodeInput, setPasscodeInput] = useState('')
  const [passcodeError, setPasscodeError] = useState(false)

  // Triple-click detection on avatar for discreet admin unlock
  const tapTimesRef = useRef<number[]>([])

  useEffect(() => setHydrated(true), [])

  // Keyboard shortcut: Option/Alt + P to open admin unlock modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        setShowPasscodeModal(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleAvatarTap() {
    const now = Date.now()
    tapTimesRef.current = [...tapTimesRef.current.filter((t) => now - t < 1500), now]
    if (tapTimesRef.current.length >= 3) {
      tapTimesRef.current = []
      setShowPasscodeModal(true)
    }
  }

  function handlePasscodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (unlock(passcodeInput)) {
      setPasscodeError(false)
      setShowPasscodeModal(false)
      setPasscodeInput('')
    } else {
      setPasscodeError(true)
    }
  }

  if (!hydrated) return null

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/70 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Identity & Avatar (Triple tap unlocks Admin) */}
          <div className="min-w-0 flex items-center gap-2.5">
            <div
              onClick={handleAvatarTap}
              className="flex items-center gap-2 group shrink-0 active:scale-95 transition-transform cursor-pointer"
              title="Prakhar Mishra"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-border/80 group-hover:border-primary/60 transition-colors shadow-sm bg-muted relative">
                <img
                  src="/foto-avatar.jpg"
                  alt="Prakhar Mishra"
                  className="w-full h-full object-cover"
                  width={36}
                  height={36}
                />
                {isAdmin && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-background" />
                )}
              </div>
              <Link to="/" className="flex flex-col text-left">
                <span className="font-display font-bold text-xs sm:text-sm tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">
                  Prakhar Mishra
                </span>
                <span className="text-[10px] text-muted-foreground font-mono leading-none hidden sm:inline">
                  Chief of Staff · AI Transformation
                </span>
              </Link>
            </div>

            {/* Subpage Breadcrumb (Only on subpages other than /prep to keep bar clean) */}
            {!isHome && !isPrep && pageTitle && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                <span className="truncate max-w-[150px] font-medium text-foreground">
                  {pageTitle}
                </span>
              </div>
            )}
          </div>

          {/* Center / Right: Switcher (Admin Only) & Controls */}
          <div className="flex items-center shrink-0">
            <NavControls
              isDark={isDark}
              toggleTheme={toggleTheme}
              isAdmin={isAdmin}
              onLock={lock}
            />
          </div>
        </div>
      </nav>

      {/* Discreet Admin Passcode Unlock Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border shadow-2xl p-6 space-y-4 relative">
            <button
              onClick={() => {
                setShowPasscodeModal(false)
                setPasscodeError(false)
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-foreground">
                  Administrator Access
                </h3>
                <p className="text-xs text-muted-foreground">
                  Unlock Private Executive Prep Studio
                </p>
              </div>
            </div>

            <form onSubmit={handlePasscodeSubmit} className="space-y-3 pt-1">
              <div>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter Admin PIN / Passcode..."
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value)
                    setPasscodeError(false)
                  }}
                  className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none transition-all ${
                    passcodeError
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
                      : 'border-border focus:border-primary'
                  }`}
                />
                {passcodeError && (
                  <p className="text-[11px] text-red-400 mt-1.5">
                    Invalid passcode. Access restricted to administrator.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPasscodeModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
                >
                  Unlock Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
