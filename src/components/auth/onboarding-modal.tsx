'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Check, Pipette } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { profileService } from '@/services/profile-service'
import { Input } from '@/components/ui/input'

const AVATAR_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#FBBF24', // amber
  '#4ADE80', // green
  '#22D3EE', // cyan
  '#818CF8', // indigo
]

export function OnboardingModal() {
  const { user, isOnboardingOpen, completeOnboarding, refreshUser } = useAuth()
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      await profileService.updateProfile(user.id, {
        name: name.trim(),
        avatar_color: selectedColor || '#6B7280', // default gray if no color selected
      })
      await refreshUser()
      completeOnboarding()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = () => {
    if (!name.trim()) return '0'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.trim()[0].toUpperCase()
  }

  const avatarColor = selectedColor || '#6B7280' // gray-500

  return (
    <AnimatePresence>
      {isOnboardingOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg"
        >
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
            aria-labelledby="onboarding-modal-title"
          >
            {/* Header spacer */}
            <div className="pt-8" />

            {/* Title and description */}
            <div className="px-[50px] text-center">
              <h2 id="onboarding-modal-title" className="text-xl font-medium text-foreground mb-2">
                Complete Your Profile
              </h2>
              <p className="text-sm text-muted">
                Tell us a bit about yourself to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-4 pt-8 pb-4">
              {/* Avatar preview with color picker trigger */}
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold text-white transition-colors"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {getInitials()}
                  </div>

                  {/* Eyedropper button */}
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-white/10 transition-colors"
                    aria-label="Choose avatar color"
                  >
                    <Pipette className="w-4 h-4 text-muted" />
                  </button>
                </div>
              </div>

              {/* Color picker - shown when eyedropper is clicked */}
              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-center gap-3 overflow-hidden"
                  >
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color)
                          setShowColorPicker(false)
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none"
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      >
                        {selectedColor === color && (
                          <Check className="w-5 h-5 text-white" strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name input */}
              <Input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="Enter your name"
                autoFocus
                disabled={isLoading}
              />

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="font-mono text-sm text-red-400 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!name.trim() || isLoading}
                className="w-full h-9 inline-flex items-center justify-center gap-2 text-sm text-muted bg-white/10 rounded-full transition-colors hover:text-foreground hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
