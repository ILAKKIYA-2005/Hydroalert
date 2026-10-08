import React, { useState } from 'react';
import { Droplets, ShieldCheck, AlertTriangle, ArrowRight, UserCheck, Activity, Key, Loader2 } from 'lucide-react';
import { UserSession } from '../types';
import { loginApi } from '../services/api';

interface LoginPageProps {
  onLogin: (session: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('operator');
  const [password, setPassword] = useState('operator123');
  const [role, setRole] = useState<'Facility Supervisor' | 'Water Systems Operator' | 'Project Evaluator'>('Facility Supervisor');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 10: Authenticate against Spring Boot / MySQL and retrieve JWT token
      const result = await loginApi(username.trim(), password.trim());
      onLogin(result.user);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (userChoice: 'operator' | 'supervisor') => {
    setIsLoading(true);
    setError(null);
    const u = userChoice;
    const p = userChoice === 'operator' ? 'operator123' : 'supervisor123';
    setUsername(u);
    setPassword(p);

    try {
      const result = await loginApi(u, p);
      onLogin(result.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center p-3.5 bg-sky-500/10 border border-sky-400/20 rounded-2xl mb-4 shadow-inner">
          <Droplets className="w-10 h-10 text-sky-400 animate-pulse" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          HydroAlert
        </h1>
        <p className="mt-2 text-sm text-sky-300 font-medium">
          Real-Time Water Leakage Detection & Instant Alert System
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700 text-slate-400">
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>Spring Security & JWT Authentication</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Username
              </label>
              <div className="mt-1.5">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                  placeholder="e.g. operator"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="mt-1.5">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 shadow-lg shadow-sky-600/30 transition cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In with JWT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials in MySQL */}
          <div className="mt-6 pt-6 border-t border-slate-700/80">
            <p className="text-xs text-slate-400 font-medium mb-3 text-center">
              Quick Test Accounts (MySQL Seeded)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemoLogin('operator')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600/60 transition cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>operator</span>
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemoLogin('supervisor')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600/60 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>supervisor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Project Scope Highlights */}
        <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400 leading-relaxed text-center">
          <span className="font-semibold text-slate-300">Protected REST API:</span> Endpoints under <code className="text-sky-300 font-mono text-[11px]">/api/flow/*</code> and <code className="text-sky-300 font-mono text-[11px]">/api/incidents/*</code> require a valid Bearer JWT token generated upon authentication.
        </div>
      </div>
    </div>
  );
};
