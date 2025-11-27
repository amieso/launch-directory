'use client';

import { useState } from 'react';
import { InputWithButton, EmailIcon } from '@/components/ui';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [shake, setShake] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = () => {
    // Email format validation (empty check is handled by component)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }

    // Mock submission - just log for now
    console.log('Subscribe clicked with email:', email);
    setSubscribed(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  if (subscribed) {
    return (
      <div className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm text-gray-600">
        <span>✓</span>
        <span>Thanks for subscribing!</span>
      </div>
    );
  }

  return (
    <div className="shrink-0">
      <InputWithButton
        value={email}
        onChange={setEmail}
        onButtonClick={handleSubmit}
        buttonText="Subscribe"
        icon={<EmailIcon />}
        placeholder="Enter your email"
        buttonShake={shake}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
        containerClassName="min-w-[280px]"
      />
    </div>
  );
}
