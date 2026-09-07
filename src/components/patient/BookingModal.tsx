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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[94vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                {confirmedToken ? 'Token Issued Successfully' : 'Book Instant OPD Token'}
              </h3>
              <p className="text-xs text-slate-500 font-mono truncate">
                {doctor.name} • {doctor.chamberNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedToken ? (
          /* Confirmation Pass Screen */
          <div className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto">
            <div className="relative p-6 rounded-2xl bg-blue-50/30 border border-blue-200 text-center shadow-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>CONFIRMED IN QUEUE</span>
              </div>

              <div className="text-xs uppercase font-mono text-slate-500 font-medium">Your Sequential Token Number</div>
              <div className="text-5xl sm:text-6xl font-extrabold font-mono text-blue-700 my-2 tracking-widest">
                {confirmedToken.tokenDisplay}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200 text-left text-xs">
                <div>
                  <span className="text-slate-500 block font-mono">Patient</span>
                  <span className="font-semibold text-slate-900 text-sm">{confirmedToken.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-mono">Consultant</span>
                  <span className="font-semibold text-slate-900 text-sm">{confirmedToken.doctorName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-mono">Chamber</span>
                  <span className="font-semibold text-blue-700 text-sm">{doctor.chamberNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-mono">Estimated Rolling Time</span>
                  <span className="font-semibold text-emerald-700 text-sm">~{doctor.avgConsultationMinutes}m / patient</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 text-center font-medium">
                📢 Audio alerts will automatically ring when your turn is 2 tokens away!
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="btn-confirm-open-tracker"
                onClick={() => {
                  onBookingConfirmed(confirmedToken);
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Live Queue Tracker</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => window.print()}
                className="py-3 px-4 rounded-xl font-semibold text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Ticket</span>
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Doctor summary strip */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">{doctor.name}</div>
                  <div className="text-xs text-slate-500">{doctor.specialization}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-slate-500 block font-medium">Fee</span>
                <span className="text-sm font-bold font-mono text-blue-700">
                  PKR {doctor.consultationFee.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Shift selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
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
                          ? 'bg-blue-50/60 border-blue-600 text-slate-900 shadow-sm ring-1 ring-blue-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      } ${isFull ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs capitalize text-slate-900">
                          {s.shift} Slot
                        </span>
                        <span className="text-[10px] font-mono text-blue-700 font-semibold">
                          {remaining} Left
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
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
                  <label className="block text-xs font-mono uppercase text-slate-600 font-semibold mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    id="input-patient-name"
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Asad Mehmood"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-600 font-semibold mb-1">
                    Contact Mobile *
                  </label>
                  <input
                    id="input-patient-phone"
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-600 font-semibold mb-1">
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-600 font-semibold mb-1">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as 'male' | 'female' | 'other')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 focus:outline-none shadow-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-600 font-semibold mb-1">
                  Primary Symptoms / Health Concern
                </label>
                <textarea
                  id="input-patient-symptoms"
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms (e.g. persistent cough, fever for 2 days, sharp pain)..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none shadow-sm"
                />
              </div>

              {/* Priority Checkbox */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Urgent Triage Request</div>
                    <div className="text-[10px] text-slate-600">Flags token for clinical emergency queue precedence</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isEmergencyPriority}
                  onChange={(e) => setIsEmergencyPriority(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                id="btn-submit-booking"
                type="submit"
                className="w-full py-3.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-white" />
                <span>Confirm Booking & Generate Token</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
