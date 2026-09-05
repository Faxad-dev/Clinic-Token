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
  Check
} from 'lucide-react';

interface DepartmentsSectionProps {
  departments: Department[];
  selectedDepartment: DepartmentId | 'all';
  onSelectDepartment: (id: DepartmentId | 'all') => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  HeartPulse: <HeartPulse className="w-5 h-5 text-rose-400" />,
  Brain: <Brain className="w-5 h-5 text-indigo-400" />,
  Activity: <Activity className="w-5 h-5 text-cyan-400" />,
  Baby: <Baby className="w-5 h-5 text-amber-400" />,
  Sparkles: <Sparkles className="w-5 h-5 text-emerald-400" />,
  Stethoscope: <Stethoscope className="w-5 h-5 text-blue-400" />,
};

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  departments,
  selectedDepartment,
  onSelectDepartment,
}) => {
  return (
    <section className="py-12 border-b border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-semibold mb-1">
              Clinical Specializations
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Explore Departments & Symptoms
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Select a specialized department or disease condition to see available consultants, OPD slots, and active queue counts.
            </p>
          </div>

          {/* Quick Filter: All Departments */}
          <button
            onClick={() => onSelectDepartment('all')}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              selectedDepartment === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Show All Departments
          </button>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => {
            const isSelected = selectedDepartment === dept.id;

            return (
              <div
                key={dept.id}
                id={`dept-card-${dept.id}`}
                onClick={() => onSelectDepartment(isSelected ? 'all' : dept.id)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/50 border-slate-800/90 hover:border-cyan-500/40 hover:bg-slate-900/80'
                }`}
              >
                {/* Accent glow corner */}
                <div
                  className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl transition-opacity ${
                    isSelected ? 'bg-cyan-500/20 opacity-100' : 'bg-transparent opacity-0 group-hover:bg-cyan-500/10 group-hover:opacity-100'
                  }`}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner group-hover:border-cyan-500/40 transition-colors">
                    {ICON_MAP[dept.icon] || <Stethoscope className="w-5 h-5 text-cyan-400" />}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{dept.chamberWing}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {dept.name}
                    </h3>
                    {isSelected && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-slate-950">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {dept.description}
                  </p>
                </div>

                {/* Common Conditions Chips */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2">
                    Conditions & Symptoms:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.commonDiseases.slice(0, 3).map((disease, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-[11px] border border-slate-700/50 group-hover:border-slate-600 transition-colors"
                      >
                        {disease}
                      </span>
                    ))}
                    {dept.commonDiseases.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-800/50 text-slate-400 text-[10px]">
                        +{dept.commonDiseases.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer status */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="text-cyan-400/90">
                    {dept.activeDoctorsCount} Specialists on duty
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-cyan-300 transition-colors">
                    <span>{isSelected ? 'Viewing Doctors' : 'Select'}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
