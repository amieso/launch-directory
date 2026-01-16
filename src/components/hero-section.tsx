'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { MorphText } from './ui/morph-text'

const ROTATING_WORDS = ['launch video', 'product demo', 'announcement']

export function HeroSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error()

      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong. Try again.')
    }
  }

  const buttonWidth = status === 'loading' || status === 'success' ? 36 : 92

  return (
    <section className="px-4 md:px-6 py-16 md:py-32">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[12px] font-mono text-muted uppercase tracking-widest mb-7">
          From the makers of Amie
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground leading-[1.1] tracking-tight">
          <MorphText prefix="Find your next" words={ROTATING_WORDS} />
        </h1>
        <p className="mt-4 text-lg text-muted leading-relaxed max-w-xl mx-auto">
          A curated collection of the best product launch videos.
          Get inspired by how top companies announce their products.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 flex gap-2 justify-center w-[388px] mx-auto">
          {status === 'success' ? (
            <div
              className="h-9 px-4 rounded-full bg-surface border border-border flex items-center"
              style={{ width: 288, transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <span className="text-sm text-foreground">You're subscribed!</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <input
                type="email"
                placeholder="dennis@amie.so"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === 'error') {
                    setStatus('idle')
                    setErrorMessage('')
                  }
                }}
                className="w-72 h-9 px-4 bg-white/5 rounded-full text-sm text-foreground placeholder:text-muted-dark/50 focus:outline-none"
                required
              />
              {errorMessage && <span className="text-[11px] text-red-400 text-left px-2">{errorMessage}</span>}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="h-9 rounded-full text-sm font-medium flex items-center justify-center bg-foreground text-background hover:opacity-90 disabled:opacity-50 overflow-hidden relative"
            style={{ width: buttonWidth, transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: +(status === 'idle' || status === 'error'), transition: 'opacity 150ms ease-out' }}
            >
              Subscribe
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: +(status === 'loading'), transition: 'opacity 150ms ease-out' }}
            >
              <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: +(status === 'success'), transition: 'opacity 150ms ease-out' }}
            >
              <Check className="w-4 h-4" />
            </span>
          </button>
        </form>
      </div>
    </section>
  )
}
