'use client';

export default function SubscribeForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Mock submission - just log for now
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    console.log('Subscribe clicked with email:', email);
  };

  return (
    <div className="shrink-0">
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-[280px]"
          required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}

