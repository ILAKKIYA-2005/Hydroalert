import React from 'react';
import { Droplets, AlertTriangle, History, LayoutDashboard, LogOut, CheckCircle2, WifiOff, Volume2, VolumeX } from 'lucide-react';
import { UserSession } from '../types';

interface NavbarProps {
  user: UserSession;
  activeTab: 'dashboard' | 'active-incidents' | 'history';
  setActiveTab: (tab: 'dashboard' | 'active-incidents' | 'history') => void;
  activeCount: number;
  hasCriticalAlert: boolean;
  onLogout: () => void;
  backendConnected?: boolean;
  onRetryBackend?: () => void;
  isSoundMuted?: boolean;
  onToggleMute?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  activeCount,
  hasCriticalAlert,
  onLogout,
  backendConnected = false,
  onRetryBackend,
  isSoundMuted = false,
  onToggleMute,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 shadow-sm">
              <Droplets className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">HydroAlert</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-800/80">
                  Water Monitoring
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Real-Time Water Leakage Detection System
              </p>
            </div>
          </div>

          {/* Simple, Clear Navigation Items */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('active-incidents')}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'active-incidents'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${hasCriticalAlert ? 'text-rose-400 animate-pulse' : ''}`} />
              <span className="hidden md:inline">Incidents</span>
              {activeCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-rose-100 bg-rose-600 rounded-full">
                  {activeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline">History</span>
            </button>
          </nav>

          {/* User Info & Connection Badge */}
          <div className="flex items-center gap-3">
            {/* Backend API Connection Status */}
            <button
              onClick={onRetryBackend}
              title={backendConnected ? 'Connected to Spring Boot API' : 'Click to check backend connection'}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                backendConnected
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {backendConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>API Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-slate-400" />
                  <span>API Standby</span>
                </>
              )}
            </button>

            {/* Operator Session Info */}
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">{user.name}</span>
              <span className="text-[10px] text-sky-400 font-mono">{user.role}</span>
            </div>

            {/* Sound Mute / Unmute Button */}
            {onToggleMute && (
              <button
                onClick={onToggleMute}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  isSoundMuted
                    ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    : 'bg-sky-950/40 text-sky-300 border-sky-800/60 hover:bg-sky-900/40'
                }`}
                title={isSoundMuted ? 'Alert sounds muted - Click to unmute' : 'Alert sounds enabled - Click to mute'}
                aria-label={isSoundMuted ? 'Unmute alert sounds' : 'Mute alert sounds'}
              >
                {isSoundMuted ? (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-sky-400" />
                )}
              </button>
            )}

            {/* Sign Out Button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-rose-950/50 hover:text-rose-200 hover:border-rose-800/60 border border-slate-700 transition cursor-pointer"
              title="Sign out of HydroAlert"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
