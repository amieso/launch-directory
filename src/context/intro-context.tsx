'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type IntroPhase = 'tracing' | 'holding' | 'settling' | 'done'

interface IntroContextType {
  introComplete: boolean
  setIntroComplete: (value: boolean) => void
  shouldShowIntro: boolean
  setShouldShowIntro: (value: boolean) => void
  contentReady: boolean
  setContentReady: (value: boolean) => void
  introPhase: IntroPhase
  setIntroPhase: (phase: IntroPhase) => void
}

const IntroContext = createContext<IntroContextType | null>(null)

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introComplete, setIntroComplete] = useState(false)
  const [shouldShowIntro, setShouldShowIntro] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const [introPhase, setIntroPhase] = useState<IntroPhase>('tracing')

  return (
    <IntroContext.Provider
      value={{
        introComplete,
        setIntroComplete,
        shouldShowIntro,
        setShouldShowIntro,
        contentReady,
        setContentReady,
        introPhase,
        setIntroPhase,
      }}
    >
      {children}
    </IntroContext.Provider>
  )
}

export function useIntroContext() {
  const context = useContext(IntroContext)
  if (!context) {
    // Return safe defaults when used outside provider
    return {
      introComplete: true,
      setIntroComplete: () => {},
      shouldShowIntro: false,
      setShouldShowIntro: () => {},
      contentReady: true,
      setContentReady: () => {},
      introPhase: 'done' as IntroPhase,
      setIntroPhase: () => {},
    }
  }
  return context
}
