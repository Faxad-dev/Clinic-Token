import React, { useState, useEffect } from 'react';
import { PatientToken, HospitalQueueState } from '../../types';
import { queueService } from '../../services/queueStore';
import { soundEngine } from '../AudioChime';
import { 
  Tv2, 
  Clock, 
  MapPin, 
  Bell, 
  BellRing, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  Search, 
  Users, 
  ArrowRight,
  Sparkles,
  Calendar,
  Radio,
  Activity,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface LiveTokenTrackerProps {
  initialToken: PatientToken | null;
  onSelectToken: (token: PatientToken) => void;
  onBookNew: () => void;
}

export const LiveTokenTracker: React.FC<LiveTokenTrackerProps> = ({
  initialToken,
  onSelectToken,
  onBookNew,
}) => {
  const [queueState, setQueueState] = useState<HospitalQueueState>(queueService.getState());
  const [activeTokenId, setActiveTokenId] = useState<string>(initialToken?.id || '');
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [hasAlertedUrgent, setHasAlertedUrgent] = useState<boolean>(false);
  const [lastAnnouncedServing, setLastAnnouncedServing] = useState<number | null>(null);

  // Subscribe to live queue state
  useEffect(() => {
    const unsub = queueService.subscribe((state) => {
      setQueueState({ ...state });
    });
    return () => unsub();
  }, []);

  // Update active token if initialToken changes
  useEffect(() => {
    if (initialToken) {
      setActiveTokenId(initialToken.id);
    } else {
      // Default to demo patient (TK-014) if none selected
      const defaultToken = queueState.tokens.find((t) => t.tokenDisplay === 'TK-014') || queueState.tokens[0];
      if (defaultToken) {
        setActiveTokenId(defaultToken.id);
      }
    }
  }, [initialToken]);

  const currentToken = queueState.tokens.find((t) => t.id === activeTokenId);
  const doctor = currentToken ? queueState.doctors.find((d) => d.id === currentToken.doctorId) : null;
  const waitInfo = currentToken ? queueService.calculatePatientWaitInfo(currentToken) : null;
  const doctorQueue = doctor ? queueService.getDoctorQueue(doctor.id) : null;

  // Sound notification trigger when patient is 2 tokens away or called
  useEffect(() => {
    if (!currentToken || !waitInfo) return;

    // If token is in-progress (called right now!)
    if (waitInfo.status === 'in-progress' && lastAnnouncedServing !== currentToken.tokenNumber) {
      soundEngine.playTokenCallChime();
      setLastAnnouncedServing(currentToken.tokenNumber);
    } else if (waitInfo.isClose && !hasAlertedUrgent && waitInfo.status === 'waiting') {
      // 2 tokens away notification chime
      soundEngine.playUrgentAlertChime();
      setHasAlertedUrgent(true);
    }
  }, [waitInfo?.currentServingNumber, waitInfo?.status, currentToken?.id]);

  // Lookup token handler
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const clean = lookupQuery.trim().toUpperCase();
    if (!clean) return;

    const found = queueState.tokens.find(
      (t) =>
        t.tokenDisplay === clean ||
        String(t.tokenNumber) === clean ||
        t.patientPhone.includes(clean) ||
        t.patientName.toLowerCase().includes(clean.toLowerCase())
    );

    if (found) {
      setActiveTokenId(found.id);
      onSelectToken(found);
      setLookupQuery('');
      setLookupError(null);
    } else {
      setLookupError(`Token record "${lookupQuery}" not found in current OPD records. Please verify your token number (e.g. TK-014) or contact the reception desk.`);
    }
  };

  // Circular progress calculation
  const calculateQueueProgress = () => {
    if (!currentToken || !doctorQueue) return 0;
    if (currentToken.status === 'completed') return 100;
    if (currentToken.status === 'in-progress') return 100;

    const totalBeforeMe = currentToken.tokenNumber;
    const servedSoFar = doctorQueue.currentServingNumber;
    if (totalBeforeMe <= 0) return 100;

    const progress = Math.min(95, Math.max(5, (servedSoFar / totalBeforeMe) * 100));
    return Math.round(progress);
  };

  const progressPercent = calculateQueueProgress();

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-[#030712] text-white">
      {/* Tracker Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"></span>
            </span>
            <span>Real-Time Telemetry Radar Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] leading-[1.15]">
            Live Queue &amp; Token Status
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Sub-second synchronization with doctor chamber telemetry consoles. Instant acoustic chimes and proximity threshold alerts.
          </p>
        </div>

        {/* Quick Search / Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <form onSubmit={handleLookup} className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Track token (e.g. TK-014)..."
              className="w-full pl-9 pr-16 py-2.5 rounded-xl bg-[#070d19] border border-blue-900/40 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[44px] px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.3)] micro-spring flex items-center justify-center"
            >
              Track
            </button>
          </form>

          <button
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('aura:trigger-3spot-alert', {
                  detail: { token: currentToken },
                })
              );
            }}
            title="Simulate 3-spots-away proximity alert (Toast & Modal)"
            className="min-h-[44px] min-w-[44px] p-2.5 sm:px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 transition-all flex items-center justify-center gap-1.5 text-xs font-mono cursor-pointer shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-semibold micro-spring"
          >
            <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="hidden sm:inline">Simulate 3-Spot Alert</span>
          </button>

          <button
            onClick={() => soundEngine.playTokenCallChime()}
            title="Test announcement audio chime"
            className="min-h-[44px] min-w-[44px] p-2.5 sm:px-3 rounded-xl bg-[#081026] hover:bg-[#0e1b3d] border border-blue-500/40 text-cyan-300 transition-all flex items-center justify-center gap-1.5 text-xs font-mono cursor-pointer shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.25)] font-medium micro-spring"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Test Chime</span>
          </button>
        </div>
      </div>

      {/* Lookup Error Banner */}
      {lookupError && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3 animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-mono font-bold uppercase tracking-wider text-rose-300 bg-rose-900/60 px-1.5 py-0.5 rounded mr-2 text-[10px]">
                DATA NOT FOUND
              </span>
              <span>{lookupError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLookupError(null)}
            className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-900/40 transition-colors"
            title="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tracker Cockpit */}
      {currentToken && waitInfo && doctor ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Illuminated Circular Queue Gauge */}
          <div className="lg:col-span-7 rounded-3xl bg-[#070d19]/90 border border-blue-500/25 p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col justify-between group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Urgency Notification Banner */}
            {waitInfo.status === 'in-progress' ? (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400/60 text-emerald-200 flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse">
                <BellRing className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-white tracking-wide uppercase font-mono">
                    YOUR TOKEN HAS BEEN CALLED!
                  </div>
                  <div className="text-xs text-emerald-300 mt-0.5">
                    Please step into <strong className="text-white underline">{doctor.chamberNumber}</strong> immediately for consultation with {doctor.name}.
                  </div>
                </div>
              </div>
            ) : waitInfo.isClose ? (
              <div className="mb-6 p-4 rounded-2xl bg-amber-950/70 border border-amber-400/60 text-amber-200 flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-pulse">
                <Bell className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider text-amber-300 font-mono">
                    Proximity Radar Alert • Almost Your Turn
                  </div>
                  <div className="text-xs text-amber-200 mt-0.5">
                    You are only <strong className="text-white">{waitInfo.peopleAhead}</strong> patient{waitInfo.peopleAhead > 1 ? 's' : ''} away! Please move to the lobby outside <strong className="text-white">{doctor.chamberNumber}</strong>.
                  </div>
                </div>
              </div>
            ) : null}

            {/* Token Info Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-blue-900/30">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-semibold block">
                  Active Tracked Token
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                  {currentToken.tokenDisplay}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">
                  Patient Profile
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {currentToken.patientName} <span className="text-slate-400 font-mono text-xs">({currentToken.patientAge}y, {currentToken.patientGender})</span>
                </span>
              </div>
            </div>

            {/* Illuminated Token Ring Gauge with Radar Sweep Effect */}
            <div className="my-8 flex flex-col items-center justify-center relative">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                {/* Radar Grid Circles Behind Gauge */}
                <div className="absolute inset-4 rounded-full border border-blue-500/10 pointer-events-none" />
                <div className="absolute inset-12 rounded-full border border-blue-500/15 pointer-events-none" />
                <div className="absolute inset-20 rounded-full border border-blue-500/20 pointer-events-none" />

                {/* Rotating Conic Radar Sweep Beam */}
                <div 
                  className={`absolute inset-4 rounded-full pointer-events-none opacity-40 ${
                    waitInfo.status === 'in-progress' ? 'radar-sweep-emerald' : 'radar-sweep-cone'
                  }`}
                  aria-hidden="true"
                />

                {/* SVG Ring with Bio-Luminescent Glow */}
                <svg className="w-full h-full -rotate-90 transform relative z-10" viewBox="0 0 200 200">
                  {/* Outer Dark Track Ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r="84"
                    stroke="#0b1730"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* High-Contrast Radar Tick Marks */}
                  <circle
                    cx="100"
                    cy="100"
                    r="72"
                    stroke="rgba(59, 130, 246, 0.15)"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                    fill="transparent"
                  />
                  {/* Progress Arc with Bio-Glow */}
                  <circle
                    cx="100"
                    cy="100"
                    r="84"
                    stroke={
                      waitInfo.status === 'in-progress'
                        ? '#10b981'
                        : waitInfo.isClose
                        ? '#f59e0b'
                        : '#3b82f6'
                    }
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 84}
                    strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{
                      filter: waitInfo.status === 'in-progress'
                        ? 'drop-shadow(0 0 14px rgba(16, 185, 129, 0.85))'
                        : waitInfo.isClose
                        ? 'drop-shadow(0 0 14px rgba(245, 158, 11, 0.85))'
                        : 'drop-shadow(0 0 14px rgba(59, 130, 246, 0.85))',
                      transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  />
                </svg>

                {/* Center Gauge Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-20">
                  <span className="text-[10px] uppercase font-mono text-cyan-400 tracking-widest font-bold">
                    Queue Position
                  </span>
                  <div className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight my-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] leading-[1.15]">
                    {waitInfo.status === 'in-progress' ? 'CALLING' : `#${currentToken.tokenNumber}`}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#081329] text-xs font-mono text-slate-300 mt-1 border border-blue-500/40 shadow-inner">
                    <span className="text-slate-400">Serving:</span>
                    <strong className="text-emerald-400 font-bold font-mono">
                      TK-{String(waitInfo.currentServingNumber).padStart(3, '0')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-4 text-center max-w-md">
                <p className="text-sm font-semibold text-white tracking-wide">{waitInfo.message}</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Telemetry Formula: (Patient Index − Serving Index) × Rolling Shift Average
                </p>
              </div>
            </div>

            {/* High-Contrast Metrics Bottom Row */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-6 border-t border-blue-900/30 text-center">
              <div className="p-2 sm:p-3.5 rounded-2xl bg-[#040813] border border-blue-900/40 shadow-inner min-w-0">
                <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400 block font-semibold tracking-wider truncate">Ahead</span>
                <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-cyan-400">
                  {waitInfo.peopleAhead}
                </span>
              </div>

              <div className="p-2 sm:p-3.5 rounded-2xl bg-[#040813] border border-blue-900/40 shadow-inner min-w-0">
                <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400 block font-semibold tracking-wider truncate">Est. Wait</span>
                <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-emerald-400">
                  {waitInfo.status === 'in-progress' ? '0m' : `~${waitInfo.estimatedMinutes}m`}
                </span>
              </div>

              <div className="p-2 sm:p-3.5 rounded-2xl bg-[#040813] border border-blue-900/40 shadow-inner min-w-0">
                <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400 block font-semibold tracking-wider truncate">Doctor Pace</span>
                <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-blue-400">
                  ~{doctor.avgConsultationMinutes}m
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Doctor Chamber Details & Live Clinic Queue Stream */}
          <div className="lg:col-span-5 space-y-6">
            {/* Doctor & Chamber Card */}
            <div className="p-6 rounded-3xl bg-[#070d19]/90 border border-blue-500/25 shadow-lg space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">Consulting Specialist</div>
                  <h3 className="text-lg font-bold text-white truncate">{doctor.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{doctor.specialization}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#040813] border border-blue-900/40 space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Chamber Location:
                  </span>
                  <span className="font-bold text-white text-sm bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-600/40">
                    {doctor.chamberNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Booked Shift:
                  </span>
                  <span className="font-semibold text-slate-200 capitalize font-sans">{currentToken.slotShift} Session</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Symptoms Noted:
                  </span>
                  <span className="font-medium text-slate-300 max-w-[180px] truncate font-sans">{currentToken.symptoms}</span>
                </div>
              </div>
            </div>

            {/* Live Queue Stream for this Doctor */}
            <div className="p-6 rounded-3xl bg-[#070d19]/90 border border-blue-500/25 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Live Chamber Queue Stream</h4>
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-medium">
                  {doctorQueue?.totalBooked || 0} Total Booked
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {/* Currently In-Progress */}
                {doctorQueue?.activeToken ? (
                  <div className="p-3 rounded-xl bg-blue-950/70 border border-blue-500/50 flex items-center justify-between shadow-[0_0_15px_rgba(59,130,246,0.25)]">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]"></span>
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white font-mono">
                          {doctorQueue.activeToken.tokenDisplay} • Inside Chamber
                        </div>
                        <div className="text-[11px] text-slate-300 truncate max-w-[150px]">
                          {doctorQueue.activeToken.patientName}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-600/40 text-cyan-300 font-bold border border-blue-400/40">
                      IN CONSULTATION
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#040813] border border-blue-900/30 text-center text-xs text-slate-400 font-medium">
                    Chamber currently ready for next patient call
                  </div>
                )}

                {/* Waiting Patients */}
                {doctorQueue?.waitingTokens.slice(0, 5).map((tok, idx) => {
                  const isMe = tok.id === currentToken.id;
                  return (
                    <div
                      key={tok.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        isMe
                          ? 'bg-[#0c1836] border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                          : 'bg-[#040813] border-blue-900/30 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#081329] text-cyan-400 border border-blue-700/50 font-mono text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold font-mono text-white">
                            {tok.tokenDisplay} {isMe && <span className="text-cyan-400 font-semibold">(YOU)</span>}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                            {tok.patientName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400">
                          ~{(idx + (doctorQueue.activeToken ? 1 : 0)) * doctor.avgConsultationMinutes}m wait
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Link */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  onClick={onBookNew}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer micro-spring"
                >
                  <span>Book Another Appointment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#070d19]/90 border border-blue-500/25 shadow-lg text-slate-400 space-y-4">
          <Tv2 className="w-12 h-12 text-blue-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Token Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please enter your token number (e.g. TK-014) in the search bar above, or book a fresh appointment from the patient portal.
          </p>
          <button
            onClick={onBookNew}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.35)] transition-all cursor-pointer micro-spring"
          >
            Book Appointment Now
          </button>
        </div>
      )}
    </div>
  );
};
