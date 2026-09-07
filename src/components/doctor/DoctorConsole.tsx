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
    return <div className="p-8 text-center text-slate-500">Loading Doctor Console...</div>;
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Clinical Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white shadow-sm">
              <span className={`block w-3.5 h-3.5 rounded-full ${doctor.availability === 'available' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{doctor.name}</h2>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {doctor.chamberNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{doctor.qualification}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs text-blue-600 font-semibold">{doctor.specialization}</p>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
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
              <span className="text-xs font-mono text-slate-500 font-semibold">Chamber:</span>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
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
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => handleAvailabilityChange('available')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                doctor.availability === 'available'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => handleAvailabilityChange('on_break')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                doctor.availability === 'on_break'
                  ? 'bg-amber-500 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Break
            </button>
            <button
              onClick={() => handleAvailabilityChange('in_surgery')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                doctor.availability === 'in_surgery'
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Lock Chamber & Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
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
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
            {/* Header & Active Consultation Timer */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase font-mono tracking-wider truncate">
                  Chamber Examination Cockpit
                </h3>
              </div>

              {/* Consultation Live Timer */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 self-start xs:self-auto shadow-sm">
                <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-xs font-mono text-slate-500 font-medium">Consult Time:</span>
                <span className="text-sm font-bold font-mono text-blue-700">
                  {formatTimer(consultationTimerSeconds)}
                </span>
              </div>
            </div>

            {/* Currently Serving Content */}
            {activePatient ? (
              <div className="mt-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-200 shadow-sm">
                  <div>
                    <div className="text-[10px] uppercase font-mono tracking-widest text-blue-700 font-bold">
                      Inside Chamber Right Now
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-1">
                      {activePatient.tokenDisplay}
                    </div>
                    <div className="text-base font-bold text-slate-800 mt-0.5">
                      {activePatient.patientName}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span>Age: <strong className="text-slate-800">{activePatient.patientAge}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span className="capitalize">Gender: <strong className="text-slate-800">{activePatient.patientGender}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" /> {activePatient.patientPhone}
                      </span>
                    </div>
                  </div>

                  {activePatient.isEmergencyPriority && (
                    <div className="px-3 py-1 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold font-mono flex items-center gap-1.5 self-start sm:self-center shadow-sm">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>EMERGENCY TRIAGE</span>
                    </div>
                  )}
                </div>

                {/* Patient Symptoms */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
                  <div className="text-xs font-mono font-semibold uppercase text-slate-500">Reported Symptoms / Chief Complaint:</div>
                  <p className="text-sm text-slate-800">{activePatient.symptoms}</p>
                </div>

                {/* Doctor Prescription & Clinical Notes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase text-slate-700 font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Clinical Observations & Prescription Memo</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Auto-saved to patient record</span>
                  </div>
                  <textarea
                    rows={3}
                    value={doctorNotesInput}
                    onChange={(e) => setDoctorNotesInput(e.target.value)}
                    placeholder="Enter diagnostic notes, vitals (BP, SpO2), prescribed medicines or follow-up instructions..."
                    className="w-full p-3.5 rounded-2xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono resize-none shadow-sm"
                  />
                </div>

                {/* Consultation Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    id="btn-complete-consultation"
                    onClick={handleCompleteActive}
                    className="py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Conclude Consultation</span>
                  </button>

                  <button
                    id="btn-skip-patient"
                    onClick={handleSkipActive}
                    className="py-3 px-4 rounded-xl font-medium text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <SkipForward className="w-4 h-4 text-slate-500" />
                    <span>Skip / No-Show</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-sm">
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Chamber Ready for Consultation</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Press <strong>"Call Next Patient"</strong> below to sound the hospital announcement chime and notify the next patient in line.
                  </p>
                </div>
              </div>
            )}

            {/* BIG CALL NEXT PATIENT CTA */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                id="btn-doctor-call-next"
                onClick={handleCallNext}
                disabled={doctorQueue.waitingCount === 0}
                className="w-full py-3.5 sm:py-4 px-3 rounded-2xl font-bold text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer group"
              >
                <Play className="w-4 sm:w-5 h-4 sm:h-5 fill-white text-white group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate tracking-wide">
                  {activePatient ? 'COMPLETE & CALL NEXT PATIENT' : 'CALL NEXT PATIENT IN QUEUE'}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-700 text-white font-mono text-xs font-bold shrink-0">
                  {doctorQueue.waitingCount} Waiting
                </span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
              <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Today's Patients</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {doctorQueue.totalBooked}
              </div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
              <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Completed</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {doctorQueue.completedCount}
              </div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
              <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Rolling Avg</div>
              <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
                ~{doctor.avgConsultationMinutes}m
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full Queue Roster (Waiting + Completed) (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Today's Queue Roster</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-blue-600">
                {doctorQueue.waitingCount} in line
              </span>
            </div>

            {/* Waiting List */}
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {doctorQueue.waitingTokens.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  All waiting patients have been attended to!
                </div>
              ) : (
                doctorQueue.waitingTokens.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      idx === 0
                        ? 'bg-blue-50/60 border-blue-200 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-slate-900 text-sm">
                              {t.tokenDisplay}
                            </span>
                            {idx === 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold uppercase">
                                NEXT
                              </span>
                            )}
                            {t.isEmergencyPriority && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-mono font-bold uppercase">
                                URGENT
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-800 font-medium">
                            {t.patientName} ({t.patientAge}y, {t.patientGender})
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">
                            {t.symptoms}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 block">Est. Time</span>
                        <span className="text-xs font-mono text-slate-700 font-semibold">
                          ~{(idx + (activePatient ? 1 : 0)) * doctor.avgConsultationMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Completed Records Section */}
              {doctorQueue.completedTokens.length > 0 && (
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold mb-2">
                    Completed Consultations ({doctorQueue.completedTokens.length})
                  </div>
                  <div className="space-y-2">
                    {doctorQueue.completedTokens.slice(-4).reverse().map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-mono text-slate-800 font-bold">{t.tokenDisplay}</span>
                          <span className="text-slate-600 truncate max-w-[120px]">{t.patientName}</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-700 font-semibold">
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
