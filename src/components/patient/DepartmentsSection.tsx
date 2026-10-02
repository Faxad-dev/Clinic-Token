import React from 'react';
import { Department, DepartmentId } from '../../types';
import { 
  HeartPulse, 
  Brain, 
  Activity, 
  Baby, 
  Sparkles, 
  Stethoscope, 
  MapPin, 
  ChevronRight,
  Check,
  Users,
  Flame,
  ArrowRight
} from 'lucide-react';
import { MobileSlider } from '../ui/MobileSlider';

interface DepartmentsSectionProps {
  departments: Department[];
  selectedDepartment: DepartmentId | 'all';
  onSelectDepartment: (id: DepartmentId | 'all') => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  HeartPulse: <HeartPulse className="w-6 h-6 text-rose-500" />,
  Brain: <Brain className="w-6 h-6 text-indigo-500" />,
  Activity: <Activity className="w-6 h-6 text-blue-500" />,
  Baby: <Baby className="w-6 h-6 text-emerald-500" />,
  Sparkles: <Sparkles className="w-6 h-6 text-amber-500" />,
  Stethoscope: <Stethoscope className="w-6 h-6 text-cyan-500" />,
};

const DEPT_THEMES: Record<string, { bgAccent: string; borderAccent: string; textAccent: string; badgeBg: string }> = {
  cardiology: {
    bgAccent: 'from-rose-500/10 via-rose-500/5 to-transparent',
    borderAccent: 'group-hover:border-rose-400/60',
    textAccent: 'text-rose-600',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  neurology: {
    bgAccent: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    borderAccent: 'group-hover:border-indigo-400/60',
    textAccent: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  orthopedics: {
    bgAccent: 'from-blue-500/10 via-blue-500/5 to-transparent',
    borderAccent: 'group-hover:border-blue-400/60',
    textAccent: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  pediatrics: {
    bgAccent: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    borderAccent: 'group-hover:border-emerald-400/60',
    textAccent: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  dermatology: {
    bgAccent: 'from-amber-500/10 via-amber-500/5 to-transparent',
    borderAccent: 'group-hover:border-amber-400/60',
    textAccent: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  general: {
    bgAccent: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
    borderAccent: 'group-hover:border-cyan-400/60',
    textAccent: 'text-cyan-600',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
};

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  departments,
  selectedDepartment,
  onSelectDepartment,
}) => {
  return (
    <section id="departments-section" className="py-16 sm:py-20 bg-slate-900 text-white border-b border-slate-800 scroll-mt-20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-950/30 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase mb-3">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Specialized OPD Wings</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Clinical Specializations &amp; Diagnostics
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Explore hospital departments and symptom-specific clinics. Select any specialty to instantly inspect attending physicians, room telemetry, and open consultation tokens.
            </p>
          </div>

          {/* Quick Filter: All vs Specific */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectDepartment('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                selectedDepartment === 'all'
                  ? 'bg-blue-600 text-white shadow-blue-600/30 ring-2 ring-blue-400/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              Show All 6 Wings
            </button>
          </div>
        </div>

        {/* Departments Grid & Mobile Slider */}
        <MobileSlider desktopGridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => {
            const isSelected = selectedDepartment === dept.id;
            const theme = DEPT_THEMES[dept.id] || DEPT_THEMES.general;

            return (
              <div
                key={dept.id}
                id={`dept-card-${dept.id}`}
                onClick={() => onSelectDepartment(isSelected ? 'all' : dept.id)}
                className={`group relative rounded-3xl p-6 cursor-pointer overflow-hidden transition-all duration-300 border flex flex-col justify-between hover:-translate-y-2 ${
                  isSelected
                    ? 'bg-slate-800/90 border-blue-500 shadow-[0_12px_40px_rgba(59,130,246,0.25)] ring-2 ring-blue-500/50'
                    : `bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 ${theme.borderAccent} hover:shadow-2xl`
                }`}
              >
                {/* Accent gradient behind card */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgAccent} opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                <div className="relative z-10">
                  {/* Top Bar: Icon + Chamber Wing */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="w-13 h-13 rounded-2xl bg-slate-950 border border-slate-700/80 group-hover:border-slate-600 flex items-center justify-center shadow-md">
                      {ICON_MAP[dept.icon] || <Stethoscope className="w-6 h-6 text-blue-400" />}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-full bg-slate-950/80 text-slate-300 border border-slate-800 font-semibold shadow-inner">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{dept.chamberWing}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                        {dept.name}
                      </h3>
                      {isSelected && (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/40">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {dept.description}
                    </p>
                  </div>

                  {/* Common Conditions & Symptoms Pills */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold mb-2">
                      Key Conditions Treated:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.commonDiseases.slice(0, 3).map((disease, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-950/70 text-slate-300 text-[11px] font-medium border border-slate-800 group-hover:border-slate-700 transition-colors"
                        >
                          {disease}
                        </span>
                      ))}
                      {dept.commonDiseases.length > 3 && (
                        <span className="px-2 py-1 rounded-lg bg-slate-950/50 text-slate-400 text-[10px] font-medium border border-slate-800">
                          +{dept.commonDiseases.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer status */}
                <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px]">
                      {dept.activeDoctorsCount} Specialists Active
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>{isSelected ? 'Viewing Doctors' : 'Select Wing'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </MobileSlider>

      </div>
    </section>
  );
};
