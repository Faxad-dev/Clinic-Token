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
    <section className="relative overflow-visible pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-cyan-500/10">
      {/* Futuristic glowing backdrop gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-[350px] h-[250px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Futuristic Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-medium shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Next-Generation OPD Automation & Live Telemetry</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-400 font-mono text-[11px]">v3.2 Nexus</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Precision Healthcare with{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent underline decoration-cyan-500/40 decoration-wavy decoration-1 underline-offset-8">
              Live Token Tracking
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Eliminate crowded waiting rooms. Book consultations with leading medical specialists, receive sequential OPD tokens, and monitor real-time chamber queues with sub-second estimated wait-times.
          </p>

          {/* Medical disclaimer note as instructed */}
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200/80 flex items-center justify-center gap-2 max-w-2xl mx-auto text-left sm:text-center">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Clinical Advisory:</strong> For severe, acute cardiac or trauma emergencies, please head directly to the 24/7 Red-Triage ER Wing on Ground Floor.
            </span>
          </div>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="hero-btn-book"
              onClick={onBookClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <CalendarClock className="w-4 h-4 text-slate-950" />
              <span>Book Appointment & Token</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-btn-track"
              onClick={onTrackClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/40"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Live Token Tracker</span>
            </button>
          </div>

          {/* Quick Doctor / Disease Search with Real-time Response & Data Not Found Card */}
          <div ref={searchContainerRef} className="pt-4 max-w-xl mx-auto relative text-left">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                isSearchFocused || searchQuery ? 'text-cyan-400' : 'text-slate-500'
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
                className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-slate-950/90 border border-slate-700/90 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 text-sm text-slate-100 placeholder-slate-500 transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchFocused(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 text-xs transition-colors"
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
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-medium transition-all"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Quick helper pills below input */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 px-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Quick help:
              </span>
              {COMMON_SYMPTOM_SUGGESTIONS.slice(0, 5).map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSuggestionClick(item.query)}
                  className={`text-[11px] px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    searchQuery.toLowerCase() === item.query.toLowerCase()
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'bg-slate-900/80 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Live Instant Search Dropdown Popover */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 top-full mt-3 z-40 rounded-2xl bg-[#090d16]/98 border border-cyan-500/40 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,245,255,0.15)] backdrop-blur-2xl animate-fadeIn">
                
                {/* CASE 1: Query entered, but DATA NOT FOUND */}
                {trimmedQuery && matchedDoctors.length === 0 && (
                  <div className="py-2 text-left space-y-3">
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200">
                      <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            DATA NOT FOUND
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">
                          No Clinical Records Found for "{searchQuery}"
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          We could not find any active doctor, medical department, or symptom matching your search in our current OPD roster.
                        </p>
                      </div>
                    </div>

                    {/* Helpful Assistance & Guidance */}
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Recommended Search Suggestions & Symptoms:</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Click any of these available specialties or clinical conditions to find the right consultant immediately:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {COMMON_SYMPTOM_SUGGESTIONS.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => handleSuggestionClick(item.query)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950/50 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-slate-300 transition-all text-left"
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
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-medium transition-colors cursor-pointer"
                      >
                        Clear Search & View All Doctors
                      </button>
                      <span className="text-[11px] text-slate-500 font-mono">
                        OPD Helpline: Ext 101
                      </span>
                    </div>
                  </div>
                )}

                {/* CASE 2: Query entered and MATCHES FOUND */}
                {trimmedQuery && matchedDoctors.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                      <span className="font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Found {matchedDoctors.length} Matching Specialist{matchedDoctors.length > 1 ? 's' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchFocused(false);
                          onBookClick();
                        }}
                        className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
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
                            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between gap-3 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={doc.photoUrl}
                                alt={doc.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-xl object-cover border border-cyan-500/30 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                                  <span>{doc.name}</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                    {doc.chamberNumber}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {dept?.name} • <span className="text-slate-300">{doc.specialization}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectDoctorFromSearch(doc)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shrink-0 transition-all shadow cursor-pointer"
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
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-1.5 border-b border-slate-800">
                      <span className="font-mono text-cyan-300 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Instant OPD Triage & Doctor Search
                      </span>
                      <span className="text-[11px] text-slate-500">Type symptom or doctor name</span>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                        Common Conditions & Symptoms:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {COMMON_SYMPTOM_SUGGESTIONS.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => handleSuggestionClick(item.query)}
                            className="p-2 rounded-xl bg-slate-900/90 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left text-xs text-slate-300 hover:text-cyan-200 transition-all flex items-center justify-between"
                          >
                            <span className="truncate">{item.label}</span>
                            <CornerDownRight className="w-3 h-3 text-cyan-400 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80">
                      <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">Enter</kbd> to jump to doctors roster</span>
                      <button
                        type="button"
                        onClick={() => setIsSearchFocused(false)}
                        className="text-slate-400 hover:text-white"
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
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-white tracking-tight">
                  {stats.totalDoctors} Consultants
                </div>
                <div className="text-xs text-slate-400">Board-Certified Specialists</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Available in clinics today</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-white tracking-tight">
                  480+ / Day
                </div>
                <div className="text-xs text-slate-400">Patients Streamlined</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>{stats.totalTokens} tokens logged today</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-white tracking-tight">
                  6 Core Wings
                </div>
                <div className="text-xs text-slate-400">Advanced Centers of Excellence</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Full diagnostic wings active</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-white tracking-tight">
                  ~{stats.avgConsultMins} Mins
                </div>
                <div className="text-xs text-slate-400">Rolling Consultation Avg</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-purple-300">
              <span>{stats.onTimeRate} punctuality index</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
