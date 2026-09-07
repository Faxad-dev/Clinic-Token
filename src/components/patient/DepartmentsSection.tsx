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
  HeartPulse: <HeartPulse className="w-5 h-5 text-rose-600" />,
  Brain: <Brain className="w-5 h-5 text-indigo-600" />,
  Activity: <Activity className="w-5 h-5 text-blue-600" />,
  Baby: <Baby className="w-5 h-5 text-amber-600" />,
  Sparkles: <Sparkles className="w-5 h-5 text-emerald-600" />,
  Stethoscope: <Stethoscope className="w-5 h-5 text-blue-700" />,
};

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  departments,
  selectedDepartment,
  onSelectDepartment,
}) => {
  return (
    <section className="py-12 border-b border-slate-200 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase font-mono tracking-widest text-blue-700 font-bold mb-1">
              Clinical Specializations
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Explore Departments & Symptoms
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl font-normal">
              Select a specialized department or disease condition to see available consultants, OPD slots, and active queue counts.
            </p>
          </div>

          {/* Quick Filter: All Departments */}
          <button
            onClick={() => onSelectDepartment('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm ${
              selectedDepartment === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-600/20'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
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
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden group shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'bg-blue-50/40 border-blue-600 shadow-[0_4px_20px_rgba(37,99,235,0.12)] ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 group-hover:border-blue-300 transition-colors shadow-sm">
                    {ICON_MAP[dept.icon] || <Stethoscope className="w-5 h-5 text-blue-600" />}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>{dept.chamberWing}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {dept.name}
                    </h3>
                    {isSelected && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                {/* Common Conditions Chips */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold mb-2">
                    Conditions & Symptoms:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.commonDiseases.slice(0, 3).map((disease, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] border border-slate-200 group-hover:border-slate-300 transition-colors font-medium"
                      >
                        {disease}
                      </span>
                    ))}
                    {dept.commonDiseases.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">
                        +{dept.commonDiseases.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer status */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-600 font-medium pt-1">
                  <span className="text-blue-700 font-semibold">
                    {dept.activeDoctorsCount} Specialists on duty
                  </span>
                  <div className="flex items-center gap-1 text-slate-500 group-hover:text-blue-600 transition-colors">
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
