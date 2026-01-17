'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'lowkey_intro_seen'

export function useFirstVisit() {
  const [isLoading, setIsLoading] = useState(true)
  const [shouldShowIntro, setShouldShowIntro] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY)
    setShouldShowIntro(!seen)
    setIsLoading(false)
  }, [])

  const markAsSeen = () => {
    sessionStorage.setItem(STORAGE_KEY, 'true')
    setShouldShowIntro(false)
  }

  return { shouldShowIntro, isLoading, markAsSeen }
}
