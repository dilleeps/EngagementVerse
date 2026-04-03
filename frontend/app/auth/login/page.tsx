'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm border border-black/[0.08]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white font-bold text-lg">
            E
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Engagement Verse</h1>
          <p className="mt-2 text-sm text-gray-500">
            AI-powered HCP engagement platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="rounded-lg bg-brand-light border border-brand/10 p-4">
          <p className="text-xs font-medium text-brand-dark mb-2">Demo credentials</p>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-500">Admin:</span>
              <span className="font-mono">admin@engagementverse.com / TempPass123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">MSL Lead:</span>
              <span className="font-mono">msl@engagementverse.com / Demo1234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Medical:</span>
              <span className="font-mono">medical@engagementverse.com / Demo1234</span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-medium text-brand hover:text-brand-dark transition-colors">
              Create account
            </Link>
          </p>
          <p className="text-xs text-gray-400">
            Powered by BioverseAI - Bioverse Corp.
          </p>
        </div>
      </div>
    </div>
  );
}
