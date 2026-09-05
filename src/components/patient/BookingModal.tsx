import React, { useState } from 'react';
import { Doctor, PatientToken } from '../../types';
import { queueService } from '../../services/queueStore';
import { 
  X, 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Printer
} from 'lucide-react';

interface BookingModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBookingConfirmed: (token: PatientToken) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  doctor,
  onClose,
  onBookingConfirmed,
}) => {
  if (!doctor) return null;

  const [selectedShift, setSelectedShift] = useState<'morning' | 'evening'>(
    doctor.schedules[0]?.shift || 'morning'
  );
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>(32);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [symptoms, setSymptoms] = useState('');
  const [isEmergencyPriority, setIsEmergencyPriority] = useState(false);
  const [confirmedToken, setConfirmedToken] = useState<PatientToken | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!patientName.trim()) {
      setError('Please enter the patient full name.');
      return;
    }
    if (!patientPhone.trim()) {
      setError('Please provide a valid contact mobile number.');
      return;
    }
    if (!patientAge || patientAge < 1 || patientAge > 120) {
      setError('Please enter a valid age between 1 and 120.');
      return;
    }

    try {
      const token = queueService.bookToken({
        doctorId: doctor.id,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: Number(patientAge),
        patientGender,
        symptoms: symptoms.trim() || 'General OPD consultation review',
        slotShift: selectedShift,
        isEmergencyPriority,
      });

      setConfirmedToken(token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    }
  };

  const selectedSlot = doctor.schedules.find((s) => s.shift === selectedShift);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[94vh] flex flex-col rounded-3xl bg-[#0e1422] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden">
        {/* Glow Header Bar */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 px-4 sm:px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white tracking-tight truncate">
                {confirmedToken ? 'Token Issued Successfully' : 'Book Instant OPD Token'}
              </h3>
              <p className="text-xs text-slate-400 font-mono truncate">
                {doctor.name} • {doctor.chamberNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedToken ? (
          /* Confirmation Pass Screen */
          <div className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto">
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/40 text-center shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRMED IN QUEUE</span>
              </div>

              <div className="text-xs uppercase font-mono text-slate-400">Your Sequential Token Number</div>
              <div className="text-5xl sm:text-6xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-white my-2 tracking-widest">
                {confirmedToken.tokenDisplay}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-left text-xs">
                <div>
                  <span className="text-slate-500 block font-mono">Patient</span>
                  <span className="font-semibold text-slate-200 text-sm">{confirmedToken.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-mono">Consultant</span>
                  <span className="font-semibold text-slate-200 text-sm">{confirmedToken.doctorName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-mono">Chamber</span>
                  <span className="font-semibold text-cyan-300 text-sm">{doctor.chamberNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-mono">Estimated Rolling Time</span>
                  <span className="font-semibold text-emerald-400 text-sm">~{doctor.avgConsultationMinutes}m / patient</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 text-center">
                📢 Sound alerts will automatically ring when your turn is 2 tokens away!
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="btn-confirm-open-tracker"
                onClick={() => {
                  onBookingConfirmed(confirmedToken);
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Live Queue Tracker</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => window.print()}
                className="py-3 px-4 rounded-xl font-medium text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Print Ticket</span>
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Doctor summary strip */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-cyan-500/30"
                />
                <div>
                  <div className="font-bold text-sm text-white">{doctor.name}</div>
                  <div className="text-xs text-slate-400">{doctor.specialization}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Fee</span>
                <span className="text-sm font-bold font-mono text-cyan-300">
                  PKR {doctor.consultationFee.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Shift selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Select Today's Consultation Shift
              </label>
              <div className="grid grid-cols-2 gap-3">
                {doctor.schedules.map((s) => {
                  const isSelected = selectedShift === s.shift;
                  const remaining = Math.max(0, s.maxCapacity - s.tokensIssued);
                  const isFull = remaining === 0;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={isFull}
                      onClick={() => setSelectedShift(s.shift)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      } ${isFull ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs capitalize text-white">
                          {s.shift} Slot
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          {remaining} Left
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        {s.timeRange}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Patient Personal Details */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    id="input-patient-name"
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Asad Mehmood"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Contact Mobile *
                  </label>
                  <input
                    id="input-patient-phone"
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Age *
                  </label>
                  <input
                    id="input-patient-age"
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as 'male' | 'female' | 'other')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Primary Symptoms / Health Concern
                </label>
                <textarea
                  id="input-patient-symptoms"
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms (e.g. persistent cough, fever for 2 days, sharp pain)..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              {/* Priority Checkbox */}
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-medium text-slate-200">Urgent Triage Request</div>
                    <div className="text-[10px] text-slate-400">Flags token for clinical emergency queue precedence</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isEmergencyPriority}
                  onChange={(e) => setIsEmergencyPriority(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                id="btn-submit-booking"
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-slate-950" />
                <span>Confirm Booking & Generate Token</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
