'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../lib/supabase/client';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [signedUpSuccess, setSignedUpSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      setLoading(true);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });

      setLoading(false);
      if (error) {
        // Do not reveal if email exists, show standard message unless invalid format
        if (error.message.includes('already registered')) {
          setSignedUpSuccess(true);
          return;
        }
        setErrorMsg(error.message || 'Signup failed. Please try again.');
        return;
      }

      setSignedUpSuccess(true);
      return;
    }

    // Login mode
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Please confirm your email first. Check your inbox.');
      } else {
        setErrorMsg('Email or password is wrong.');
      }
      return;
    }

    router.replace('/');
  };

  if (signedUpSuccess) {
    return (
      <div className="bg-surface p-6 rounded-xl border border-line text-center space-y-4">
        <h2 className="text-xl font-bold text-ink">Check your inbox</h2>
        <p className="text-muted text-sm leading-relaxed">
          We have sent a confirmation link to <span className="font-semibold text-ink">{email}</span>. Please click the link in your email to confirm your account and log in.
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 px-4 py-2 bg-brand hover:bg-brand-dark text-surface text-sm font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-focus outline-none"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl border border-line space-y-4">
      <h2 className="text-2xl font-bold text-ink text-center">
        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
      </h2>

      {errorMsg && (
        <div className="p-3 bg-wrong-bg border border-wrong-border text-wrong-text rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink mb-1" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="w-full px-3 py-2 border border-line rounded-lg text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-focus text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-line rounded-lg text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-focus text-base"
        />
      </div>

      {mode === 'signup' && (
        <div>
          <label className="block text-sm font-medium text-ink mb-1" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-line rounded-lg text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-focus text-base"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-brand hover:bg-brand-dark text-surface font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-focus outline-none disabled:opacity-50 min-h-[44px] flex items-center justify-center text-base"
      >
        {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
      </button>

      <div className="text-center text-sm text-muted pt-2">
        {mode === 'login' ? (
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="text-brand font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-brand font-semibold hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
