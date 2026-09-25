import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, House, ChevronRight, Flame } from 'lucide-react'
import { getPageTitles } from './articles/registry'

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

/** Shared controls: segmented Portfolio / Prep Studio switcher + theme circle */
function NavControls({ isDark, toggleTheme }: {
  isDark: boolean; toggleTheme: () => void
}) {
  const { pathname } = useLocation()
  const isPrep = pathname.startsWith('/prep') || pathname.startsWith('/cockpit')

  return (
    <div className="flex items-center gap-2">
      {/* Universal Mode Switcher (Tactile Apple-style Segmented Control) */}
      <div 
        role="tablist"
        aria-label="Navigation Mode"
        className="flex items-center p-1 bg-muted/80 dark:bg-card/90 backdrop-blur-xl border border-border/80 rounded-full shadow-sm"
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
  const isPrep = pathname.startsWith('/prep') || pathname.startsWith('/cockpit')

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  if (!hydrated) return null

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/70 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Identity & Avatar */}
        <div className="min-w-0 flex items-center gap-2.5">
          <Link
            to="/"
            className="flex items-center gap-2 group shrink-0 active:scale-95 transition-transform"
            aria-label="Prakhar Mishra Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-border/80 group-hover:border-primary/60 transition-colors shadow-sm bg-muted">
              <img
                src="/foto-avatar.jpg"
                alt="Prakhar Mishra"
                className="w-full h-full object-cover"
                width={36}
                height={36}
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-bold text-xs sm:text-sm tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">
                Prakhar Mishra
              </span>
              <span className="text-[10px] text-muted-foreground font-mono leading-none hidden sm:inline">
                Chief of Staff · AI Transformation
              </span>
            </div>
          </Link>

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

        {/* Center / Right: Universal Mode Switcher & Theme Control */}
        <div className="flex items-center shrink-0">
          <NavControls isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </div>
    </nav>
  )
}
