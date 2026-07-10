"use client";

import React, { useState } from 'react';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://kredo-api.vercel.app';

const fieldClasses =
  'w-full bg-cream/10 border border-cream/20 rounded-sm px-3.5 py-3 font-caption text-sm text-cream placeholder:text-cream/60 focus:outline-none focus:border-cream/50';

export default function WaitlistForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    university: '',
    processingConsent: false,
    marketingConsent: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.processingConsent) {
      setError('You must accept the privacy policy and consent to data processing to join.');
      return;
    }

    setLoading(true);
    setError(null);

    // Retrieve attribution metadata if present
    let refData: Record<string, string> = {};
    const rawCookie = Cookies.get('kalahari_ref');
    if (rawCookie) {
      try {
        refData = JSON.parse(rawCookie);
      } catch {
        // Ignored
      }
    }

    const payload = {
      ...formData,
      ...refData,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to waitlist database.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="border border-cream/30 rounded-sm p-6 text-center text-cream flex flex-col gap-2">
        <h4 className="font-heading text-2xl">You&apos;re on the list.</h4>
        <p className="font-body text-base text-cream/80">
          We&apos;ve reserved your spot and will reach out as soon as Kredo accounts are ready for registration.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-cream/30 rounded-sm p-6 w-full flex flex-col gap-3"
    >
      <input
        type="text"
        required
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        className={fieldClasses}
        placeholder="Full name"
        aria-label="Full name"
      />
      <input
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className={fieldClasses}
        placeholder="Student email"
        aria-label="Student email"
      />
      <input
        type="tel"
        value={formData.mobile}
        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
        className={fieldClasses}
        placeholder="Phone number"
        aria-label="Phone number"
      />
      <input
        type="text"
        value={formData.university}
        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
        className={fieldClasses}
        placeholder="Campus / institution"
        aria-label="Campus / institution"
      />

      <label className="flex items-start gap-3 cursor-pointer mt-1">
        <input
          type="checkbox"
          checked={formData.processingConsent}
          onChange={(e) => setFormData({ ...formData, processingConsent: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-[#7d6b3d]"
        />
        <span className="font-caption text-xs text-cream/80 leading-snug">
          I consent to the collection and processing of my contact and academic details as outlined
          in the Privacy Policy. (Required)
        </span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.marketingConsent}
          onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-[#7d6b3d]"
        />
        <span className="font-caption text-xs text-cream/80 leading-snug">
          I agree to receive newsletters, credit literacy updates, and promotional communications
          from Kalahari. (Optional)
        </span>
      </label>

      {error && <p className="font-caption text-xs text-red-300 font-medium">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold py-3.5 rounded-sm transition-opacity disabled:opacity-50 cursor-pointer mt-1"
      >
        {loading ? 'Joining…' : 'Join waitlist'}
      </button>
    </form>
  );
}
