import React from 'react';
import { CheckCircle, Clock, ShieldAlert, Check, Droplets, MapPin, ArrowRight } from 'lucide-react';
import { Incident } from '../types';

interface ActiveIncidentsProps {
  incidents: Incident[];
  onAcknowledge: (id: string | number) => void;
  onResolve: (id: string | number) => void;
  isCompact?: boolean;
}

export const ActiveIncidentsSection: React.FC<ActiveIncidentsProps> = ({
  incidents,
  onAcknowledge,
  onResolve,
}) => {
  if (incidents.length === 0) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-8 text-center shadow-md">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">No Active Incidents</h3>
        <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
          All locations have flow rates below the 8.0 L/min threshold. Pipelines are operating normally.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => {
        const isActive = incident.status === 'ACTIVE';
        const isAcknowledged = incident.status === 'ACKNOWLEDGED';

        return (
          <div
            key={incident.id}
            className={`rounded-xl border transition-all p-5 shadow-lg ${
              isActive
                ? 'bg-rose-950/25 border-rose-500/60 hover:border-rose-500/90 ring-1 ring-rose-500/30'
                : 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/70'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Main Incident Details */}
              <div className="space-y-3 flex-1">
                {/* Header: Status and Workflow Step */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-950 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Status: {incident.status}
                  </span>

                  <span className="text-xs font-mono font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                    ID: {incident.id}
                  </span>

                  {/* Visual Status Step Indicator */}
                  <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-slate-400">
                    <span className={isActive ? 'font-bold text-rose-400' : 'text-slate-500'}>
                      ACTIVE
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className={isAcknowledged ? 'font-bold text-amber-400' : 'text-slate-500'}>
                      ACKNOWLEDGED
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className="text-slate-500">RESOLVED</span>
                  </div>
                </div>

                {/* 1. Location */}
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Location:
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {incident.location}
                    </h4>
                  </div>
                  {incident.notes && (
                    <p className="text-xs text-slate-300 mt-1 italic pl-6">
                      {incident.notes}
                    </p>
                  )}
                </div>

                {/* 2. Flow Rate & 3. Detection Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Flow Rate */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/90 border border-slate-700/70">
                    <Droplets className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Current Flow Rate
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-rose-400 font-mono">
                          {incident.flowRate.toFixed(1)}
                        </span>
                        <span className="text-xs font-medium text-slate-300">Liters/min</span>
                      </div>
                    </div>
                  </div>

                  {/* Detection Time */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/90 border border-slate-700/70">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Detection Time
                      </span>
                      <span className="text-sm font-bold text-slate-200 font-mono">
                        {incident.detectionTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acknowledgement Time Display */}
                {(incident.acknowledgedTime || incident.acknowledgedAt) && (
                  <div className="text-xs text-amber-300 flex items-center gap-1.5 pt-0.5 font-mono">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Acknowledged at: {incident.acknowledgedTime || incident.acknowledgedAt}
                    </span>
                  </div>
                )}
              </div>

              {/* Step 5 Strict Workflow Action Buttons:
                  Only allow:
                  ACTIVE → ACKNOWLEDGED (via "Acknowledge" button)
                  ACKNOWLEDGED → RESOLVED (via "Mark as Resolved" button)
                  Do not allow skipping statuses!
              */}
              <div className="flex sm:flex-col items-center sm:items-stretch gap-2 shrink-0 pt-2 sm:pt-0 self-center sm:self-start">
                {/* 1. When ACTIVE: Show only Acknowledge button */}
                {isActive && (
                  <button
                    onClick={() => onAcknowledge(incident.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 active:bg-amber-700 border border-amber-400 shadow-md shadow-amber-900/30 transition cursor-pointer"
                    title="Click to acknowledge incident (ACTIVE → ACKNOWLEDGED)"
                  >
                    <Check className="w-4 h-4" />
                    <span>Acknowledge</span>
                  </button>
                )}

                {/* 2. When ACKNOWLEDGED: Show only Mark as Resolved button */}
                {isAcknowledged && (
                  <button
                    onClick={() => onResolve(incident.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border border-emerald-400 shadow-md shadow-emerald-900/30 transition cursor-pointer"
                    title="Click to resolve incident (ACKNOWLEDGED → RESOLVED)"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Resolved</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
