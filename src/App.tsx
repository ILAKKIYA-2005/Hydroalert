import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initialZones, initialActiveIncidents, initialHistoryIncidents, LEAKAGE_THRESHOLD } from './data/mockData';
import { Incident, MonitoringZone, UserSession, LeakageStatus } from './types';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { ActiveIncidentsSection } from './components/ActiveIncidentsSection';
import { IncidentHistorySection } from './components/IncidentHistorySection';
import { LeakageAlertNotification, LeakageAlertData } from './components/LeakageAlertNotification';
import {
  fetchFlowReadings,
  simulateFlowOnBackend,
  fetchActiveIncidents,
  fetchIncidentHistory,
  acknowledgeIncidentApi,
  resolveIncidentApi,
  postFlowReading,
  checkBackendConnection,
  getStoredUserSession,
  setStoredUserSession,
  setAuthToken,
} from './services/api';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { playAlertSound } from './utils/audioAlert';

export default function App() {
  // Session State (restored from JWT session if active)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => getStoredUserSession());

  // Application Data State: 3 locations
  const [zones, setZones] = useState<MonitoringZone[]>(initialZones);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-b');
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>(initialActiveIncidents);
  const [history, setHistory] = useState<Incident[]>(initialHistoryIncidents);

  // Spring Boot REST Backend Connection State
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  // Simulation Active state
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Active Navigation Tab: 'dashboard' | 'active-incidents' | 'history'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'active-incidents' | 'history'>('dashboard');

  // Step 4: Instant Leakage Alert State
  const [instantAlert, setInstantAlert] = useState<LeakageAlertData | null>(null);
  const alertedIncidentsRef = useRef<Set<string | number>>(new Set());

  // Notification Sound Mute state (persisted in localStorage)
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hydroalert_sound_muted') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSoundMute = () => {
    setIsSoundMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('hydroalert_sound_muted', String(next));
      } catch {
        // local storage not available
      }
      return next;
    });
  };

  // Browser Notification Permission State
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  // Notification Toast state for status flow confirmations
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'alert' | 'success' } | null>(null);

  // Keep a ref to activeIncidents so callbacks/timers access the latest state without tearing
  const activeIncidentsRef = useRef<Incident[]>(activeIncidents);
  useEffect(() => {
    activeIncidentsRef.current = activeIncidents;
  }, [activeIncidents]);

  // Check browser notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const showToast = (text: string, type: 'alert' | 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Helper: Format current time (e.g., "10:32 PM")
  const getFormattedTime = () => {
    const d = new Date();
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Step 4: Trigger Instant Leakage Alert
  const triggerInstantAlert = (alertData: LeakageAlertData) => {
    setInstantAlert(alertData);
    alertedIncidentsRef.current.add(alertData.incidentId);

    // Requirement 1 & 2: Play short alert sound only for new alerts if not muted
    if (!isSoundMuted) {
      playAlertSound();
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      const showNativeNotif = () => {
        try {
          new Notification('🚨 WATER LEAKAGE ALERT', {
            body: `Location: ${alertData.location}\nFlow Rate: ${alertData.flowRate.toFixed(1)} L/min\nDetection Time: ${alertData.detectionTime}\nStatus: ACTIVE`,
            tag: `leakage-${alertData.location}`,
          });
        } catch (e) {
          console.warn('Native notification failed:', e);
        }
      };

      if (Notification.permission === 'granted') {
        showNativeNotif();
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          setNotifPermission(perm);
          if (perm === 'granted') {
            showNativeNotif();
          }
        });
      }
    }
  };

  // Request browser notification permission explicitly
  const handleRequestNotificationPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setNotifPermission(perm);
        if (perm === 'granted') {
          showToast('Browser notifications enabled for real-time leakage alerts.', 'success');
        } else {
          showToast('Browser notifications were not enabled.', 'alert');
        }
      });
    } else {
      showToast('Browser notifications are not supported in this browser.', 'alert');
    }
  };

  // Synchronization with Spring Boot Backend REST APIs
  const syncWithBackend = useCallback(async () => {
    const isOnline = await checkBackendConnection();
    setBackendConnected(isOnline);

    if (!isOnline) return false;

    try {
      // 1. Fetch water flow readings from Spring Boot (MySQL)
      const readings = await fetchFlowReadings();
      if (Array.isArray(readings) && readings.length > 0) {
        setZones((prev) =>
          prev.map((zone) => {
            const match = readings.find((r) => r.location === zone.location);
            if (!match) return zone;
            return {
              ...zone,
              flowRate: match.flowRate,
              status: match.status as LeakageStatus,
              lastUpdated: match.timestamp || 'Just now',
            };
          })
        );
      }

      // 2. Fetch active incidents from Spring Boot (MySQL)
      const backendActive = await fetchActiveIncidents();
      if (Array.isArray(backendActive)) {
        setActiveIncidents(backendActive);

        // Check if there is an ACTIVE incident that needs immediate user alert
        const unalerted = backendActive.find(
          (inc) => inc.status === 'ACTIVE' && !alertedIncidentsRef.current.has(inc.id)
        );
        if (unalerted) {
          triggerInstantAlert({
            incidentId: String(unalerted.id),
            location: unalerted.location,
            flowRate: unalerted.flowRate,
            detectionTime: unalerted.detectionTime || getFormattedTime(),
            status: 'ACTIVE',
          });
        }
      }

      // 3. Fetch resolved incidents from Spring Boot (MySQL)
      const backendHistory = await fetchIncidentHistory();
      if (Array.isArray(backendHistory)) {
        setHistory(backendHistory);
      }

      return true;
    } catch (err: any) {
      if (err?.message === 'UNAUTHORIZED') {
        setAuthToken(null);
        setStoredUserSession(null);
        setCurrentUser(null);
        showToast('JWT session expired or invalid. Please sign in again.', 'alert');
        return false;
      }
      console.warn('Backend sync failed, falling back to local state:', err);
      return false;
    }
  }, []);

  // Initial sync attempt when app mounts
  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Periodic Telemetry Simulation & Leakage Detection Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(async () => {
      // If Spring Boot backend is connected, use backend simulation endpoint
      if (backendConnected) {
        try {
          await simulateFlowOnBackend();
          await syncWithBackend();
          return;
        } catch {
          // If backend fails during loop, fall back to frontend simulation seamlessly
          setBackendConnected(false);
        }
      }

      // Fallback: Local real-time simulation if Spring Boot is not running locally
      setZones((prevZones) => {
        const targetIndex = Math.floor(Math.random() * prevZones.length);
        const valuePool = [2.5, 3.0, 3.5, 5.0, 3.0, 2.5, 3.5, 8.5, 9.5];
        const nextValue = valuePool[Math.floor(Math.random() * valuePool.length)];

        return prevZones.map((zone, idx) => {
          if (idx !== targetIndex) {
            const microJitter = (Math.random() - 0.5) * 0.1;
            const updatedRate = Math.max(2.0, Number((zone.flowRate + microJitter).toFixed(1)));
            const status: LeakageStatus = updatedRate >= LEAKAGE_THRESHOLD ? 'Possible Leakage' : 'Normal';
            return {
              ...zone,
              flowRate: updatedRate,
              status,
              lastUpdated: 'Just now',
            };
          }

          const newRate = nextValue;
          const newStatus: LeakageStatus = newRate >= LEAKAGE_THRESHOLD ? 'Possible Leakage' : 'Normal';
          const currentActive = activeIncidentsRef.current.find((i) => i.location === zone.location);

          // CASE 1: Flow rate 8.0 L/min or above -> Possible Leakage
          if (newRate >= LEAKAGE_THRESHOLD) {
            if (!currentActive) {
              const timeString = getFormattedTime();
              const newIncId = `INC-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;

              const newIncident: Incident = {
                id: newIncId,
                zoneId: zone.id,
                location: zone.location,
                flowRate: newRate,
                detectionTime: timeString,
                status: 'ACTIVE',
                severity: 'Critical',
                notes: `Threshold breach: ${newRate} L/min (>= ${LEAKAGE_THRESHOLD.toFixed(1)} L/min). Possible Leakage detected.`,
              };

              setActiveIncidents((prev) => [newIncident, ...prev]);

              triggerInstantAlert({
                incidentId: newIncId,
                location: zone.location,
                flowRate: newRate,
                detectionTime: timeString,
                status: 'ACTIVE',
              });
            } else {
              setActiveIncidents((prev) =>
                prev.map((i) =>
                  i.location === zone.location ? { ...i, flowRate: newRate } : i
                )
              );
            }
          }
          // CASE 2: Flow returns below 8.0 L/min -> Normal
          else if (newRate < LEAKAGE_THRESHOLD && currentActive) {
            const timeStr = getFormattedTime();
            const resolvedInc: Incident = {
              ...currentActive,
              status: 'RESOLVED',
              resolvedTime: timeStr,
              resolvedAt: timeStr,
              notes: `Flow stabilized below 8.0 L/min (${newRate.toFixed(1)} L/min). Automatically moved to Incident History.`,
            };
            setActiveIncidents((prev) => prev.filter((i) => i.id !== currentActive.id));
            setHistory((prev) => [resolvedInc, ...prev]);

            if (instantAlert && instantAlert.incidentId === currentActive.id) {
              setInstantAlert(null);
            }
            showToast(`Flow normalized at ${zone.location} (${newRate} L/min). Incident moved to History.`, 'success');
          }

          return {
            ...zone,
            flowRate: newRate,
            status: newStatus,
            lastUpdated: 'Just now',
          };
        });
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulating, backendConnected, syncWithBackend, instantAlert]);

  // Step 5: Send Acknowledge Request (ACTIVE -> ACKNOWLEDGED)
  const handleAcknowledge = async (incidentId: string | number) => {
    const timestamp = getFormattedTime();

    if (backendConnected) {
      try {
        const updated = await acknowledgeIncidentApi(incidentId);
        setActiveIncidents((prev) =>
          prev.map((inc) => (inc.id === incidentId ? updated : inc))
        );
        showToast(`Incident #${incidentId} acknowledged in MySQL database via Spring Boot.`, 'success');
      } catch (err: any) {
        console.error('Error acknowledging on backend:', err);
        // Local fallback
        setActiveIncidents((prev) =>
          prev.map((inc) =>
            inc.id === incidentId
              ? { ...inc, status: 'ACKNOWLEDGED', acknowledgedTime: timestamp, acknowledgedAt: timestamp }
              : inc
          )
        );
        showToast(`Incident #${incidentId} acknowledged (local mode).`, 'success');
      }
    } else {
      setActiveIncidents((prev) =>
        prev.map((inc) =>
          inc.id === incidentId
            ? { ...inc, status: 'ACKNOWLEDGED', acknowledgedTime: timestamp, acknowledgedAt: timestamp }
            : inc
        )
      );
      showToast(`Incident #${incidentId} acknowledged by operator.`, 'success');
    }

    if (instantAlert && String(instantAlert.incidentId) === String(incidentId)) {
      setInstantAlert(null);
    }
  };

  // Step 5: Send Resolve Request (ACKNOWLEDGED -> RESOLVED)
  const handleResolve = async (incidentId: string | number) => {
    const timestamp = getFormattedTime();
    const targetInc = activeIncidents.find((i) => i.id === incidentId);

    if (backendConnected) {
      try {
        const resolved = await resolveIncidentApi(incidentId);
        setActiveIncidents((prev) => prev.filter((i) => i.id !== incidentId));
        setHistory((prev) => [resolved, ...prev]);

        // Reset zone flow rate in state
        if (targetInc) {
          setZones((prev) =>
            prev.map((z) =>
              z.location === targetInc.location
                ? { ...z, status: 'Normal', flowRate: 3.0, lastUpdated: 'Just now' }
                : z
            )
          );
        }

        showToast(`Incident #${incidentId} marked as RESOLVED and saved in MySQL history.`, 'success');
      } catch (err: any) {
        console.error('Error resolving on backend:', err);
        if (targetInc) {
          const resolvedInc: Incident = {
            ...targetInc,
            status: 'RESOLVED',
            resolvedTime: timestamp,
            resolvedAt: timestamp,
            notes: targetInc.notes || 'Manually resolved by operator intervention.',
          };
          setActiveIncidents((prev) => prev.filter((i) => i.id !== incidentId));
          setHistory((prev) => [resolvedInc, ...prev]);
        }
        showToast(`Incident #${incidentId} marked as RESOLVED (local mode).`, 'success');
      }
    } else {
      if (targetInc) {
        const resolvedInc: Incident = {
          ...targetInc,
          status: 'RESOLVED',
          resolvedTime: timestamp,
          resolvedAt: timestamp,
          notes: targetInc.notes || 'Manually resolved by operator intervention.',
        };
        setActiveIncidents((prev) => prev.filter((i) => i.id !== incidentId));
        setHistory((prev) => [resolvedInc, ...prev]);

        setZones((prev) =>
          prev.map((z) =>
            z.location === targetInc.location
              ? { ...z, status: 'Normal', flowRate: 3.0, lastUpdated: 'Just now' }
              : z
          )
        );
      }
      showToast(`Incident #${incidentId} marked as RESOLVED and moved to History.`, 'success');
    }

    if (instantAlert && String(instantAlert.incidentId) === String(incidentId)) {
      setInstantAlert(null);
    }
  };

  // Manual Trigger: Simulate Leakage in a selected zone
  const handleSimulateLeakage = async (zoneId: string) => {
    const targetZone = zones.find((z) => z.id === zoneId);
    if (!targetZone) return;

    const leakageValues = [8.5, 9.5];
    const spikedRate = leakageValues[Math.floor(Math.random() * leakageValues.length)];
    const timeString = getFormattedTime();

    if (backendConnected) {
      try {
        await postFlowReading(targetZone.location, spikedRate);
        await syncWithBackend();
        showToast(`Spiked ${targetZone.location} to ${spikedRate} L/min via Spring Boot REST API.`, 'alert');
        return;
      } catch (err) {
        console.warn('Backend call failed, triggering locally:', err);
      }
    }

    // Local simulation fallback
    const newIncId = `INC-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;

    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId
          ? { ...z, status: 'Possible Leakage', flowRate: spikedRate, lastUpdated: 'Just now' }
          : z
      )
    );

    setActiveIncidents((prev) => {
      const exists = prev.some((i) => i.location === targetZone.location);
      if (exists) {
        return prev.map((i) =>
          i.location === targetZone.location ? { ...i, flowRate: spikedRate } : i
        );
      }

      return [
        {
          id: newIncId,
          zoneId: zoneId,
          location: targetZone.location,
          flowRate: spikedRate,
          detectionTime: timeString,
          status: 'ACTIVE',
          severity: 'Critical',
          notes: `Simulated flow spike: ${spikedRate} L/min (breached ${LEAKAGE_THRESHOLD.toFixed(1)} L/min threshold).`,
        },
        ...prev,
      ];
    });

    triggerInstantAlert({
      incidentId: newIncId,
      location: targetZone.location,
      flowRate: spikedRate,
      detectionTime: timeString,
      status: 'ACTIVE',
    });
  };

  // Manual Trigger: Reset zone flow to normal
  const handleResetZoneFlow = async (zoneId: string) => {
    const targetZone = zones.find((z) => z.id === zoneId);
    if (!targetZone) return;

    const normalValues = [2.5, 3.0, 3.5];
    const resetFlow = normalValues[Math.floor(Math.random() * normalValues.length)];

    if (backendConnected) {
      try {
        await postFlowReading(targetZone.location, resetFlow);
        await syncWithBackend();
        showToast(`Normalized ${targetZone.location} to ${resetFlow} L/min via Spring Boot.`, 'success');
        return;
      } catch (err) {
        console.warn('Backend reset call failed, falling back locally:', err);
      }
    }

    setZones((prev) =>
      prev.map((z) => {
        if (z.id === zoneId) {
          return {
            ...z,
            status: 'Normal',
            flowRate: resetFlow,
            lastUpdated: 'Just now',
          };
        }
        return z;
      })
    );

    const activeForZone = activeIncidents.find((i) => i.location === targetZone.location);
    if (activeForZone) {
      const timeStr = getFormattedTime();
      const resolvedInc: Incident = {
        ...activeForZone,
        status: 'RESOLVED',
        resolvedTime: timeStr,
        resolvedAt: timeStr,
        notes: `Manual reset: flow restored to ${resetFlow} L/min.`,
      };
      setActiveIncidents((prev) => prev.filter((i) => i.id !== activeForZone.id));
      setHistory((prev) => [resolvedInc, ...prev]);
    }

    if (instantAlert && activeForZone && String(instantAlert.incidentId) === String(activeForZone.id)) {
      setInstantAlert(null);
    }

    showToast(`Flow normalized at ${targetZone.location} to ${resetFlow} L/min.`, 'success');
  };

  // If user is not authenticated, show Login Page
  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  const hasCriticalAlert = activeIncidents.some((i) => i.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar with Spring Boot REST Backend Status Badge */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCount={activeIncidents.length}
        hasCriticalAlert={hasCriticalAlert}
        onLogout={() => {
          setAuthToken(null);
          setStoredUserSession(null);
          setCurrentUser(null);
          showToast('Signed out successfully. Token cleared.', 'success');
        }}
        backendConnected={backendConnected}
        onRetryBackend={syncWithBackend}
        isSoundMuted={isSoundMuted}
        onToggleMute={toggleSoundMute}
      />

      {/* Step 4: Instant Leakage Alert Notification Component */}
      {instantAlert && (
        <LeakageAlertNotification
          alert={instantAlert}
          onAcknowledge={handleAcknowledge}
          onDismiss={() => setInstantAlert(null)}
          isSoundMuted={isSoundMuted}
          onToggleMute={toggleSoundMute}
        />
      )}

      {/* Secondary Confirmation Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div
            className={`p-3.5 rounded-xl border shadow-2xl flex items-start gap-2.5 ${
              toastMessage.type === 'alert'
                ? 'bg-rose-950/95 border-rose-500 text-rose-100 ring-2 ring-rose-500/30'
                : 'bg-emerald-950/95 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/30'
            }`}
          >
            {toastMessage.type === 'alert' ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs font-medium leading-snug">
              {toastMessage.text}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            zones={zones}
            selectedZoneId={selectedZoneId}
            onSelectZone={setSelectedZoneId}
            activeIncidents={activeIncidents}
            history={history}
            onAcknowledgeIncident={handleAcknowledge}
            onResolveIncident={handleResolve}
            onSimulateLeakage={handleSimulateLeakage}
            onResetZoneFlow={handleResetZoneFlow}
            onNavigateToHistory={() => setActiveTab('history')}
            isSimulating={isSimulating}
            onToggleSimulation={() => setIsSimulating((prev) => !prev)}
          />
        )}

        {activeTab === 'active-incidents' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-rose-400" />
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Active Incident Queue
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Manage unacknowledged anomalies and ongoing water pipe leak incidents.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                  Total Active: <strong className="text-white">{activeIncidents.length}</strong>
                </span>
              </div>
            </div>

            <ActiveIncidentsSection
              incidents={activeIncidents}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <IncidentHistorySection history={history} />
        )}
      </main>

      {/* College Project Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            HydroAlert – Full-Stack Real-Time Water Leakage Detection (React + TypeScript + Spring Boot + MySQL)
          </span>
          <span className="text-slate-400">
            College Final-Year Project Demonstration
          </span>
        </div>
      </footer>
    </div>
  );
}
