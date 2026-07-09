"use client";

import React, { useState } from 'react';
import Cookies from 'js-cookie';

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
      } catch (err) {
        // Ignored
      }
    }

    const payload = {
      ...formData,
      ...refData,
    };

    try {
      const response = await fetch('http://localhost:3000/api/v1/leads', {
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
    } catch (err: any) {
      setError(err.message || 'Failed to connect to waitlist database.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center text-emerald-950">
        <h4 className="text-xl font-bold mb-2">🎉 You're on the list!</h4>
        <p className="text-sm">We've reserved your spot. We'll reach out as soon as Kredo accounts are ready for registration.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-stone-200 shadow-xl rounded-3xl p-8 max-w-lg w-full flex flex-col gap-5 text-stone-900">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Reserve your spot</h3>
        <p className="text-sm text-stone-500 mt-1">Join the waitlist to build credit history early.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-stone-600">Full Name *</label>
        <input
          type="text"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="border border-stone-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          placeholder="e.g. Thabo Mollo"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-stone-600">Email Address *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border border-stone-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          placeholder="student@university.ac.za"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-stone-600">Mobile Number (Optional)</label>
        <input
          type="tel"
          value={formData.mobile}
          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          className="border border-stone-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          placeholder="e.g. 082 123 4567"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-stone-600">Institution Name (Optional)</label>
        <input
          type="text"
          value={formData.university}
          onChange={(e) => setFormData({ ...formData, university: e.target.value })}
          className="border border-stone-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          placeholder="e.g. University of Cape Town"
        />
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.processingConsent}
            onChange={(e) => setFormData({ ...formData, processingConsent: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40"
          />
          <span className="text-xs text-stone-600 leading-tight">
            I consent to the collection and processing of my contact and academic details as outlined in the Privacy Policy. (Required) *
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.marketingConsent}
            onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40"
          />
          <span className="text-xs text-stone-600 leading-tight">
            I agree to receive newsletters, credit literacy updates, and promotional communications from Kalahari. (Optional)
          </span>
        </label>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-50 mt-2 cursor-pointer"
      >
        {loading ? 'Joining...' : 'Join Waitlist'}
      </button>
    </form>
  );
}
