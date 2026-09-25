import type { ComponentType } from 'react'

/**
 * Article / case-study registry.
 *
 * Cleared: this site is a single-page CV plus an About page. There are no
 * long-form article routes. The helper functions below are kept because
 * GlobalNav, FloatingChat and MusicToggle import them for breadcrumb titles
 * and language detection.
 */

export interface ArticleSeo {
  title: string
  description: string
}

export interface ArticleConfig {
  id: string
  slugs: { es: string; en: string }
  titles: { es: string; en: string }
  seo: { es: ArticleSeo; en: ArticleSeo }
  sectionLabels: { es: Record<string, string>; en: Record<string, string> }
  type: 'collab' | 'case-study' | 'bridge'
  ogImage?: string
  heroImage?: string
  component: () => Promise<{ default: ComponentType<{ lang: 'es' | 'en' }> }>
  xDefaultSlug?: string
  ragReady?: boolean
  i18nFile?: string
}

export const articleRegistry: ArticleConfig[] = []

// Derived maps for GlobalNav / FloatingChat / MusicToggle
export function getAltPaths(): Record<string, string> {
  return {
    '/': '/en',
    '/en': '/',
    '/about': '/about',
    '/privacy': '/privacy',
  }
}

export function getPageTitles(): Record<string, string> {
  return {
    '/': "Prakhar Mishra's Portfolio",
    '/en': "Prakhar Mishra's Portfolio",
    '/about': 'About',
    '/prep': 'Executive Interview Prep Studio',
    '/cockpit': 'Executive Interview Prep Studio',
  }
}

export function getSectionLabels(): Record<string, Record<string, string>> {
  return {}
}

/** ES slugs (kept for API compatibility; the site is English-only). */
export function getEsSlugs(): Set<string> {
  return new Set<string>(['/'])
}
