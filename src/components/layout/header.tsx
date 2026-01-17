'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { useIntroContext } from '@/context/intro-context'

export function Header() {
  const { introComplete, shouldShowIntro, introPhase } = useIntroContext()

  // Logo should be visible if: no intro needed OR intro is settling/done
  const showLogo = !shouldShowIntro || introPhase === 'settling' || introPhase === 'done'
  const isSettling = shouldShowIntro && introPhase === 'settling'

  // Calculate starting position (center of screen relative to header position)
  const getStartY = () => {
    if (typeof window === 'undefined') return 348
    // Header logo is at roughly y=52 from top, center is at windowHeight/2
    return window.innerHeight / 2 - 52
  }

  return (
    <header className="sticky top-0 z-40 w-full pb-2">
      {/* Progressive blur layers */}
      <div className="absolute inset-0 backdrop-blur-[16px] [mask-image:linear-gradient(to_bottom,black_0%,transparent_25%)]" />
      <div className="absolute inset-0 backdrop-blur-[12px] [mask-image:linear-gradient(to_bottom,black_10%,transparent_40%)]" />
      <div className="absolute inset-0 backdrop-blur-[8px] [mask-image:linear-gradient(to_bottom,black_20%,transparent_55%)]" />
      <div className="absolute inset-0 backdrop-blur-[4px] [mask-image:linear-gradient(to_bottom,black_35%,transparent_70%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,black_50%,transparent_85%)]" />
      <div className="absolute inset-0 backdrop-blur-[1px] [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-transparent" />
      <div className="relative px-4 md:px-6">
        <div className="flex h-16 items-center justify-center pt-6 sm:pt-9">
          {/* Logo - animates from center to header during settling phase */}
          <Link href="/" className="flex items-center">
            <motion.div
              initial={isSettling ? {
                opacity: 0,
                scale: 160 / 44,
                y: getStartY()
              } : {
                opacity: showLogo ? 1 : 0
              }}
              animate={{
                opacity: showLogo ? 1 : 0,
                scale: 1,
                y: 0,
              }}
              transition={isSettling ? {
                scale: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
                y: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
                opacity: { duration: 0.15, ease: 'easeIn' },
              } : {
                duration: 0.2,
              }}
            >
              <AnimatedLogo isHovered={introComplete} />
            </motion.div>
          </Link>
        </div>
      </div>
    </header>
  )
}
