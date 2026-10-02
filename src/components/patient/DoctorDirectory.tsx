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
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  UserCheck
} from 'lucide-react';
import { queueService } from '../../services/queueStore';
import { MobileSlider } from '../ui/MobileSlider';

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
  { label: 'Child Fever', query: 'Pediatrics' },
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
    const deptObj = departments.find((d) => d.id === doc.departmentId);
    const deptNameMatch = deptObj?.name.toLowerCase().includes(q);
    const diseaseMatch = deptObj?.commonDiseases.some((d) => d.toLowerCase().includes(q));

    return nameMatch || specMatch || deptNameMatch || diseaseMatch;
  });

  const getDepartmentName = (deptId: DepartmentId) => {
    return departments.find((d) => d.id === deptId)?.name || deptId;
  };

  const getAvailabilityBadge = (avail: Doctor['availability']) => {
    switch (avail) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            In Chamber · Ready
          </span>
        );
      case 'in_surgery':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            Emergency Surgery
          </span>
        );
      case 'on_break':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Short Break
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            On Leave Today
          </span>
        );
    }
  };

  return (
    <section 
      id="doctors-section" 
      className="py-16 sm:py-20 bg-slate-950 text-white border-b border-slate-800 scroll-mt-20 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header & Search Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase mb-3">
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
              <span>Specialist Physician Roster</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Consultants &amp; Real-Time Chamber Capacity
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl">
              Real-time telemetry reflects live doctor presence, chamber room numbers, remaining token allocations, and active queue progression.
            </p>
          </div>

          {/* Search Bar & Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSetSearchQuery && onSetSearchQuery(e.target.value)}
                placeholder="Search physician, specialty, symptom..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-base sm:text-sm font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs font-mono text-cyan-300 bg-blue-950/80 px-3.5 py-2.5 rounded-xl border border-blue-800/60 font-semibold shrink-0 text-center">
              <span>{filteredDoctors.length} Specialists Online</span>
            </div>
          </div>
        </div>

        {/* Quick Symptom Search Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <span className="text-xs font-mono text-slate-400 font-semibold mr-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fast Filter:</span>
          </span>
          {COMMON_SUGGESTIONS.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (onSetSearchQuery) onSetSearchQuery(item.query);
                if (onSelectDepartment) onSelectDepartment('all');
              }}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                searchQuery.toLowerCase() === item.query.toLowerCase()
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                  : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              + {item.label}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="text-xs px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer font-semibold flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredDoctors.length === 0 ? (
          <div className="p-10 sm:p-14 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-300 space-y-6 max-w-2xl mx-auto shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold tracking-wider uppercase">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>No Matching Specialist Found</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                No Physicians Found for "{searchQuery}"
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Try searching for supported terms such as "Chest pain", "Migraine", "Joint", "Fever", or reset the department filter to view all physicians.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {onClearSearch && (
                <button
                  onClick={onClearSearch}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Clear Search &amp; Show All
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Doctors Grid with High Contrast & Mobile Slider */
          <MobileSlider desktopGridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredDoctors.map((doc, index) => {
              const totalCapacity = doc.schedules.reduce((sum, s) => sum + s.maxCapacity, 0);
              const totalIssued = doc.schedules.reduce((sum, s) => sum + s.tokensIssued, 0);
              const remainingSlots = Math.max(0, totalCapacity - totalIssued);
              const capacityPercent = Math.min(100, Math.round((totalIssued / Math.max(1, totalCapacity)) * 100));

              return (
                <div
                  key={doc.id}
                  id={`doctor-card-${doc.id}`}
                  className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-400/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-[0_16px_40px_rgba(6,182,212,0.18)] hover:-translate-y-2 group"
                >
                  <div className="p-6">
                    {/* Top Row: Photo + Information */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={doc.photoUrl}
                          alt={doc.name}
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-cyan-400 transition-colors shadow-md"
                        />
                        {doc.availability === 'available' ? (
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
                          </span>
                        ) : (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-slate-900" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-mono text-cyan-400 font-bold mb-0.5 tracking-tight truncate">
                          {getDepartmentName(doc.departmentId)}
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors truncate tracking-tight">
                          {doc.name}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {doc.specialization}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {doc.rating}
                            <span className="text-slate-500 font-normal font-sans">({doc.reviewCount})</span>
                          </span>
                          <span className="text-slate-700">•</span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {doc.experienceYears}+ yrs exp
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chamber Room & Status Badge */}
                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{doc.chamberNumber}</span>
                      </div>
                      <div>
                        {getAvailabilityBadge(doc.availability)}
                      </div>
                    </div>

                    {/* Live Chamber Capacity Progress Bar */}
                    <div className="mt-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Tokens Issued</span>
                        <span className="text-white font-bold">
                          {totalIssued} / {totalCapacity}
                        </span>
                      </div>

                      {/* Progress meter */}
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            capacityPercent > 85 
                              ? 'bg-rose-500' 
                              : capacityPercent > 60 
                              ? 'bg-amber-400' 
                              : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                          }`}
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1 font-mono text-cyan-400">
                          <Zap className="w-3 h-3" />
                          <span>~{doc.avgConsultationMinutes} min/patient</span>
                        </span>
                        <span className="font-semibold text-emerald-400">
                          {remainingSlots} slots remaining
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-6 pt-0 mt-2">
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                      <div className="text-left">
                        <div className="text-[10px] uppercase font-mono text-slate-500">Consultation Fee</div>
                        <div className="text-sm font-bold text-white font-mono">
                          PKR {doc.consultationFee.toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => onBookDoctor(doc)}
                        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 hover:shadow-cyan-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Book Token</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </MobileSlider>
        )}

      </div>
    </section>
  );
};
