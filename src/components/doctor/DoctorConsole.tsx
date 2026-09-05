import React, { useState, useEffect, useRef } from 'react';
import { Doctor, PatientToken, DoctorAvailability, HospitalQueueState } from '../../types';
import { queueService } from '../../services/queueStore';
import { soundEngine } from '../AudioChime';
import { 
  Stethoscope, 
  Users, 
  Clock, 
  UserCheck, 
  Play, 
  CheckCircle2, 
  SkipForward, 
  FileText, 
  Activity, 
  AlertCircle,
  Sparkles,
  Phone,
  Calendar,
  Volume2,
  ShieldCheck,
  LogOut
} from 'lucide-react';

interface DoctorConsoleProps {
  initialDoctorId?: string;
  authenticatedDoctor?: Doctor | null;
  onLogout?: () => void;
  isSimulatorMode?: boolean;
}

export const DoctorConsole: React.FC<DoctorConsoleProps> = ({
  initialDoctorId,
  authenticatedDoctor,
  onLogout,
  isSimulatorMode = false,
}) => {
  const [queueState, setQueueState] = useState<HospitalQueueState>(queueService.getState());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    authenticatedDoctor?.id || initialDoctorId || queueState.doctors[0]?.id || ''
  );
  const [doctorNotesInput, setDoctorNotesInput] = useState('');
  const [consultationTimerSeconds, setConsultationTimerSeconds] = useState(0);

  // Sync if authenticatedDoctor changes
  useEffect(() => {
    if (authenticatedDoctor) {
      setSelectedDoctorId(authenticatedDoctor.id);
    }
  }, [authenticatedDoctor?.id]);

  // Subscribe to live queue updates
  useEffect(() => {
    const unsub = queueService.subscribe((state) => {
      setQueueState({ ...state });
    });
    return () => unsub();
  }, []);

  const doctor = queueState.doctors.find((d) => d.id === selectedDoctorId);
  const doctorQueue = doctor ? queueService.getDoctorQueue(doctor.id) : null;
  const activePatient = doctorQueue?.activeToken;

  // Active consultation live timer counter
  useEffect(() => {
    if (!activePatient) {
      setConsultationTimerSeconds(0);
      return;
    }

    // If activePatient has calledAt, calculate elapsed seconds
    const calledTime = activePatient.calledAt ? new Date(activePatient.calledAt).getTime() : Date.now();
    const elapsed = Math.max(0, Math.floor((Date.now() - calledTime) / 1000));
    setConsultationTimerSeconds(elapsed);

    const interval = setInterval(() => {
      setConsultationTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activePatient?.id, activePatient?.calledAt]);

  // Load existing notes if any
  useEffect(() => {
    if (activePatient) {
      setDoctorNotesInput(activePatient.doctorNotes || '');
    } else {
      setDoctorNotesInput('');
    }
  }, [activePatient?.id]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCallNext = () => {
    if (!doctor) return;
    // Save notes if any before moving
    if (activePatient && doctorNotesInput.trim()) {
      queueService.saveDoctorNotes(activePatient.id, doctorNotesInput.trim());
    }

    const called = queueService.callNextPatient(doctor.id);
    if (!called) {
      alert('Queue is empty. No more waiting patients for this session!');
    }
  };

  const handleCompleteActive = () => {
    if (!doctor || !activePatient) return;
    queueService.completeActiveConsultation(doctor.id, doctorNotesInput.trim());
    soundEngine.playSuccessChime();
  };

  const handleSkipActive = () => {
    if (!activePatient) return;
    if (window.confirm(`Mark token ${activePatient.tokenDisplay} as skipped / no-show?`)) {
      queueService.skipPatient(activePatient.id);
    }
  };

  const handleAvailabilityChange = (avail: DoctorAvailability) => {
    if (!doctor) return;
    queueService.setDoctorAvailability(doctor.id, avail);
  };

  if (!doctor || !doctorQueue) {
    return <div className="p-8 text-center text-slate-400">Loading Doctor Console...</div>;
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Clinical Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-950">
              <span className={`block w-3.5 h-3.5 rounded-full ${doctor.availability === 'available' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{doctor.name}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {doctor.chamberNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{doctor.qualification}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs text-cyan-400 font-medium">{doctor.specialization}</p>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified Doctor Session
              </span>
            </div>
          </div>
        </div>

        {/* Doctor Switcher & Status Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Doctor Switcher Dropdown (allowed for simulator or authorized staff) */}
          {(isSimulatorMode || !authenticatedDoctor) && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Chamber:</span>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
              >
                {queueState.doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.chamberNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Availability Status Toggles */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => handleAvailabilityChange('available')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                doctor.availability === 'available'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => handleAvailabilityChange('on_break')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                doctor.availability === 'on_break'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Break
            </button>
            <button
              onClick={() => handleAvailabilityChange('in_surgery')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                doctor.availability === 'in_surgery'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              In Surgery
            </button>
          </div>

          {/* Sign Out / Lock Chamber button */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer hover:border-rose-400"
              title="Lock Chamber & Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Lock / Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Doctor Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Patient Consultation Chamber (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Call Next Primary Action Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
            {/* Ambient Pulse Glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Header & Active Consultation Timer */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase font-mono tracking-wider truncate">
                  Chamber Examination Cockpit
                </h3>
              </div>

              {/* Consultation Live Timer */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 self-start xs:self-auto">
                <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-xs font-mono text-slate-400">Consult Time:</span>
                <span className="text-sm font-bold font-mono text-cyan-300">
                  {formatTimer(consultationTimerSeconds)}
                </span>
              </div>
            </div>

            {/* Currently Serving Content */}
            {activePatient ? (
              <div className="mt-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/40">
                  <div>
                    <div className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-semibold">
                      Inside Chamber Right Now
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
                      {activePatient.tokenDisplay}
                    </div>
                    <div className="text-base font-bold text-cyan-200 mt-0.5">
                      {activePatient.patientName}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span>Age: <strong>{activePatient.patientAge}</strong></span>
                      <span>•</span>
                      <span className="capitalize">Gender: <strong>{activePatient.patientGender}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" /> {activePatient.patientPhone}
                      </span>
                    </div>
                  </div>

                  {activePatient.isEmergencyPriority && (
                    <div className="px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold font-mono flex items-center gap-1.5 self-start sm:self-center">
                      <AlertCircle className="w-4 h-4" />
                      <span>EMERGENCY TRIAGE</span>
                    </div>
                  )}
                </div>

                {/* Patient Symptoms */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-xs font-mono uppercase text-slate-400">Reported Symptoms / Chief Complaint:</div>
                  <p className="text-sm text-slate-200">{activePatient.symptoms}</p>
                </div>

                {/* Doctor Prescription & Clinical Notes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Clinical Observations & Prescription Memo</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">Auto-saved to patient record</span>
                  </div>
                  <textarea
                    rows={3}
                    value={doctorNotesInput}
                    onChange={(e) => setDoctorNotesInput(e.target.value)}
                    placeholder="Enter diagnostic notes, vitals (BP, SpO2), prescribed medicines or follow-up instructions..."
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono resize-none"
                  />
                </div>

                {/* Consultation Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    id="btn-complete-consultation"
                    onClick={handleCompleteActive}
                    className="py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Conclude Consultation</span>
                  </button>

                  <button
                    id="btn-skip-patient"
                    onClick={handleSkipActive}
                    className="py-3 px-4 rounded-xl font-medium text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <SkipForward className="w-4 h-4 text-slate-500" />
                    <span>Skip / No-Show</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Chamber Ready for Consultation</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Press <strong>"Call Next Patient"</strong> below to sound the hospital announcement chime and notify the next patient in line.
                  </p>
                </div>
              </div>
            )}

            {/* BIG CALL NEXT PATIENT CTA */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <button
                id="btn-doctor-call-next"
                onClick={handleCallNext}
                disabled={doctorQueue.waitingCount === 0}
                className="w-full py-3.5 sm:py-4 px-3 rounded-2xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 hover:from-cyan-300 hover:to-teal-200 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer group"
              >
                <Play className="w-4 sm:w-5 h-4 sm:h-5 fill-slate-950 text-slate-950 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">
                  {activePatient ? 'COMPLETE & CALL NEXT PATIENT' : 'CALL NEXT PATIENT IN QUEUE'}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-950/20 text-slate-950 font-mono text-xs font-bold shrink-0">
                  {doctorQueue.waitingCount} Waiting
                </span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-mono text-slate-400">Today's Patients</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {doctorQueue.totalBooked}
              </div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-mono text-slate-400">Completed</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {doctorQueue.completedCount}
              </div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-mono text-slate-400">Rolling Avg</div>
              <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                ~{doctor.avgConsultationMinutes}m
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full Queue Roster (Waiting + Completed) (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Today's Queue Roster</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {doctorQueue.waitingCount} in line
              </span>
            </div>

            {/* Waiting List */}
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {doctorQueue.waitingTokens.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  All waiting patients have been attended to!
                </div>
              ) : (
                doctorQueue.waitingTokens.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      idx === 0
                        ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-950/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-white text-sm">
                              {t.tokenDisplay}
                            </span>
                            {idx === 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-bold uppercase">
                                NEXT
                              </span>
                            )}
                            {t.isEmergencyPriority && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold uppercase">
                                URGENT
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-300 font-medium">
                            {t.patientName} ({t.patientAge}y, {t.patientGender})
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                            {t.symptoms}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 block">Est. Time</span>
                        <span className="text-xs font-mono text-slate-200 font-semibold">
                          ~{(idx + (activePatient ? 1 : 0)) * doctor.avgConsultationMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Completed Records Section */}
              {doctorQueue.completedTokens.length > 0 && (
                <div className="pt-4 border-t border-slate-800/80 mt-4">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2">
                    Completed Consultations ({doctorQueue.completedTokens.length})
                  </div>
                  <div className="space-y-2">
                    {doctorQueue.completedTokens.slice(-4).reverse().map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-850 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-mono text-slate-300 font-bold">{t.tokenDisplay}</span>
                          <span className="text-slate-400 truncate max-w-[120px]">{t.patientName}</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400/80">
                          {t.consultationDurationSeconds ? `${Math.round(t.consultationDurationSeconds / 60)}m` : 'Done'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
