import React from 'react';
import {
  AlertTriangle,
  X,
  Check,
  Droplets,
  MapPin,
  Clock,
  Activity,
  Volume2,
  VolumeX,
} from 'lucide-react';

export interface LeakageAlertData {
  incidentId: string | number;
  location: string;
  flowRate: number;
  detectionTime: string;
  status: 'ACTIVE';
}

interface LeakageAlertNotificationProps {
  alert: LeakageAlertData;
  onAcknowledge: (incidentId: string | number) => void;
  onDismiss: () => void;
  isSoundMuted?: boolean;
  onToggleMute?: () => void;
}

export const LeakageAlertNotification: React.FC<LeakageAlertNotificationProps> = ({
  alert,
  onAcknowledge,
  onDismiss,
  isSoundMuted = false,
  onToggleMute,
}) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-rose-950/95 border-2 border-rose-500 rounded-2xl p-5 shadow-2xl backdrop-blur-md ring-4 ring-rose-500/20 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-bounce">🚨</span>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                <span>WATER LEAKAGE ALERT</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                  CRITICAL
                </span>
              </h3>
              <p className="text-xs text-rose-200 mt-0.5">
                Possible water leakage has been detected!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Small Mute / Unmute Speaker Button in Notification Area */}
            {onToggleMute && (
              <button
                onClick={onToggleMute}
                className="text-rose-200 hover:text-white p-1.5 rounded-lg hover:bg-rose-900/60 transition cursor-pointer"
                title={isSoundMuted ? 'Alert sound muted - Click to unmute' : 'Alert sound active - Click to mute'}
                aria-label={isSoundMuted ? 'Unmute alert sound' : 'Mute alert sound'}
              >
                {isSoundMuted ? (
                  <VolumeX className="w-5 h-5 text-rose-300" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            )}

            {/* Dismiss / Close Button */}
            <button
              onClick={onDismiss}
              className="text-rose-300 hover:text-white p-1.5 rounded-lg hover:bg-rose-900/60 transition cursor-pointer"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Incident Details Card */}
        <div className="mt-4 bg-slate-900/90 border border-rose-500/40 rounded-xl p-3.5 space-y-2 text-xs sm:text-sm font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Location:
            </span>
            <span className="font-bold text-white text-right">
              {alert.location}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              Flow Rate:
            </span>
            <span className="font-extrabold text-rose-400 font-mono text-base">
              {alert.flowRate.toFixed(1)} L/min
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Detection Time:
            </span>
            <span className="font-semibold text-slate-200 font-mono">
              {alert.detectionTime}
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              Status:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600/30 text-rose-300 border border-rose-500/60 uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              {alert.status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2.5 justify-end">
          <button
            onClick={onDismiss}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-200 hover:text-white bg-rose-900/40 hover:bg-rose-900/80 border border-rose-700/60 transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => onAcknowledge(alert.incidentId)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 border border-rose-400 shadow-lg shadow-rose-950/50 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Acknowledge Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
