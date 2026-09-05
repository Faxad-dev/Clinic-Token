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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Available in Clinic
          </span>
        );
      case 'in_surgery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" />
            In Emergency Surgery
          </span>
        );
      case 'on_break':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            On Short Break
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/15 text-slate-400 border border-slate-500/30">
            On Leave Today
          </span>
        );
    }
  };

  return (
    <section id="doctors-section" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-semibold mb-1">
              OPD Specialist Roster
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Consultants & Real-Time Queue Capacity
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            Showing <strong className="text-cyan-300">{filteredDoctors.length}</strong> available specialists
          </div>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-rose-500/30 text-slate-300 space-y-6 max-w-3xl mx-auto shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold tracking-wider uppercase">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>DATA NOT FOUND • 0 CLINICAL RECORDS</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {searchQuery ? (
                  <span>
                    No Specialists Found Matching "<span className="text-rose-300 underline underline-offset-4">{searchQuery}</span>"
                  </span>
                ) : (
                  <span>No Specialists Available for Selected Department</span>
                )}
              </h3>
              <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                The search condition or specialist name does not match any current OPD registry data. We support major clinical wings including Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, and General Medicine.
              </p>
            </div>

            {/* Helpful clickable symptom suggestions */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
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
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-950" />
                  <span>Clear Search Query</span>
                </button>
              )}
              {onSelectDepartment && selectedDepartment !== 'all' && (
                <button
                  type="button"
                  onClick={() => onSelectDepartment('all')}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all flex items-center gap-2 cursor-pointer"
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
                  className="rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
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
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700/80 group-hover:border-cyan-400 transition-colors shadow-md"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-slate-950 p-0.5 rounded-full">
                            <span className={`block w-3.5 h-3.5 rounded-full ${doc.availability === 'available' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium mb-0.5">
                            <span>{getDepartmentName(doc.departmentId)}</span>
                          </div>
                          <h3 className="text-lg font-bold text-white truncate group-hover:text-cyan-200 transition-colors">
                            {doc.name}
                          </h3>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {doc.specialization}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="flex items-center gap-1 text-amber-400 font-semibold font-mono">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {doc.rating}
                              <span className="text-slate-500 font-normal font-sans">({doc.reviewCount})</span>
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-300 font-mono">
                              {doc.experienceYears}+ yrs exp
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Chamber & Status badge row */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{doc.chamberNumber}</span>
                        </div>
                        <div>{getAvailabilityBadge(doc.availability)}</div>
                      </div>
                    </div>

                    {/* Real-time Live Queue Telemetry Banner */}
                    <div className="mx-5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                          Serving Now
                        </div>
                        <div className="text-base font-bold font-mono text-cyan-300 flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                          </span>
                          {queue.activeToken ? queue.activeToken.tokenDisplay : `TK-${String(queue.currentServingNumber).padStart(3, '0')}`}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                          In Waiting
                        </div>
                        <div className="text-sm font-semibold font-mono text-slate-200">
                          {queue.waitingCount} patients
                        </div>
                      </div>

                      <div className="text-right border-l border-slate-800 pl-3">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                          Avg Consult
                        </div>
                        <div className="text-sm font-semibold font-mono text-slate-200">
                          ~{doc.avgConsultationMinutes}m
                        </div>
                      </div>
                    </div>

                    {/* Available Shift Slots */}
                    <div className="px-5 py-3 space-y-2">
                      <div className="text-[11px] uppercase font-mono text-slate-400 font-medium">
                        Today's OPD Slots & Remaining Capacity:
                      </div>
                      <div className="space-y-1.5">
                        {doc.schedules.map((slot) => {
                          const slotRemaining = Math.max(0, slot.maxCapacity - slot.tokensIssued);
                          const isFull = slotRemaining === 0;

                          return (
                            <div
                              key={slot.id}
                              className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${slot.shift === 'morning' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                                <span className="capitalize font-semibold text-slate-200">
                                  {slot.shift} Shift
                                </span>
                                <span className="text-slate-400 text-[11px] font-mono">({slot.timeRange})</span>
                              </div>
                              <div className="text-[11px] font-mono">
                                {isFull ? (
                                  <span className="text-rose-400 font-semibold">Slot Full</span>
                                ) : (
                                  <span className="text-emerald-400">
                                    <strong>{slotRemaining}</strong> tokens left
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
                  <div className="p-5 pt-3 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">Consultation Fee</span>
                      <span className="text-base font-bold font-mono text-white">
                        PKR {doc.consultationFee.toLocaleString()}
                      </span>
                    </div>

                    <button
                      id={`btn-book-${doc.id}`}
                      disabled={doc.availability === 'on_leave'}
                      onClick={() => onBookDoctor(doc)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 text-slate-950" />
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
