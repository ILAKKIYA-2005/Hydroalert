import React from 'react';
import { History, CheckCircle, Clock, Droplets, MapPin } from 'lucide-react';
import { Incident } from '../types';

interface IncidentHistoryProps {
  history: Incident[];
}

export const IncidentHistorySection: React.FC<IncidentHistoryProps> = ({ history }) => {
  return (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <History className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Incident History
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Log of resolved water leakage incidents with detection, acknowledgement, and resolution records.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
          Total Resolved: <strong className="text-white">{history.length}</strong>
        </div>
      </div>

      {/* History Display */}
      {history.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-12 text-center shadow-lg">
          <History className="w-10 h-10 mx-auto text-slate-500 mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Resolved Incidents Yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            When active leakage incidents are acknowledged and marked as resolved, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-4 sm:px-6">Location</th>
                  <th className="py-4 px-4">Flow Rate</th>
                  <th className="py-4 px-4">Detection Time</th>
                  <th className="py-4 px-4">Acknowledgement Time</th>
                  <th className="py-4 px-4">Resolution Time</th>
                  <th className="py-4 px-4 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {history.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-750/50 transition">
                    {/* 1. Location */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{incident.location}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 ml-5">
                        ID: {incident.id}
                      </div>
                    </td>

                    {/* 2. Flow Rate */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-bold text-sky-300 font-mono">
                        <Droplets className="w-3.5 h-3.5 text-sky-400" />
                        <span>{incident.flowRate.toFixed(1)} L/min</span>
                      </div>
                    </td>

                    {/* 3. Detection Time */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-slate-300 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{incident.detectionTime}</span>
                      </div>
                    </td>

                    {/* 4. Acknowledgement Time */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono text-slate-300">
                        {incident.acknowledgedTime || incident.acknowledgedAt || '—'}
                      </span>
                    </td>

                    {/* 5. Resolution Time */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono font-medium text-emerald-400">
                        {incident.resolvedTime || incident.resolvedAt || '—'}
                      </span>
                    </td>

                    {/* 6. Status */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>RESOLVED</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
