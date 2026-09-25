import { useState, useEffect, useCallback } from 'react'

const AUTH_STORAGE_KEY = 'prakhar_admin_authenticated'
const VALID_PASSCODES = ['2026', 'prakhar2026', 'prakhar', 'admin2026', 'prakharmishra']

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Check URL query parameters for auto-authentication
    const params = new URLSearchParams(window.location.search)
    const keyParam = params.get('key') || params.get('admin') || params.get('passcode')

    if (keyParam && (VALID_PASSCODES.includes(keyParam.toLowerCase()) || keyParam === 'true')) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true')
      setIsAdmin(true)

      // Clean query parameters from URL without reloading
      params.delete('key')
      params.delete('admin')
      params.delete('passcode')
      const newSearch = params.toString() ? `?${params.toString()}` : ''
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${newSearch}${window.location.hash}`
      )
    }

    // 2. Sync across multiple browser tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY) {
        setIsAdmin(e.newValue === 'true')
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const unlock = useCallback((code: string): boolean => {
    if (VALID_PASSCODES.includes(code.trim().toLowerCase())) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true')
      setIsAdmin(true)
      return true
    }
    return false
  }, [])

  const lock = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setIsAdmin(false)
  }, [])

  return { isAdmin, unlock, lock }
}
