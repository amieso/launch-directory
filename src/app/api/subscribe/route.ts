import { Resend } from 'resend'
import { NextResponse, after } from 'next/server'
import { z } from 'zod'
import { WelcomeEmail } from '@/emails/welcome'

const emailSchema = z.string().email()

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error('Missing RESEND_API_KEY')
    return NextResponse.json({ error: 'Newsletter not configured' }, { status: 500 })
  }

  const { email } = await request.json()

  const result = emailSchema.safeParse(email)
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  // Do the Resend work after the response is flushed so signup feels instant.
  // It's best-effort anyway (we never surfaced contact/send failures to the
  // user), so nothing here belongs on the critical path.
  after(async () => {
    const resend = new Resend(apiKey)

    // Already an active contact? Don't re-send the welcome on repeat submits.
    // (The modern /contacts endpoint is idempotent, so create alone can't tell
    // a new signup from a duplicate — we look the contact up first.)
    const existing = await resend.contacts.get({ email })
    if (existing.data && !existing.data.unsubscribed) return

    const { error } = await resend.contacts.create({ email })
    if (error) {
      console.error('Resend error:', error)
      return
    }

    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'lowkey <onboarding@resend.dev>',
      to: email,
      subject: 'welcome to lowkey',
      react: WelcomeEmail({ email }),
    })

    if (sendError) console.error('Resend send error:', sendError)
  })

  return NextResponse.json({ success: true })
}
