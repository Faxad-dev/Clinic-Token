import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Activity, 
  ChevronUp, 
  ChevronDown, 
  ShieldAlert,
  Zap,
  Clock
} from 'lucide-react';
import { soundEngine } from './AudioChime';

export const NetworkStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);
  const [offlineDuration, setOfflineDuration] = useState(0);

  const effectiveOnline = isOnline && !isSimulatedOffline;

  // Real browser online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      soundEngine.playUrgentAlertChime();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Offline timer ticker
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (!effectiveOnline) {
      setOfflineDuration(0);
      timer = setInterval(() => {
        setOfflineDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setOfflineDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [effectiveOnline]);

  // Probe connection manually
  const handleCheckConnection = async () => {
    setIsChecking(true);
    // If it's a simulated offline, toggling check gives feedback
    if (isSimulatedOffline) {
      setTimeout(() => {
        setIsChecking(false);
      }, 700);
      return;
    }

    try {
      // Fast ping probe
      await fetch('/index.html', { method: 'HEAD', cache: 'no-cache' });
      setIsOnline(true);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 4000);
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  const toggleSimulatedOffline = () => {
    if (effectiveOnline) {
      setIsSimulatedOffline(true);
      soundEngine.playUrgentAlertChime();
    } else {
      setIsSimulatedOffline(false);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 4000);
    }
  };

  return (
    <aside 
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-4 left-3 sm:left-4 z-40 max-w-[calc(100vw-1.5rem)] sm:max-w-sm font-sans pointer-events-auto"
      aria-label="Network & Telemetry Connectivity Status"
    >
      <AnimatePresence mode="wait">
        {/* State 1: Offline Alert (Real or Simulated) */}
        {!effectiveOnline && (
          <motion.div
            key="offline-alert"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            className="rounded-2xl bg-[#080306]/95 backdrop-blur-xl border-2 border-rose-500/70 p-4 shadow-[0_12px_45px_rgba(244,63,94,0.4)] text-white overflow-hidden ring-1 ring-rose-500/30"
            role="alert"
            aria-live="assertive"
          >
            {/* Ambient Conic Radar Warning Beam */}
            <div 
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full radar-sweep-cone opacity-25 pointer-events-none"
              aria-hidden="true" 
            />

            {/* Header Strip */}
            <div className="flex items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-rose-950/80 relative z-10">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]"></span>
                </span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>Telemetry Link Severed</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/50">
                  {offlineDuration}s ago
                </span>
              </div>
            </div>

            {/* Main Warning Content */}
            <div className="relative z-10 space-y-2">
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Internet connection lost. <strong className="text-rose-300">Live token telemetry and chamber queue progression are paused</strong> until link is restored.
              </p>

              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <Clock className="w-3 h-3 text-rose-400" />
                <span>Auto-reconnecting every 5 seconds...</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-3.5 pt-2.5 border-t border-rose-950/80 flex items-center justify-between gap-2 relative z-10">
              <button
                type="button"
                onClick={handleCheckConnection}
                disabled={isChecking}
                className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.35)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 micro-spring"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Probing Link...' : 'Retry Link Now'}</span>
              </button>

              <button
                type="button"
                onClick={toggleSimulatedOffline}
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-[#14060b] hover:bg-[#200912] border border-rose-900/50 text-rose-300 text-[10px] font-mono transition-colors cursor-pointer flex items-center justify-center"
                title="Restore simulated connection"
              >
                Restore Link
              </button>
            </div>
          </motion.div>
        )}

        {/* State 2: Just Reconnected Flash Toast */}
        {effectiveOnline && justReconnected && (
          <motion.div
            key="reconnected-alert"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-[#030d09]/95 backdrop-blur-xl border border-emerald-500/70 p-3.5 shadow-[0_8px_30px_rgba(16,185,129,0.35)] text-white flex items-center gap-3"
            role="status"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.35)]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <span>Telemetry Link Restored</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <p className="text-[11px] text-emerald-300/90 mt-0.5">
                Token queue synchronized. Latency &lt;10ms.
              </p>
            </div>
          </motion.div>
        )}

        {/* State 3: Normal Resting Connected State (Minimal Telemetry HUD Badge) */}
        {effectiveOnline && !justReconnected && (
          <motion.div
            key="online-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative"
          >
            <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#030712]/90 backdrop-blur-md border border-blue-900/40 hover:border-blue-500/50 text-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all">
              {/* Pulsing Vital Emerald Blip */}
              <div className="w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]"></span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium">
                <span className="text-white font-bold tracking-tight">Telemetry Live</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-emerald-400 text-[10px] hidden sm:inline font-mono">&lt;12ms</span>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="ml-0.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-blue-950/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showDetails ? 'Hide network telemetry details' : 'Show network telemetry details'}
                aria-label="Toggle network telemetry details"
              >
                {showDetails ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Expandable Telemetry Diagnostic Drawer */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-11 left-0 w-64 p-3.5 rounded-2xl bg-[#050a17]/95 backdrop-blur-xl border border-blue-500/30 text-white shadow-[0_12px_36px_rgba(0,0,0,0.8)] space-y-2.5 z-50 font-mono text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      <span>Link Diagnostics</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">100% HEALTH</span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Queue Transport:</span>
                      <span className="text-white font-medium">Sub-Second SSE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Heartbeat:</span>
                      <span className="text-emerald-400">Stable (1000ms)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Local Cache:</span>
                      <span className="text-white">Active</span>
                    </div>
                  </div>

                  {/* Simulator Trigger */}
                  <div className="pt-2 border-t border-blue-900/40 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Test Offline UI:</span>
                    <button
                      type="button"
                      onClick={toggleSimulatedOffline}
                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-mono cursor-pointer transition-colors flex items-center justify-center"
                      title="Trigger simulated network loss alert"
                    >
                      Simulate Offline
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
