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

export function IntroAnimation({ onComplete, onContentReady }: IntroAnimationProps) {
  const [phase, setPhase] = useState<Phase>('tracing')
  const [shouldBlink, setShouldBlink] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const { setIntroPhase } = useIntroContext()

  // Store callbacks in refs to avoid stale closure and dependency issues
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const onContentReadyRef = useRef(onContentReady)
  onContentReadyRef.current = onContentReady

  useEffect(() => {
    // Phase timing
    const timers: NodeJS.Timeout[] = []

    // After trace completes (2s), trigger blink
    timers.push(setTimeout(() => {
      setShouldBlink(true)
    }, 2000))

    // After blink completes (2s + 0.3s = 2.3s), start settling
    timers.push(setTimeout(() => {
      setPhase('settling')
      setIntroPhase('settling')
      onContentReadyRef.current?.()
    }, 2300))

    // At 2.5s, hide overlay
    timers.push(setTimeout(() => {
      setIsVisible(false)
    }, 2500))

    // After settle complete (3s), mark done
    timers.push(setTimeout(() => {
      setPhase('done')
      setIntroPhase('done')
      onCompleteRef.current?.()
    }, 3000))

    return () => timers.forEach(clearTimeout)
  }, [setIntroPhase])

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
