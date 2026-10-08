import React from 'react';
import {
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Activity,
  MapPin,
  Gauge,
  Zap,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Radio,
  Pause,
  Play,
  Clock,
  Check,
} from 'lucide-react';
import { Incident, MonitoringZone } from '../types';
import { LEAKAGE_THRESHOLD } from '../data/mockData';

interface DashboardOverviewProps {
  zones: MonitoringZone[];
  selectedZoneId: string;
  onSelectZone: (id: string) => void;
  activeIncidents: Incident[];
  history: Incident[];
  onAcknowledgeIncident: (id: string | number) => void;
  onResolveIncident: (id: string | number) => void;
  onSimulateLeakage: (zoneId: string) => void;
  onResetZoneFlow: (zoneId: string) => void;
  onNavigateToHistory: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
  activeIncidents,
  history,
  onAcknowledgeIncident,
  onResolveIncident,
  onSimulateLeakage,
  onResetZoneFlow,
  onNavigateToHistory,
  isSimulating,
  onToggleSimulation,
}) => {
  const hasActiveLeakage = activeIncidents.some((i) => i.status === 'ACTIVE');
  const MAX_SCALE = 12.0;

  return (
    <div className="space-y-6">
      {/* 1. Important Statistics Bar (4 Clean Metric Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: System Status */}
        <div
          className={`p-4 rounded-xl border shadow-sm flex items-center justify-between ${
            hasActiveLeakage
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              : 'bg-slate-800/80 border-slate-700/80 text-slate-200'
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              System Status
            </span>
            <div
              className={`text-lg font-bold mt-0.5 flex items-center gap-1.5 ${
                hasActiveLeakage ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {hasActiveLeakage ? (
                <>
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Leakage Detected</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>All Systems Normal</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {hasActiveLeakage ? 'Active pipe alerts present' : 'Flow rates < 8.0 L/min'}
            </span>
          </div>
        </div>

        {/* Card 2: Monitored Locations */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Monitored Locations
            </span>
            <div className="text-xl font-bold text-white mt-0.5 font-mono">
              {zones.length} Zones
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Block A, Block B, Block C
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Leakage Threshold */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Leakage Threshold
            </span>
            <div className="text-xl font-bold text-amber-400 mt-0.5 font-mono">
              {LEAKAGE_THRESHOLD.toFixed(1)} L/min
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              &ge; 8.0 L/min triggers alert
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Gauge className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Active Incidents Count */}
        <div
          className={`p-4 rounded-xl border shadow-sm flex items-center justify-between ${
            activeIncidents.length > 0
              ? 'bg-rose-950/20 border-rose-500/30'
              : 'bg-slate-800/80 border-slate-700/80'
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Active Incidents
            </span>
            <div
              className={`text-xl font-bold mt-0.5 font-mono ${
                activeIncidents.length > 0 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {activeIncidents.length} Pending
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {activeIncidents.length > 0 ? 'Requires operator review' : 'No unresolved events'}
            </span>
          </div>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              activeIncidents.length > 0
                ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                : 'bg-slate-700/50 border border-slate-600/50 text-slate-400'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 2. Water Flow Monitoring Section (Current Readings) */}
      <section className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-700/60">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-sky-400" />
              <span>Water Flow Monitoring</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live telemetry readings across building pipeline locations. Normal threshold is below 8.0 L/min.
            </p>
          </div>

          {/* Telemetry Stream Status & Pause/Resume Control */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 rounded-lg">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-medium text-[11px]">
                {isSimulating ? 'Live Telemetry' : 'Stream Paused'}
              </span>
            </span>

            <button
              onClick={onToggleSimulation}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600/80 transition cursor-pointer"
              title={isSimulating ? 'Pause automatic telemetry updates' : 'Resume live telemetry updates'}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Resume</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3 Clean Location Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {zones.map((zone) => {
            const isZoneLeakage = zone.flowRate >= LEAKAGE_THRESHOLD;
            const flowPercent = Math.min(100, Math.round((zone.flowRate / MAX_SCALE) * 100));
            const thresholdPercent = Math.round((LEAKAGE_THRESHOLD / MAX_SCALE) * 100);
            const isSelected = zone.id === selectedZoneId;

            return (
              <div
                key={zone.id}
                onClick={() => onSelectZone(zone.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isZoneLeakage
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-md ring-1 ring-rose-500/20'
                    : isSelected
                    ? 'bg-slate-750/90 border-sky-500/60 ring-1 ring-sky-500/30'
                    : 'bg-slate-900/60 border-slate-700/70 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <div>
                  {/* Card Header: Location name & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {zone.location}
                      </h3>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {zone.name}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        isZoneLeakage
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isZoneLeakage ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Possible Leakage</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Normal</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Flow Rate Metric */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 font-medium">Flow Rate:</span>
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={`text-3xl font-black font-mono tracking-tight ${
                          isZoneLeakage ? 'text-rose-400' : 'text-sky-300'
                        }`}
                      >
                        {zone.flowRate.toFixed(1)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">L/min</span>
                    </div>
                  </div>

                  {/* Progress Gauge Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative border border-slate-700/80">
                      {/* 8.0 L/min Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                        style={{ left: `${thresholdPercent}%` }}
                        title="Threshold 8.0 L/min"
                      />
                      {/* Fill */}
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isZoneLeakage ? 'bg-rose-500' : 'bg-sky-400'
                        }`}
                        style={{ width: `${flowPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>0.0</span>
                      <span className="text-amber-300 font-medium">8.0 (Limit)</span>
                      <span>12.0</span>
                    </div>
                  </div>
                </div>

                {/* Demonstration Action Button (Single Clean Test Button) */}
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Updated: {zone.lastUpdated}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isZoneLeakage) {
                        onResetZoneFlow(zone.id);
                      } else {
                        onSimulateLeakage(zone.id);
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                      isZoneLeakage
                        ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                    title={
                      isZoneLeakage
                        ? 'Restore normal flow for this location'
                        : 'Simulate a flow spike &ge; 8.0 L/min'
                    }
                  >
                    {isZoneLeakage ? (
                      <>
                        <RotateCcw className="w-3 h-3" />
                        <span>Normalize</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Test Spike</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Main Split Section: Active Incidents Queue (Left) & Recent Activity (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Active Alerts & Incident Queue */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Active Alerts & Incidents</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Unresolved water leakage incidents requiring operator action.
              </p>
            </div>

            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
              {activeIncidents.length} Active
            </span>
          </div>

          {activeIncidents.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-700/60">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-white">No Active Pipeline Incidents</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                All monitored zones are currently operating below 8.0 L/min. Any detected anomalies will be queued here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeIncidents.map((incident) => {
                const isActive = incident.status === 'ACTIVE';
                const isAcknowledged = incident.status === 'ACKNOWLEDGED';

                return (
                  <div
                    key={incident.id}
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/20'
                        : 'bg-amber-950/15 border-amber-500/30'
                    }`}
                  >
                    {/* Left: Incident Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {incident.status}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {incident.location}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          ID: {incident.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-300 pt-0.5">
                        <span className="inline-flex items-center gap-1 font-mono text-rose-300 font-semibold">
                          <Droplets className="w-3.5 h-3.5 text-rose-400" />
                          {incident.flowRate.toFixed(1)} L/min
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {incident.detectionTime}
                        </span>
                        {incident.acknowledgedTime && (
                          <span className="hidden sm:inline-flex items-center gap-1 font-mono text-amber-300">
                            <Check className="w-3 h-3 text-amber-400" />
                            Ack: {incident.acknowledgedTime}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Step-by-Step Action Buttons */}
                    <div className="shrink-0 flex items-center gap-2">
                      {isActive && (
                        <button
                          onClick={() => onAcknowledgeIncident(incident.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-sm cursor-pointer"
                          title="Acknowledge this incident (ACTIVE -> ACKNOWLEDGED)"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Acknowledge</span>
                        </button>
                      )}

                      {isAcknowledged && (
                        <button
                          onClick={() => onResolveIncident(incident.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-sm cursor-pointer"
                          title="Resolve this incident (ACKNOWLEDGED -> RESOLVED)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark as Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Recent Activity Log */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                <span>Recent Activity</span>
              </h3>

              <button
                onClick={onNavigateToHistory}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Full Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {history.length === 0 ? (
              <div className="p-6 text-center bg-slate-900/40 rounded-xl border border-slate-700/60">
                <span className="text-xs text-slate-400 block">
                  No resolved incidents logged yet in this session.
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Resolved incidents are archived here and in MySQL.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/70 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{item.location}</span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                        Resolved
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Flow: {item.flowRate.toFixed(1)} L/min</span>
                      <span>Time: {item.resolvedTime || item.detectionTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Monitoring Guide Note for Demonstrator */}
          <div className="mt-5 pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Project Demonstration Guide:</div>
            <div>&bull; Click <strong>Test Spike</strong> on any zone to breach 8.0 L/min.</div>
            <div>&bull; Click <strong>Acknowledge</strong>, then <strong>Mark as Resolved</strong>.</div>
          </div>
        </div>
      </section>
    </div>
  );
};
