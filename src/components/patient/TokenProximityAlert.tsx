import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellRing, 
  MapPin, 
  Clock, 
  UserCheck, 
  ShieldAlert, 
  ChevronRight, 
  X, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Stethoscope,
  Maximize2,
  Minimize2,
  Radio
} from 'lucide-react';
import { PatientToken, HospitalQueueState, Doctor } from '../../types';
import { queueService } from '../../services/queueStore';
import { soundEngine } from '../AudioChime';

interface TokenProximityAlertProps {
  activeToken: PatientToken | null;
  onOpenTracker?: () => void;
}

export interface ProximityAlertData {
  token: PatientToken;
  doctor: Doctor;
  spotsAway: number;
  peopleAhead: number;
  estimatedMinutes: number;
  timestamp: number;
}

export const TokenProximityAlert: React.FC<TokenProximityAlertProps> = ({
  activeToken,
  onOpenTracker,
}) => {
  const [queueState, setQueueState] = useState<HospitalQueueState>(queueService.getState());
  const [alertData, setAlertData] = useState<ProximityAlertData | null>(null);
  const [displayMode, setDisplayMode] = useState<'toast' | 'modal' | 'closed'>('closed');
  const [isMuted, setIsMuted] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  
  // Track tokens that have already triggered the 3-spot notification to avoid annoying repeated spam
  const notifiedMilestonesRef = useRef<Set<string>>(new Set());

  // Subscribe to live queue state changes
  useEffect(() => {
    const unsub = queueService.subscribe((state) => {
      setQueueState({ ...state });
    });
    return () => unsub();
  }, []);

  // Monitor the active token for the exact 3-spots-away threshold
  useEffect(() => {
    if (!activeToken) return;

    // Fetch freshest token from queueState
    const current = queueState.tokens.find((t) => t.id === activeToken.id);
    if (!current || current.status !== 'waiting') return;

    const doctorTokens = queueState.tokens.filter((t) => t.doctorId === current.doctorId);
    const doctor = queueState.doctors.find((d) => d.id === current.doctorId);
    if (!doctor) return;

    // Filter and sort waiting list by exact priority and token order
    const waitingTokens = doctorTokens
      .filter((t) => t.status === 'waiting')
      .sort((a, b) => {
        if (a.isEmergencyPriority && !b.isEmergencyPriority) return -1;
        if (!a.isEmergencyPriority && b.isEmergencyPriority) return 1;
        return a.tokenNumber - b.tokenNumber;
      });

    const indexInWaiting = waitingTokens.findIndex((t) => t.id === current.id);
    if (indexInWaiting === -1) return;

    // index 0 -> 1st to be called (1 spot away)
    // index 1 -> 2nd to be called (2 spots away)
    // index 2 -> 3rd to be called (EXACTLY 3 spots away from being called!)
    const spotsAway = indexInWaiting + 1;

    // Threshold check: exactly 3 spots away
    const isExactlyThreeSpots = spotsAway === 3;
    const milestoneKey = `${current.id}-spots-3`;

    if (isExactlyThreeSpots && !notifiedMilestonesRef.current.has(milestoneKey)) {
      notifiedMilestonesRef.current.add(milestoneKey);

      const activeInConsultation = doctorTokens.find((t) => t.status === 'in-progress');
      const avgMins = doctor.avgConsultationMinutes || 9;
      const estimatedMinutes = Math.max(1, (spotsAway + (activeInConsultation ? 1 : 0)) * avgMins);

      const alertPayload: ProximityAlertData = {
        token: current,
        doctor,
        spotsAway: 3,
        peopleAhead: indexInWaiting,
        estimatedMinutes,
        timestamp: Date.now(),
      };

      setAlertData(alertPayload);
      setDisplayMode('toast'); // default to toast notification
      setHasAcknowledged(false);

      // Play alert chime
      if (!isMuted) {
        soundEngine.playUrgentAlertChime();
      }

      // Haptic feedback on supported mobile devices
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200, 100, 300]);
        } catch {
          // Ignore vibration errors if not permitted
        }
      }
    }
  }, [queueState, activeToken, isMuted]);

  // Listener for custom test/simulation events from simulator or tracker
  useEffect(() => {
    const handleSimulateAlert = (event: Event) => {
      const customEvent = event as CustomEvent<{ token?: PatientToken }>;
      const targetToken = customEvent.detail?.token || activeToken || queueState.tokens.find((t) => t.status === 'waiting') || queueState.tokens[0];
      if (!targetToken) return;

      const doctor = queueState.doctors.find((d) => d.id === targetToken.doctorId) || queueState.doctors[0];
      const avgMins = doctor?.avgConsultationMinutes || 9;

      const simulatedAlert: ProximityAlertData = {
        token: targetToken,
        doctor,
        spotsAway: 3,
        peopleAhead: 2,
        estimatedMinutes: 3 * avgMins,
        timestamp: Date.now(),
      };

      setAlertData(simulatedAlert);
      setDisplayMode('toast');
      setHasAcknowledged(false);

      if (!isMuted) {
        soundEngine.playUrgentAlertChime();
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch {}
      }
    };

    window.addEventListener('aura:trigger-3spot-alert', handleSimulateAlert);
    return () => window.removeEventListener('aura:trigger-3spot-alert', handleSimulateAlert);
  }, [activeToken, queueState, isMuted]);

  if (!alertData || displayMode === 'closed') {
    return null;
  }

  const { token, doctor, spotsAway, peopleAhead, estimatedMinutes } = alertData;

  return (
    <>
      {/* Toast Notification View */}
      <AnimatePresence>
        {displayMode === 'toast' && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-full"
            role="alert"
            aria-live="assertive"
          >
            <div className="relative rounded-2xl bg-[#030712]/95 backdrop-blur-2xl border-2 border-amber-400/80 p-5 shadow-[0_12px_50px_rgba(245,158,11,0.35)] text-white overflow-hidden ring-1 ring-amber-400/40">
              {/* Subtle Conic Radar Sweep */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full radar-sweep-cone opacity-20 pointer-events-none" />

              {/* Top Warning Ribbon */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-blue-900/30">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]"></span>
                  </span>
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-300 flex items-center gap-1.5">
                    <BellRing className="w-3.5 h-3.5 animate-bounce" />
                    Proximity Telemetry · 3 Spots Away
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (isMuted) {
                        soundEngine.playUrgentAlertChime();
                      }
                      setIsMuted(!isMuted);
                    }}
                    className="p-1 rounded-lg hover:bg-blue-950/60 text-slate-400 hover:text-white transition-colors cursor-pointer micro-spring"
                    title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
                    aria-label={isMuted ? 'Unmute alerts' : 'Mute alerts'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                  </button>
                  <button
                    onClick={() => setDisplayMode('closed')}
                    className="p-1 rounded-lg hover:bg-blue-950/60 text-slate-400 hover:text-white transition-colors cursor-pointer micro-spring"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex flex-col items-center justify-center text-amber-300 shrink-0 font-mono shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <span className="text-[9px] uppercase font-bold text-amber-200">Spot</span>
                  <span className="text-xl font-black leading-none text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">#3</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-cyan-300">
                      {token.tokenDisplay}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {token.patientName.split(' ')[0]}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Your token is <strong className="text-amber-300 font-semibold">exactly 3 spots away</strong> from being called by <span className="text-white font-medium">{doctor.name}</span>.
                  </p>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] font-mono text-slate-400 mt-2.5">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <MapPin className="w-3 h-3" />
                      <span>{doctor.chamberNumber}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Est. ~{estimatedMinutes} mins</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setDisplayMode('modal')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Open Chamber Pass (Modal)</span>
                </button>

                <div className="flex items-center gap-2">
                  {onOpenTracker && (
                    <button
                      onClick={() => {
                        onOpenTracker();
                        setDisplayMode('closed');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Track Live</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setDisplayMode('closed')}
                    className="px-2.5 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Got It
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Modal View */}
      <AnimatePresence>
        {displayMode === 'modal' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/90 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg rounded-3xl bg-[#030712] border-2 border-amber-400/80 p-5 sm:p-8 shadow-[0_20px_80px_rgba(245,158,11,0.35)] text-white max-h-[90dvh] overflow-y-auto my-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="proximity-alert-title"
            >
              {/* Radar Sweep Arc in Modal */}
              <div 
                className="absolute -top-20 -right-20 w-80 h-80 rounded-full radar-sweep-cone opacity-25 pointer-events-none"
                aria-hidden="true" 
              />

              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                    <BellRing className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold uppercase tracking-wider">
                        🚨 Urgent Notice
                      </span>
                      <span className="text-xs font-mono text-cyan-400">
                        OPD Chamber Telemetry
                      </span>
                    </div>
                    <h2 id="proximity-alert-title" className="text-xl sm:text-2xl font-black text-white mt-1">
                      You Are 3 Spots Away!
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setDisplayMode('toast')}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl bg-[#0a1428] hover:bg-[#112040] text-slate-300 hover:text-white transition-all cursor-pointer micro-spring border border-blue-900/40"
                    title="Switch to compact toast"
                    aria-label="Switch to compact toast"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDisplayMode('closed')}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl bg-[#0a1428] hover:bg-[#112040] text-slate-300 hover:text-white transition-all cursor-pointer micro-spring border border-blue-900/40"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Ticket Highlight Banner */}
              <div className="rounded-2xl bg-[#070c18] p-5 border border-blue-500/30 mb-6 relative z-10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-900/40">
                  <div>
                    <span className="text-xs text-slate-400 font-mono">Registered Patient</span>
                    <div className="text-base font-bold text-white">{token.patientName}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono">Assigned Token</span>
                    <div className="text-2xl font-black font-mono text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                      {token.tokenDisplay}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#03060f] border border-blue-900/40">
                    <span className="text-slate-400 block text-[10px] uppercase">Doctor &amp; Wing</span>
                    <span className="font-bold text-white truncate block mt-0.5">{doctor.name}</span>
                    <span className="text-cyan-400 text-[11px] block">{doctor.chamberNumber}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#03060f] border border-blue-900/40">
                    <span className="text-slate-400 block text-[10px] uppercase">Estimated Wait</span>
                    <span className="font-bold text-amber-400 text-lg block mt-0.5">~{estimatedMinutes} mins</span>
                    <span className="text-slate-400 text-[11px] block">{peopleAhead} patients ahead in queue</span>
                  </div>
                </div>
              </div>

              {/* Clinical Protocol Readiness Checklist */}
              <div className="space-y-3 mb-6 relative z-10">
                <div className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Immediate Preparation Protocol</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#070c18] border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Proceed towards the chamber area:</strong>
                      <p className="text-slate-400 mt-0.5">
                        Please make your way towards {doctor.chamberNumber}. Do not leave the hospital premises.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#070c18] border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Keep clinical papers ready:</strong>
                      <p className="text-slate-400 mt-0.5">
                        Have previous prescriptions, lab reports, and your hospital identification ready in hand.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#070c18] border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Stand by for final buzzer:</strong>
                      <p className="text-slate-400 mt-0.5">
                        When you are the next patient, your phone buzzer will trigger for direct chamber walk-in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
                <button
                  onClick={() => {
                    setHasAcknowledged(true);
                    setDisplayMode('toast');
                  }}
                  className="w-full sm:flex-1 min-h-[44px] py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 micro-spring"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>I'm Heading to Waiting Area</span>
                </button>

                {onOpenTracker && (
                  <button
                    onClick={() => {
                      onOpenTracker();
                      setDisplayMode('closed');
                    }}
                    className="w-full sm:w-auto min-h-[44px] px-5 py-3 rounded-xl bg-[#0a1428] hover:bg-[#112040] text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 micro-spring border border-blue-900/40"
                  >
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>View Live Radar</span>
                  </button>
                )}
              </div>

              {/* Sound Test / Preference Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <button
                  onClick={() => soundEngine.playUrgentAlertChime()}
                  className="min-h-[36px] hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Replay Audio Announcement Chime</span>
                </button>

                <button
                  onClick={() => setDisplayMode('closed')}
                  className="hover:text-slate-200 cursor-pointer"
                >
                  Dismiss Modal
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
