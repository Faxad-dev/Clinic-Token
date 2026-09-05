import React, { useState, useEffect, useRef } from 'react';
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
  Calendar
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
  // Progress from 0 (just booked) to 100% (currently inside)
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
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Tracker Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/15 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Real-Time Live Telemetry Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Live Queue & Token Status
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time synchronization with doctor chamber consoles. Instant acoustic alerts upon queue progression.
          </p>
        </div>

        {/* Quick Search / Select Another Token */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleLookup} className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Track token (e.g. TK-014)..."
              className="w-full pl-9 pr-14 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-[10px] hover:bg-cyan-400 cursor-pointer"
            >
              Track
            </button>
          </form>

          <button
            onClick={() => soundEngine.playTokenCallChime()}
            title="Test announcement audio chime"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer shrink-0"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Test Chime</span>
          </button>
        </div>
      </div>

      {/* Lookup Error Banner */}
      {lookupError && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-mono font-bold uppercase tracking-wider text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded mr-2 text-[10px]">
                DATA NOT FOUND
              </span>
              <span>{lookupError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLookupError(null)}
            className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-900/50 transition-colors"
            title="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tracker Cockpit */}
      {currentToken && waitInfo && doctor ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Big Cybernetic Circular Queue Gauge */}
          <div className="lg:col-span-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col justify-between">
            {/* Ambient Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Urgency Notification Banner (if 2 tokens away or called) */}
            {waitInfo.status === 'in-progress' ? (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center gap-3 animate-pulse">
                <BellRing className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-white">YOUR TOKEN HAS BEEN CALLED!</div>
                  <div className="text-xs text-emerald-200">
                    Please step into <strong>{doctor.chamberNumber}</strong> immediately for consultation with {doctor.name}.
                  </div>
                </div>
              </div>
            ) : waitInfo.isClose ? (
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center gap-3 animate-pulse">
                <Bell className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider text-amber-200">
                    Proximity Alert • Almost Your Turn
                  </div>
                  <div className="text-xs text-amber-100">
                    You are only <strong>{waitInfo.peopleAhead}</strong> patient{waitInfo.peopleAhead > 1 ? 's' : ''} away! Please move to the waiting lobby outside <strong>{doctor.chamberNumber}</strong>.
                  </div>
                </div>
              </div>
            ) : null}

            {/* Token Info Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                  Active Tracked Token
                </span>
                <span className="text-2xl font-black font-mono text-cyan-300 tracking-wider">
                  {currentToken.tokenDisplay}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                  Patient Name
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {currentToken.patientName} ({currentToken.patientAge}y, {currentToken.patientGender})
                </span>
              </div>
            </div>

            {/* Futuristic Progress Ring Gauge */}
            <div className="my-8 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* SVG Ring */}
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                  {/* Track Background */}
                  <circle
                    cx="100"
                    cy="100"
                    r="84"
                    className="text-slate-800/80 stroke-current"
                    strokeWidth="14"
                    fill="transparent"
                  />
                  {/* Glowing Progress Arc */}
                  <circle
                    cx="100"
                    cy="100"
                    r="84"
                    className={`${
                      waitInfo.status === 'in-progress'
                        ? 'text-emerald-400'
                        : waitInfo.isClose
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    } stroke-current transition-all duration-1000 ease-out`}
                    strokeWidth="14"
                    strokeDasharray={2 * Math.PI * 84}
                    strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{
                      filter: 'drop-shadow(0 0 8px currentColor)',
                    }}
                  />
                </svg>

                {/* Center Gauge Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <span className="text-[10px] uppercase font-mono text-slate-400 tracking-widest">
                    Queue Position
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight my-1">
                    {waitInfo.status === 'in-progress' ? 'CALLING' : `#${currentToken.tokenNumber}`}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-xs font-mono text-cyan-300 mt-1">
                    <span>Now Serving: </span>
                    <strong className="text-white font-bold">
                      TK-{String(waitInfo.currentServingNumber).padStart(3, '0')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-2 text-center max-w-md">
                <p className="text-sm font-medium text-slate-200">{waitInfo.message}</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Queue Formula: (Your Token - Serving Token) × Rolling Avg Time
                </p>
              </div>
            </div>

            {/* Metrics Bottom Row */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800 text-center">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Patients Ahead</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
                  {waitInfo.peopleAhead}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Est. Wait Time</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                  {waitInfo.status === 'in-progress' ? '0m' : `~${waitInfo.estimatedMinutes}m`}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Doctor's Pace</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-purple-300">
                  ~{doctor.avgConsultationMinutes}m
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Doctor Chamber Details & Live Clinic Queue Stream */}
          <div className="lg:col-span-5 space-y-6">
            {/* Doctor & Chamber Card */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-cyan-400 uppercase">Consulting Specialist</div>
                  <h3 className="text-lg font-bold text-white truncate">{doctor.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{doctor.specialization}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Chamber Location:
                  </span>
                  <span className="font-bold text-cyan-300 font-mono text-sm">{doctor.chamberNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Booked Shift:
                  </span>
                  <span className="font-semibold text-slate-200 capitalize">{currentToken.slotShift} Session</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Symptoms Noted:
                  </span>
                  <span className="font-medium text-slate-300 max-w-[180px] truncate">{currentToken.symptoms}</span>
                </div>
              </div>
            </div>

            {/* Live Queue Stream for this Doctor */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Live Chamber Stream</h4>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {doctorQueue?.totalBooked || 0} Total Booked
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {/* Currently In-Progress */}
                {doctorQueue?.activeToken ? (
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                      <div>
                        <div className="text-xs font-bold text-cyan-300 font-mono">
                          {doctorQueue.activeToken.tokenDisplay} • Inside Chamber
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {doctorQueue.activeToken.patientName}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 font-bold">
                      IN CONSULTATION
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
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
                          ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold font-mono">
                            {tok.tokenDisplay} {isMe && <span className="text-cyan-400">(YOU)</span>}
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

              {/* Switch to Another Patient Token or Book New */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  onClick={onBookNew}
                  className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>Book Another Appointment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-4">
          <Tv2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Active Token Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please enter your token number (e.g. TK-014) in the search bar above, or book a fresh appointment from the patient portal.
          </p>
          <button
            onClick={onBookNew}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Book Appointment Now
          </button>
        </div>
      )}
    </div>
  );
};
