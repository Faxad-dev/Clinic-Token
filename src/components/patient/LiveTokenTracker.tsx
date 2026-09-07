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
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-[#f8fafc]">
      {/* Tracker Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-700 font-bold mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Real-Time Live Telemetry Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Live Queue & Token Status
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Real-time synchronization with doctor chamber consoles. Instant acoustic alerts upon queue progression.
          </p>
        </div>

        {/* Quick Search / Select Another Token */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleLookup} className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Track token (e.g. TK-014)..."
              className="w-full pl-9 pr-14 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-[10px] hover:bg-blue-700 cursor-pointer shadow-sm"
            >
              Track
            </button>
          </form>

          <button
            onClick={() => soundEngine.playTokenCallChime()}
            title="Test announcement audio chime"
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer shrink-0 shadow-sm font-medium"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Test Chime</span>
          </button>
        </div>
      </div>

      {/* Lookup Error Banner */}
      {lookupError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span className="font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded mr-2 text-[10px]">
                DATA NOT FOUND
              </span>
              <span>{lookupError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLookupError(null)}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-100 transition-colors"
            title="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tracker Cockpit */}
      {currentToken && waitInfo && doctor ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Circular Queue Gauge */}
          <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
            {/* Urgency Notification Banner (if 2 tokens away or called) */}
            {waitInfo.status === 'in-progress' ? (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-3 animate-pulse">
                <BellRing className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-emerald-950">YOUR TOKEN HAS BEEN CALLED!</div>
                  <div className="text-xs text-emerald-800">
                    Please step into <strong>{doctor.chamberNumber}</strong> immediately for consultation with {doctor.name}.
                  </div>
                </div>
              </div>
            ) : waitInfo.isClose ? (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-800 flex items-center gap-3 animate-pulse">
                <Bell className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider text-amber-900">
                    Proximity Alert • Almost Your Turn
                  </div>
                  <div className="text-xs text-amber-800">
                    You are only <strong>{waitInfo.peopleAhead}</strong> patient{waitInfo.peopleAhead > 1 ? 's' : ''} away! Please move to the waiting lobby outside <strong>{doctor.chamberNumber}</strong>.
                  </div>
                </div>
              </div>
            ) : null}

            {/* Token Info Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold block">
                  Active Tracked Token
                </span>
                <span className="text-2xl font-black font-mono text-blue-700 tracking-wider">
                  {currentToken.tokenDisplay}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold block">
                  Patient Name
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {currentToken.patientName} ({currentToken.patientAge}y, {currentToken.patientGender})
                </span>
              </div>
            </div>

            {/* Progress Ring Gauge */}
            <div className="my-8 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* SVG Ring */}
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                  {/* Track Background */}
                  <circle
                    cx="100"
                    cy="100"
                    r="84"
                    className="text-slate-100 stroke-current"
                    strokeWidth="14"
                    fill="transparent"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="100"
                    cy="100"
                    r="84"
                    className={`${
                      waitInfo.status === 'in-progress'
                        ? 'text-emerald-500'
                        : waitInfo.isClose
                        ? 'text-amber-500'
                        : 'text-blue-600'
                    } stroke-current transition-all duration-1000 ease-out`}
                    strokeWidth="14"
                    strokeDasharray={2 * Math.PI * 84}
                    strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Center Gauge Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <span className="text-[10px] uppercase font-mono text-slate-500 tracking-widest font-semibold">
                    Queue Position
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 tracking-tight my-1">
                    {waitInfo.status === 'in-progress' ? 'CALLING' : `#${currentToken.tokenNumber}`}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-mono text-slate-700 mt-1 border border-slate-200">
                    <span>Now Serving: </span>
                    <strong className="text-blue-700 font-bold">
                      TK-{String(waitInfo.currentServingNumber).padStart(3, '0')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-2 text-center max-w-md">
                <p className="text-sm font-semibold text-slate-900">{waitInfo.message}</p>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Queue Formula: (Your Token - Serving Token) × Rolling Avg Time
                </p>
              </div>
            </div>

            {/* Metrics Bottom Row */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold">Patients Ahead</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-blue-700">
                  {waitInfo.peopleAhead}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold">Est. Wait Time</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
                  {waitInfo.status === 'in-progress' ? '0m' : `~${waitInfo.estimatedMinutes}m`}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold">Doctor's Pace</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800">
                  ~{doctor.avgConsultationMinutes}m
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Doctor Chamber Details & Live Clinic Queue Stream */}
          <div className="lg:col-span-5 space-y-6">
            {/* Doctor & Chamber Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-blue-700 font-semibold uppercase">Consulting Specialist</div>
                  <h3 className="text-lg font-bold text-slate-900 truncate">{doctor.name}</h3>
                  <p className="text-xs text-slate-600 truncate">{doctor.specialization}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Chamber Location:
                  </span>
                  <span className="font-bold text-blue-700 font-mono text-sm">{doctor.chamberNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> Booked Shift:
                  </span>
                  <span className="font-semibold text-slate-900 capitalize">{currentToken.slotShift} Session</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Symptoms Noted:
                  </span>
                  <span className="font-medium text-slate-800 max-w-[180px] truncate">{currentToken.symptoms}</span>
                </div>
              </div>
            </div>

            {/* Live Queue Stream for this Doctor */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-900">Live Chamber Stream</h4>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-medium">
                  {doctorQueue?.totalBooked || 0} Total Booked
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {/* Currently In-Progress */}
                {doctorQueue?.activeToken ? (
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                      </span>
                      <div>
                        <div className="text-xs font-bold text-blue-900 font-mono">
                          {doctorQueue.activeToken.tokenDisplay} • Inside Chamber
                        </div>
                        <div className="text-[11px] text-slate-600 truncate max-w-[150px]">
                          {doctorQueue.activeToken.patientName}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-100 text-blue-800 font-bold">
                      IN CONSULTATION
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
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
                          ? 'bg-blue-50 border-blue-400 text-slate-900 shadow-sm'
                          : 'bg-slate-50/70 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold font-mono text-slate-900">
                            {tok.tokenDisplay} {isMe && <span className="text-blue-700">(YOU)</span>}
                          </div>
                          <div className="text-[10px] text-slate-600 truncate max-w-[130px]">
                            {tok.patientName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500">
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
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Book Another Appointment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm text-slate-600 space-y-4">
          <Tv2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Active Token Selected</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Please enter your token number (e.g. TK-014) in the search bar above, or book a fresh appointment from the patient portal.
          </p>
          <button
            onClick={onBookNew}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            Book Appointment Now
          </button>
        </div>
      )}
    </div>
  );
};
