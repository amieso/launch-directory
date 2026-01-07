'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import useMeasure from 'react-use-measure'
import { useAuth } from '@/contexts/auth-context'
import { Input } from '@/components/ui/input'

type AuthStep = 'initial' | 'email' | 'magic-link-sent'

// Shake animation for error state
const shakeVariants = {
  shake: {
    x: [0, -8, 8, -8, 8, 0],
    transition: { duration: 0.4 }
  }
}

// Map Supabase errors to user-friendly messages
function getFriendlyError(error: string): string {
  if (error.toLowerCase().includes('invalid login credentials')) {
    return 'No account found with this email'
  }
  if (error.toLowerCase().includes('email not confirmed')) {
    return 'Please verify your email first'
  }
  if (error.toLowerCase().includes('user already registered')) {
    return 'An account with this email already exists'
  }
  if (error.toLowerCase().includes('signups not allowed')) {
    return 'No account found with this email'
  }
  return error
}

export function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, signInWithGoogle, signInWithMagicLink } = useAuth()
  const [contentRef, bounds] = useMeasure()
  const [step, setStep] = useState<AuthStep>('initial')
  const [email, setEmail] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>(authModalMode)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState(0) // Increment to trigger shake
  const [prevHeight, setPrevHeight] = useState<number | null>(null)

  // Only animate after we have a previous height to animate from
  const shouldAnimate = prevHeight !== null && bounds.height > 0

  // Track height changes for animation
  useEffect(() => {
    if (bounds.height > 0) {
      setPrevHeight(bounds.height)
    }
  }, [bounds.height])

  // Sync mode with context when modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode)
      setStep('initial')
      setEmail('')
      setError(null)
      setIsLoading(false)
      setShakeKey(0)
      setPrevHeight(null)
    }
  }, [isAuthModalOpen, authModalMode])

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal()
      }
    },
    [closeAuthModal]
  )

  useEffect(() => {
    if (isAuthModalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isAuthModalOpen, handleEscape])

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google')
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    // Both login and signup use magic link - no password needed
    setIsLoading(true)
    setError(null)
    try {
      await signInWithMagicLink(email)
      setStep('magic-link-sent')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send link'
      setError(errorMsg)
      setShakeKey(prev => prev + 1) // Trigger shake animation
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setError(null)
    if (step === 'email') {
      setStep('initial')
      setEmail('')
    } else if (step === 'magic-link-sent') {
      setStep('email')
    }
  }

  const getTitle = () => {
    if (step === 'magic-link-sent') return 'Check Your Email'
    return mode === 'login' ? 'Welcome Back' : 'Join Lowkey'
  }

  const getDescription = () => {
    if (step === 'magic-link-sent') {
      return mode === 'login'
        ? `We sent a login link to ${email}. Click it to sign in.`
        : `We sent a link to ${email}. Click it to create your account.`
    }
    return mode === 'login'
      ? 'Sign in to pick up where you left off and access the full library.'
      : 'Create a free account to unlock every video in the library.'
  }

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg"
        >
          {/* Backdrop - click to close */}
          <div className="absolute inset-0" onClick={closeAuthModal} />

          {/* Logo above modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative z-10 mb-6"
          >
            <span className="text-2xl font-kanit font-bold text-foreground">lowkey</span>
          </motion.div>

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 w-full max-w-sm mx-4 bg-surface rounded-[32px] border border-border"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated height container */}
            <motion.div
              animate={{ height: bounds.height > 0 ? bounds.height : 'auto' }}
              transition={shouldAnimate ? { type: 'spring', bounce: 0, duration: 0.4 } : { duration: 0 }}
              style={!shouldAnimate ? { height: 'auto' } : undefined}
              className="overflow-hidden rounded-[32px]"
            >
              <div ref={contentRef}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-12">
                  <AnimatePresence mode="wait">
                    {step !== 'magic-link-sent' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex h-9 bg-white/5 rounded-full p-[3px]"
                      >
                        <button
                          onClick={() => setMode('login')}
                          className={`h-[30px] px-4 text-sm rounded-full transition-colors ${
                            mode === 'login'
                              ? 'bg-white/10 text-foreground'
                              : 'text-muted hover:text-foreground'
                          }`}
                        >
                          Log in
                        </button>
                        <button
                          onClick={() => setMode('signup')}
                          className={`h-[30px] px-4 text-sm rounded-full transition-colors ${
                            mode === 'signup'
                              ? 'bg-white/10 text-foreground'
                              : 'text-muted hover:text-foreground'
                          }`}
                        >
                          Sign up
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={closeAuthModal}
                    className={`w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors ${step === 'magic-link-sent' ? 'ml-auto' : ''}`}
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4 text-muted" />
                  </button>
                </div>

                {/* Title and description */}
                <div className="px-[50px] mt-2.5 mb-2.5 text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${step}-${mode}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h2 id="auth-modal-title" className="text-xl font-medium text-foreground mb-2">
                        {getTitle()}
                      </h2>
                      <p className="text-sm text-muted">
                        {getDescription()}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-2 px-4 pt-12 pb-6">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {step === 'initial' && (
                      <motion.div
                        key="initial"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                        className="flex flex-col gap-2"
                      >
                        <button
                          onClick={handleGoogleAuth}
                          disabled={isLoading}
                          className="w-full h-9 inline-flex items-center justify-center gap-2 text-sm text-muted bg-white/10 rounded-full transition-colors hover:text-foreground hover:bg-white/15 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Continue with Google'
                          )}
                        </button>
                        <button
                          onClick={() => setStep('email')}
                          disabled={isLoading}
                          className="w-full h-9 inline-flex items-center justify-center text-sm text-muted border border-border rounded-full transition-colors hover:text-foreground hover:border-foreground disabled:opacity-50"
                        >
                          Continue with Email
                        </button>
                      </motion.div>
                    )}

                    {step === 'email' && (
                      <motion.form
                        key="email"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                        onSubmit={handleEmailSubmit}
                        className="flex flex-col gap-2"
                      >
                        {/* Error message above input */}
                        <AnimatePresence>
                          {error && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="font-mono text-sm text-red-400 flex items-center gap-1 flex-wrap"
                            >
                              {getFriendlyError(error)}
                              {(error.toLowerCase().includes('no account') || error.toLowerCase().includes('not found') || error.toLowerCase().includes('invalid login') || error.toLowerCase().includes('signups not allowed')) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMode('signup')
                                    setError(null)
                                  }}
                                  className="underline hover:text-red-300 transition-colors"
                                >
                                  Sign up instead?
                                </button>
                              )}
                            </motion.p>
                          )}
                        </AnimatePresence>

                        {/* Input with shake animation */}
                        <motion.div
                          key={shakeKey}
                          variants={shakeVariants}
                          initial={false}
                          animate={shakeKey > 0 ? "shake" : {}}
                        >
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              if (error) setError(null)
                            }}
                            placeholder="Enter your email"
                            autoFocus
                            disabled={isLoading}
                          />
                        </motion.div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleBack}
                            disabled={isLoading}
                            className="flex-1 h-9 inline-flex items-center justify-center text-sm text-muted border border-white/20 rounded-full transition-colors hover:text-foreground hover:border-white/40 disabled:opacity-50"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={!email.trim() || isLoading}
                            className="flex-1 h-9 inline-flex items-center justify-center gap-2 text-sm text-muted bg-white/10 rounded-full transition-colors hover:text-foreground hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Send Link'
                            )}
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {step === 'magic-link-sent' && (
                      <motion.div
                        key="magic-link-sent"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                        className="flex flex-col gap-2"
                      >
                        <button
                          type="button"
                          onClick={handleBack}
                          className="w-full h-9 inline-flex items-center justify-center text-sm text-muted border border-white/20 rounded-full transition-colors hover:text-foreground hover:border-white/40"
                        >
                          Use a different email
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
