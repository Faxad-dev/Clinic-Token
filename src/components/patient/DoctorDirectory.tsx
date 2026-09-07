import React from 'react';
import { Doctor, DepartmentId, Department } from '../../types';
import { 
  Star, 
  Clock, 
  MapPin, 
  Calendar, 
  Activity, 
  Ticket, 
  CheckCircle, 
  AlertCircle,
  Stethoscope,
  Sparkles,
  RotateCcw,
  HelpCircle,
  SearchX
} from 'lucide-react';
import { queueService } from '../../services/queueStore';

interface DoctorDirectoryProps {
  doctors: Doctor[];
  departments: Department[];
  selectedDepartment: DepartmentId | 'all';
  searchQuery: string;
  onBookDoctor: (doctor: Doctor) => void;
  onClearSearch?: () => void;
  onSelectDepartment?: (deptId: DepartmentId | 'all') => void;
  onSetSearchQuery?: (query: string) => void;
}

const COMMON_SUGGESTIONS = [
  { label: 'Chest Pain', query: 'Chest pain' },
  { label: 'Migraine / Headache', query: 'Migraine' },
  { label: 'Joint / Bone Pain', query: 'Joint' },
  { label: 'Skin / Eczema', query: 'Eczema' },
  { label: 'Fever & Flu', query: 'Fever' },
  { label: 'Child Health', query: 'Pediatrics' },
  { label: 'Dr. Tariq Mansoor', query: 'Tariq' },
  { label: 'Dr. Ayesha Khan', query: 'Ayesha' },
];

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  doctors,
  departments,
  selectedDepartment,
  searchQuery,
  onBookDoctor,
  onClearSearch,
  onSelectDepartment,
  onSetSearchQuery,
}) => {
  // Filter logic
  const filteredDoctors = doctors.filter((doc) => {
    const deptMatch = selectedDepartment === 'all' || doc.departmentId === selectedDepartment;
    
    if (!deptMatch) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const nameMatch = doc.name.toLowerCase().includes(q);
    const specMatch = doc.specialization.toLowerCase().includes(q);
    const dept = departments.find((d) => d.id === doc.departmentId);
    const diseaseMatch = dept?.commonDiseases.some((d) => d.toLowerCase().includes(q));

    return nameMatch || specMatch || diseaseMatch;
  });

  const getDepartmentName = (id: DepartmentId) => {
    return departments.find((d) => d.id === id)?.name || id;
  };

  const getAvailabilityBadge = (avail: Doctor['availability']) => {
    switch (avail) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Available in Clinic
          </span>
        );
      case 'in_surgery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            In Emergency Surgery
          </span>
        );
      case 'on_break':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            On Short Break
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            On Leave Today
          </span>
        );
    }
  };

  return (
    <section id="doctors-section" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase font-mono tracking-widest text-blue-700 font-bold mb-1">
              OPD Specialist Roster
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Consultants & Real-Time Queue Capacity
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            Showing <strong className="text-blue-700">{filteredDoctors.length}</strong> available specialists
          </div>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-rose-200 text-slate-700 space-y-6 max-w-3xl mx-auto shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-bold tracking-wider uppercase">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>DATA NOT FOUND • 0 CLINICAL RECORDS</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {searchQuery ? (
                  <span>
                    No Specialists Found Matching "<span className="text-rose-600 underline underline-offset-4">{searchQuery}</span>"
                  </span>
                ) : (
                  <span>No Specialists Available for Selected Department</span>
                )}
              </h3>
              <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                The search condition or specialist name does not match any current OPD registry data. We support major clinical wings including Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, and General Medicine.
              </p>
            </div>

            {/* Helpful clickable symptom suggestions */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Try searching for these common supported symptoms:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {COMMON_SUGGESTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      if (onSetSearchQuery) onSetSearchQuery(item.query);
                      if (onSelectDepartment) onSelectDepartment('all');
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-slate-700 transition-all flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>+</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onClearSearch && searchQuery && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-white" />
                  <span>Clear Search Query</span>
                </button>
              )}
              {onSelectDepartment && selectedDepartment !== 'all' && (
                <button
                  type="button"
                  onClick={() => onSelectDepartment('all')}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Show All 6 Departments</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => {
              const queue = queueService.getDoctorQueue(doc.id);
              const totalCapacity = doc.schedules.reduce((sum, s) => sum + s.maxCapacity, 0);
              const totalIssued = doc.schedules.reduce((sum, s) => sum + s.tokensIssued, 0);
              const remainingSlots = Math.max(0, totalCapacity - totalIssued);

              return (
                <div
                  key={doc.id}
                  id={`doctor-card-${doc.id}`}
                  className="rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-md"
                >
                  <div>
                    {/* Doctor Header & Avatar */}
                    <div className="p-5 pb-4">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img
                            src={doc.photoUrl}
                            alt={doc.name}
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 rounded-2xl object-cover border border-slate-200 group-hover:border-blue-400 transition-colors shadow-sm"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                            <span className={`block w-3.5 h-3.5 rounded-full ${doc.availability === 'available' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold mb-0.5">
                            <span>{getDepartmentName(doc.departmentId)}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                            {doc.name}
                          </h3>
                          <p className="text-xs text-slate-600 truncate mt-0.5">
                            {doc.specialization}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="flex items-center gap-1 text-amber-500 font-semibold font-mono">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {doc.rating}
                              <span className="text-slate-400 font-normal font-sans">({doc.reviewCount})</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-mono">
                              {doc.experienceYears}+ yrs exp
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Chamber & Status badge row */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-mono font-medium">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>{doc.chamberNumber}</span>
                        </div>
                        <div>{getAvailabilityBadge(doc.availability)}</div>
                      </div>
                    </div>

                    {/* Real-time Live Queue Telemetry Banner */}
                    <div className="mx-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
                          Serving Now
                        </div>
                        <div className="text-base font-bold font-mono text-blue-700 flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                          </span>
                          {queue.activeToken ? queue.activeToken.tokenDisplay : `TK-${String(queue.currentServingNumber).padStart(3, '0')}`}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
                          In Waiting
                        </div>
                        <div className="text-sm font-semibold font-mono text-slate-800">
                          {queue.waitingCount} patients
                        </div>
                      </div>

                      <div className="text-right border-l border-slate-200 pl-3">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
                          Avg Consult
                        </div>
                        <div className="text-sm font-semibold font-mono text-slate-800">
                          ~{doc.avgConsultationMinutes}m
                        </div>
                      </div>
                    </div>

                    {/* Available Shift Slots */}
                    <div className="px-5 py-3 space-y-2">
                      <div className="text-[11px] uppercase font-mono text-slate-500 font-semibold">
                        Today's OPD Slots & Remaining Capacity:
                      </div>
                      <div className="space-y-1.5">
                        {doc.schedules.map((slot) => {
                          const slotRemaining = Math.max(0, slot.maxCapacity - slot.tokensIssued);
                          const isFull = slotRemaining === 0;

                          return (
                            <div
                              key={slot.id}
                              className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${slot.shift === 'morning' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                                <span className="capitalize font-semibold text-slate-800">
                                  {slot.shift} Shift
                                </span>
                                <span className="text-slate-500 text-[11px] font-mono">({slot.timeRange})</span>
                              </div>
                              <div className="text-[11px] font-mono">
                                {isFull ? (
                                  <span className="text-rose-600 font-semibold">Slot Full</span>
                                ) : (
                                  <span className="text-emerald-700 font-semibold">
                                    {slotRemaining} tokens left
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA & Fee */}
                  <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block font-medium">Consultation Fee</span>
                      <span className="text-base font-bold font-mono text-slate-900">
                        PKR {doc.consultationFee.toLocaleString()}
                      </span>
                    </div>

                    <button
                      id={`btn-book-${doc.id}`}
                      disabled={doc.availability === 'on_leave'}
                      onClick={() => onBookDoctor(doc)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 text-white" />
                      <span>Book Token</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
