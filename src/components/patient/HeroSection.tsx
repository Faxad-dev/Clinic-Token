import React, { useState, useRef, useEffect } from 'react';
import { 
  HeartPulse, 
  CalendarClock, 
  Search, 
  Activity, 
  Users, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  X,
  CornerDownRight,
  HelpCircle
} from 'lucide-react';
import { queueService } from '../../services/queueStore';
import { Doctor, DepartmentId } from '../../types';

interface HeroSectionProps {
  onBookClick: () => void;
  onTrackClick: () => void;
  onCinematicClick?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onBookDoctor?: (doctor: Doctor) => void;
  onSelectDepartment?: (deptId: DepartmentId) => void;
}

const COMMON_SYMPTOM_SUGGESTIONS = [
  { label: 'Chest Pain', query: 'Chest pain' },
  { label: 'Migraine / Headache', query: 'Migraine' },
  { label: 'Joint / Bone Pain', query: 'Joint' },
  { label: 'Skin / Eczema', query: 'Eczema' },
  { label: 'Fever & Flu', query: 'Fever' },
  { label: 'Child Health', query: 'Pediatrics' },
  { label: 'Dr. Tariq', query: 'Tariq' },
  { label: 'Dr. Ayesha', query: 'Ayesha' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBookClick,
  onTrackClick,
  onCinematicClick,
  searchQuery,
  setSearchQuery,
  onBookDoctor,
  onSelectDepartment,
}) => {
  const stats = queueService.getHospitalStats();
  const queueState = queueService.getState();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search popover if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time matched doctors
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matchedDoctors = trimmedQuery
    ? queueState.doctors.filter((doc) => {
        const nameMatch = doc.name.toLowerCase().includes(trimmedQuery);
        const specMatch = doc.specialization.toLowerCase().includes(trimmedQuery);
        const qualMatch = doc.qualification.toLowerCase().includes(trimmedQuery);
        const chamberMatch = doc.chamberNumber.toLowerCase().includes(trimmedQuery);
        const dept = queueState.departments.find((d) => d.id === doc.departmentId);
        const deptNameMatch = dept?.name.toLowerCase().includes(trimmedQuery);
        const diseaseMatch = dept?.commonDiseases.some((d) =>
          d.toLowerCase().includes(trimmedQuery)
        );
        return nameMatch || specMatch || qualMatch || chamberMatch || deptNameMatch || diseaseMatch;
      })
    : [];

  // Real-time matched departments
  const matchedDepartments = trimmedQuery
    ? queueState.departments.filter(
        (dept) =>
          dept.name.toLowerCase().includes(trimmedQuery) ||
          dept.commonDiseases.some((d) => d.toLowerCase().includes(trimmedQuery))
      )
    : [];

  const handleSelectDoctorFromSearch = (doc: Doctor) => {
    setIsSearchFocused(false);
    if (onBookDoctor) {
      onBookDoctor(doc);
    } else {
      onBookClick();
    }
  };

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    setIsSearchFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsSearchFocused(false);
      onBookClick();
    }
    if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  return (
    <section className="relative overflow-visible pt-10 pb-12 sm:pt-16 sm:pb-16 border-b border-slate-200 bg-white/70">
      {/* Swiss subtle ambient diffuse background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Swiss Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Next-Generation OPD Automation & Live Telemetry</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span className="text-slate-500 font-mono text-[11px]">v3.2 Swiss Precision</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Precision Healthcare with{' '}
            <span className="text-blue-600 underline decoration-blue-400/40 decoration-wavy decoration-1 underline-offset-8">
              Live Token Tracking
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Eliminate crowded waiting rooms. Book consultations with leading medical specialists, receive sequential OPD tokens, and monitor real-time chamber queues with sub-second estimated wait-times.
          </p>

          {/* Medical disclaimer note as instructed */}
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 flex items-center justify-center gap-2.5 max-w-2xl mx-auto text-left sm:text-center shadow-sm">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Clinical Advisory:</strong> For severe, acute cardiac or trauma emergencies, please head directly to the 24/7 Red-Triage ER Wing on Ground Floor.
            </span>
          </div>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              id="hero-btn-book"
              onClick={onBookClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <CalendarClock className="w-4 h-4 text-white" />
              <span>Book Appointment & Token</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-btn-track"
              onClick={onTrackClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Live Token Tracker</span>
            </button>

            {onCinematicClick && (
              <button
                id="hero-btn-cinematic"
                onClick={onCinematicClick}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
                title="View 3D Interactive Mockup Animation"
              >
                <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>3D Cinematic View</span>
              </button>
            )}
          </div>

          {/* Quick Doctor / Disease Search with Real-time Response & Data Not Found Card */}
          <div ref={searchContainerRef} className="pt-4 max-w-xl mx-auto relative text-left">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                isSearchFocused || searchQuery ? 'text-blue-600' : 'text-slate-400'
              }`} />
              <input
                id="search-doctor-input"
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search condition (e.g. Chest pain, Migraine, Eczema) or Doctor name..."
                className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white border border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-sm text-slate-900 placeholder-slate-400 transition-all shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchFocused(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs transition-colors cursor-pointer"
                    title="Clear Search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchFocused(false);
                    onBookClick();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-mono font-semibold transition-all cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Quick helper pills below input */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 px-1">
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Quick help:
              </span>
              {COMMON_SYMPTOM_SUGGESTIONS.slice(0, 5).map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSuggestionClick(item.query)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    searchQuery.toLowerCase() === item.query.toLowerCase()
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 border border-slate-200 shadow-sm'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Live Instant Search Dropdown Popover */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 top-full mt-3 z-40 rounded-2xl bg-white border border-slate-200 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.15)] animate-fadeIn">
                
                {/* CASE 1: Query entered, but DATA NOT FOUND */}
                {trimmedQuery && matchedDoctors.length === 0 && (
                  <div className="py-2 text-left space-y-3">
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                      <div className="p-2 rounded-lg bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                            DATA NOT FOUND
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          No Clinical Records Found for "{searchQuery}"
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          We could not find any active doctor, medical department, or symptom matching your search in our current OPD roster.
                        </p>
                      </div>
                    </div>

                    {/* Helpful Assistance & Guidance */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Recommended Search Suggestions & Symptoms:</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Click any of these available specialties or clinical conditions to find the right consultant immediately:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {COMMON_SYMPTOM_SUGGESTIONS.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => handleSuggestionClick(item.query)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-slate-700 transition-all text-left cursor-pointer"
                          >
                            + {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setIsSearchFocused(false);
                          onBookClick();
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium transition-colors cursor-pointer"
                      >
                        Clear Search & View All Doctors
                      </button>
                      <span className="text-[11px] text-slate-400 font-mono">
                        OPD Helpline: Ext 101
                      </span>
                    </div>
                  </div>
                )}

                {/* CASE 2: Query entered and MATCHES FOUND */}
                {trimmedQuery && matchedDoctors.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                      <span className="font-mono text-slate-800 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Found {matchedDoctors.length} Matching Specialist{matchedDoctors.length > 1 ? 's' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchFocused(false);
                          onBookClick();
                        }}
                        className="text-[11px] text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <span>View in OPD Roster</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {matchedDoctors.map((doc) => {
                        const dept = queueState.departments.find((d) => d.id === doc.departmentId);
                        return (
                          <div
                            key={doc.id}
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 flex items-center justify-between gap-3 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={doc.photoUrl}
                                alt={doc.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-2">
                                <span>{doc.name}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                  {doc.chamberNumber}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {dept?.name} • <span className="text-slate-700">{doc.specialization}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectDoctorFromSearch(doc)}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 transition-all shadow-sm cursor-pointer"
                          >
                            Book Token
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CASE 3: Focused but no query entered yet (Quick helper suggestions) */}
              {!trimmedQuery && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5 border-b border-slate-200">
                    <span className="font-mono text-slate-800 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Instant OPD Triage & Doctor Search
                    </span>
                    <span className="text-[11px] text-slate-400">Type symptom or doctor name</span>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Common Conditions & Symptoms:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {COMMON_SYMPTOM_SUGGESTIONS.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleSuggestionClick(item.query)}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left text-xs text-slate-700 hover:text-blue-700 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate">{item.label}</span>
                          <CornerDownRight className="w-3 h-3 text-blue-500 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                    <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono border border-slate-200">Enter</kbd> to jump to doctors roster</span>
                    <button
                      type="button"
                      onClick={() => setIsSearchFocused(false)}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.04)] relative overflow-hidden group hover:border-blue-300 hover:shadow-[0_8px_25px_rgba(15,23,42,0.08)] transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {stats.totalDoctors} Consultants
              </div>
              <div className="text-xs text-slate-500 font-medium">Board-Certified Specialists</div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Available in clinics today</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.04)] relative overflow-hidden group hover:border-blue-300 hover:shadow-[0_8px_25px_rgba(15,23,42,0.08)] transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                480+ / Day
              </div>
              <div className="text-xs text-slate-500 font-medium">Patients Streamlined</div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>{stats.totalTokens} tokens logged today</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.04)] relative overflow-hidden group hover:border-blue-300 hover:shadow-[0_8px_25px_rgba(15,23,42,0.08)] transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                6 Core Wings
              </div>
              <div className="text-xs text-slate-500 font-medium">Advanced Centers of Excellence</div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Full diagnostic wings active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.04)] relative overflow-hidden group hover:border-blue-300 hover:shadow-[0_8px_25px_rgba(15,23,42,0.08)] transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                ~{stats.avgConsultMins} Mins
              </div>
              <div className="text-xs text-slate-500 font-medium">Rolling Consultation Avg</div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
            <span>{stats.onTimeRate} punctuality index</span>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};
