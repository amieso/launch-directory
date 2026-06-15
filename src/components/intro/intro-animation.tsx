'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IntroLogo } from './intro-logo'
import { useIntroContext } from '@/context/intro-context'

type Phase = 'tracing' | 'blinking' | 'settling' | 'done'

interface IntroAnimationProps {
  onComplete?: () => void
  onContentReady?: () => void
}

// How long after the blink we'll wait for the visible previews to paint before
// revealing anyway — a slow network must never trap the visitor on the intro.
const MEDIA_WAIT_CAP_MS = 2000

export function IntroAnimation({ onComplete, onContentReady }: IntroAnimationProps) {
  const [phase, setPhase] = useState<Phase>('tracing')
  const [shouldBlink, setShouldBlink] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [blinkDone, setBlinkDone] = useState(false)
  const settledRef = useRef(false)
  const { setIntroPhase, mediaReady } = useIntroContext()

  // Store callbacks in refs to avoid stale closure and dependency issues
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const onContentReadyRef = useRef(onContentReady)
  onContentReadyRef.current = onContentReady

  // Logo trace → blink. Content mounts behind the overlay from the start, so the
  // visible previews are already loading while this plays.
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    timers.push(setTimeout(() => setShouldBlink(true), 2000))
    timers.push(setTimeout(() => setBlinkDone(true), 2300))
    return () => timers.forEach(clearTimeout)
  }, [])

  // Once the blink is done, reveal as soon as the visible previews have painted
  // — or after the cap, whichever comes first. Settling cross-fades the logo
  // into the header and fades the overlay out.
  useEffect(() => {
    if (!blinkDone || settledRef.current) return

    const settle = () => {
      if (settledRef.current) return
      settledRef.current = true
      setPhase('settling')
      setIntroPhase('settling')
      onContentReadyRef.current?.()
      setTimeout(() => setIsVisible(false), 200)
      setTimeout(() => {
        setPhase('done')
        setIntroPhase('done')
        onCompleteRef.current?.()
      }, 700)
    }

    if (mediaReady) {
      settle()
      return
    }
    const cap = setTimeout(settle, MEDIA_WAIT_CAP_MS)
    return () => clearTimeout(cap)
  }, [blinkDone, mediaReady, setIntroPhase])

  const isSettling = phase === 'settling' || phase === 'done'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          initial={{ backgroundColor: 'rgba(10, 10, 10, 1)' }}
          animate={{
            backgroundColor: isSettling ? 'rgba(10, 10, 10, 0)' : 'rgba(10, 10, 10, 1)'
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Fade out IntroLogo when settling - cross-fades with AnimatedLogo in Header */}
          <motion.div
            animate={{ opacity: isSettling ? 0 : 1 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <IntroLogo size={160} shouldBlink={shouldBlink} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
