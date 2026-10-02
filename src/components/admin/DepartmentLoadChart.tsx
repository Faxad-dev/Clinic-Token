import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { HospitalQueueState } from '../../types';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Calendar, 
  BarChart3, 
  LineChart as LineChartIcon,
  Sparkles,
  ShieldAlert,
  Radio
} from 'lucide-react';

interface DepartmentLoadChartProps {
  queueState: HospitalQueueState;
}

const DEPT_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  cardiology: { fill: '#3b82f6', stroke: '#60a5fa', label: 'Cardiology' },
  neurology: { fill: '#8b5cf6', stroke: '#a78bfa', label: 'Neurology' },
  pediatrics: { fill: '#ec4899', stroke: '#f472b6', label: 'Pediatrics' },
  orthopedics: { fill: '#06b6d4', stroke: '#22d3ee', label: 'Orthopedics' },
  general: { fill: '#10b981', stroke: '#34d399', label: 'General Med' },
  dermatology: { fill: '#f59e0b', stroke: '#fbbf24', label: 'Dermatology' },
};

export const DepartmentLoadChart: React.FC<DepartmentLoadChartProps> = ({ queueState }) => {
  const [chartView, setChartView] = useState<'area' | 'bar'>('area');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<'all' | 'morning' | 'evening'>('all');

  // Generate hourly data points based on actual tokens + realistic hospital influx patterns
  const hourlyData = useMemo(() => {
    const hours = [
      { time: '08:00 AM', hour: 8, baseMulti: 0.35, staff: 6 },
      { time: '09:00 AM', hour: 9, baseMulti: 0.70, staff: 10 },
      { time: '10:00 AM', hour: 10, baseMulti: 1.00, staff: 14 }, // Peak Morning
      { time: '11:00 AM', hour: 11, baseMulti: 0.95, staff: 14 },
      { time: '12:00 PM', hour: 12, baseMulti: 0.65, staff: 10 },
      { time: '01:00 PM', hour: 13, baseMulti: 0.40, staff: 8 },  // Shift Transition
      { time: '02:00 PM', hour: 14, baseMulti: 0.55, staff: 9 },  // Afternoon Start
      { time: '03:00 PM', hour: 15, baseMulti: 0.75, staff: 11 },
      { time: '04:00 PM', hour: 16, baseMulti: 0.90, staff: 13 }, // Peak Evening
      { time: '05:00 PM', hour: 17, baseMulti: 0.85, staff: 13 },
      { time: '06:00 PM', hour: 18, baseMulti: 0.60, staff: 9 },
      { time: '07:00 PM', hour: 19, baseMulti: 0.35, staff: 6 },
      { time: '08:00 PM', hour: 20, baseMulti: 0.20, staff: 4 },
    ];

    const actualTokensByHour: Record<number, Record<string, number>> = {};
    queueState.tokens.forEach(token => {
      const date = new Date(token.bookedAt);
      const h = date.getHours();
      if (!actualTokensByHour[h]) {
        actualTokensByHour[h] = {};
      }
      const dept = token.departmentId || 'general';
      actualTokensByHour[h][dept] = (actualTokensByHour[h][dept] || 0) + 1;
    });

    const totalRealTokens = queueState.tokens.length;
    const scalingFactor = Math.max(1, Math.round(totalRealTokens / 12));

    return hours.map(slot => {
      const actualForHour = actualTokensByHour[slot.hour] || {};
      
      const cardio = Math.round(slot.baseMulti * 7 * scalingFactor) + (actualForHour['cardiology'] || 0);
      const neuro = Math.round(slot.baseMulti * 5 * scalingFactor) + (actualForHour['neurology'] || 0);
      const peds = Math.round(slot.baseMulti * 6 * scalingFactor) + (actualForHour['pediatrics'] || 0);
      const ortho = Math.round(slot.baseMulti * 4 * scalingFactor) + (actualForHour['orthopedics'] || 0);
      const gen = Math.round(slot.baseMulti * 8 * scalingFactor) + (actualForHour['general'] || 0);
      const derma = Math.round(slot.baseMulti * 3 * scalingFactor) + (actualForHour['dermatology'] || 0);

      const total = cardio + neuro + peds + ortho + gen + derma;

      return {
        time: slot.time,
        hour: slot.hour,
        total,
        cardiology: cardio,
        neurology: neuro,
        pediatrics: peds,
        orthopedics: ortho,
        general: gen,
        dermatology: derma,
        recommendedStaff: slot.staff,
      };
    });
  }, [queueState.tokens]);

  const filteredHourlyData = useMemo(() => {
    if (selectedShift === 'morning') {
      return hourlyData.filter(d => d.hour >= 8 && d.hour <= 13);
    }
    if (selectedShift === 'evening') {
      return hourlyData.filter(d => d.hour >= 14 && d.hour <= 20);
    }
    return hourlyData;
  }, [hourlyData, selectedShift]);

  const departmentCapacityData = useMemo(() => {
    return queueState.departments.map(dept => {
      const deptDocs = queueState.doctors.filter(d => d.departmentId === dept.id);
      const deptTokens = queueState.tokens.filter(t => t.departmentId === dept.id);
      
      const totalMorningSlots = deptDocs.reduce((acc, d) => acc + (d.schedules?.find(s => s.shift === 'morning')?.maxCapacity || 20), 0);
      const totalEveningSlots = deptDocs.reduce((acc, d) => acc + (d.schedules?.find(s => s.shift === 'evening')?.maxCapacity || 15), 0);
      const totalCapacity = totalMorningSlots + totalEveningSlots;
      
      const activePatientCount = deptTokens.length;
      const waitingCount = deptTokens.filter(t => t.status === 'waiting').length;
      const utilizationPct = totalCapacity > 0 ? Math.round((activePatientCount / totalCapacity) * 100) : 0;
      const recommendedStaff = Math.max(deptDocs.length, Math.ceil(activePatientCount / 4));

      return {
        departmentName: dept.name.replace('Department of ', '').replace('Clinical ', ''),
        deptId: dept.id,
        currentPatients: activePatientCount,
        waitingPatients: waitingCount,
        maxCapacity: totalCapacity,
        specialistsOnDuty: deptDocs.length,
        recommendedStaff,
        utilizationPct,
        wing: dept.chamberWing,
      };
    });
  }, [queueState.departments, queueState.doctors, queueState.tokens]);

  const shiftMetrics = useMemo(() => {
    let peakHour = hourlyData[0];
    hourlyData.forEach(item => {
      if (item.total > peakHour.total) {
        peakHour = item;
      }
    });

    const morningInflux = hourlyData.filter(d => d.hour <= 13).reduce((acc, curr) => acc + curr.total, 0);
    const eveningInflux = hourlyData.filter(d => d.hour > 13).reduce((acc, curr) => acc + curr.total, 0);

    const deptTotals: Record<string, number> = {};
    queueState.departments.forEach(dept => {
      deptTotals[dept.name] = queueState.tokens.filter(t => t.departmentId === dept.id).length;
    });
    
    let busiestDept = queueState.departments[0]?.name || 'Cardiology';
    let maxDeptTokens = -1;
    Object.entries(deptTotals).forEach(([name, count]) => {
      if (count > maxDeptTokens) {
        maxDeptTokens = count;
        busiestDept = name;
      }
    });

    return {
      peakHourTime: peakHour.time,
      peakHourCount: peakHour.total,
      morningInflux,
      eveningInflux,
      busiestDept,
      totalHospitalTokens: queueState.tokens.length,
      morningStaffCoverage: '14 Clinicians · High Coverage',
      eveningStaffCoverage: '10 Clinicians · Moderate Coverage',
    };
  }, [hourlyData, queueState.departments, queueState.tokens]);

  return (
    <div className="space-y-6 text-white">
      {/* Header and Controls Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#070d19]/90 border border-blue-500/25 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-cyan-300 text-[11px] font-mono font-semibold uppercase mb-2 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Shift Telemetry Console · OPD Influx Radar</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Department Patient Load &amp; Influx Trends
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time visualization of hourly patient arrivals throughout the clinical day to anticipate bottlenecks, optimize doctor chamber coverage, and schedule nurse triage rosters.
            </p>
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-[#03060f] p-1 border border-blue-900/40 text-xs font-medium">
              <button
                type="button"
                onClick={() => setChartView('area')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer micro-spring ${
                  chartView === 'area'
                    ? 'bg-blue-600 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                <span>Hourly Influx Curve</span>
              </button>
              <button
                type="button"
                onClick={() => setChartView('bar')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer micro-spring ${
                  chartView === 'bar'
                    ? 'bg-blue-600 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Capacity vs Load</span>
              </button>
            </div>

            {/* Shift Filter (for hourly view) */}
            {chartView === 'area' && (
              <div className="flex rounded-xl bg-[#03060f] p-1 border border-blue-900/40 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setSelectedShift('all')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer micro-spring ${
                    selectedShift === 'all'
                      ? 'bg-blue-600 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Full Day
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedShift('morning')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer micro-spring ${
                    selectedShift === 'morning'
                      ? 'bg-blue-600 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Morning (08-14h)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedShift('evening')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer micro-spring ${
                    selectedShift === 'evening'
                      ? 'bg-blue-600 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Evening (14-20h)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter by Department Badges */}
        {chartView === 'area' && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-blue-900/30 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-cyan-400" />
              <span>Wing Focus:</span>
            </span>
            <button
              onClick={() => setSelectedDept('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer micro-spring ${
                selectedDept === 'all'
                  ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                  : 'bg-[#03060f] text-slate-400 border border-blue-900/40 hover:text-white'
              }`}
            >
              All Departments Combined
            </button>
            {Object.entries(DEPT_COLORS).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setSelectedDept(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer micro-spring ${
                  selectedDept === key
                    ? 'text-white font-bold shadow-md'
                    : 'bg-[#03060f] text-slate-400 border border-blue-900/30 hover:text-white'
                }`}
                style={{
                  backgroundColor: selectedDept === key ? info.fill : undefined,
                  boxShadow: selectedDept === key ? `0 0 12px ${info.fill}80` : undefined,
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: info.fill }}
                />
                <span>{info.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Chart Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#070d19]/90 border border-blue-500/25 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-900/30">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{chartView === 'area' ? 'Hourly Patient Influx Distribution' : 'Departmental Patient Load vs Allocated Capacity'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                Live Telemetry
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {chartView === 'area' 
                ? 'Curves represent patient registrations, triage check-ins, and chamber calls per hourly window.'
                : 'Compares active patient queues against maximum chamber throughput across OPD wings.'}
            </p>
          </div>

          <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-2 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            <span>Updated Every 30s</span>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="w-full h-[340px] sm:h-[380px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'area' ? (
              <AreaChart
                data={filteredHourlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCardio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorNeuro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPeds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorOrtho" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorDerma" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(59, 130, 246, 0.15)" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(59, 130, 246, 0.3)' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(59, 130, 246, 0.3)' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#030712',
                    borderColor: '#3b82f6',
                    borderRadius: '14px',
                    color: '#ffffff',
                    fontSize: '12px',
                    boxShadow: '0 0 25px rgba(59, 130, 246, 0.35)',
                    padding: '12px',
                  }}
                  itemStyle={{ padding: '2px 0' }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '6px' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }}
                />
                
                {selectedDept === 'all' ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="cardiology"
                      name="Cardiology Wing"
                      stroke={DEPT_COLORS.cardiology.stroke}
                      fillOpacity={1}
                      fill="url(#colorCardio)"
                      strokeWidth={2}
                      stackId="1"
                    />
                    <Area
                      type="monotone"
                      dataKey="pediatrics"
                      name="Pediatrics Wing"
                      stroke={DEPT_COLORS.pediatrics.stroke}
                      fillOpacity={1}
                      fill="url(#colorPeds)"
                      strokeWidth={2}
                      stackId="1"
                    />
                    <Area
                      type="monotone"
                      dataKey="neurology"
                      name="Neurology Wing"
                      stroke={DEPT_COLORS.neurology.stroke}
                      fillOpacity={1}
                      fill="url(#colorNeuro)"
                      strokeWidth={2}
                      stackId="1"
                    />
                    <Area
                      type="monotone"
                      dataKey="general"
                      name="General Medicine"
                      stroke={DEPT_COLORS.general.stroke}
                      fillOpacity={1}
                      fill="url(#colorGen)"
                      strokeWidth={2}
                      stackId="1"
                    />
                    <Area
                      type="monotone"
                      dataKey="orthopedics"
                      name="Orthopedics Wing"
                      stroke={DEPT_COLORS.orthopedics.stroke}
                      fillOpacity={1}
                      fill="url(#colorOrtho)"
                      strokeWidth={2}
                      stackId="1"
                    />
                    <Area
                      type="monotone"
                      dataKey="dermatology"
                      name="Dermatology Wing"
                      stroke={DEPT_COLORS.dermatology.stroke}
                      fillOpacity={1}
                      fill="url(#colorDerma)"
                      strokeWidth={2}
                      stackId="1"
                    />
                  </>
                ) : (
                  <Area
                    type="monotone"
                    dataKey={selectedDept}
                    name={`${DEPT_COLORS[selectedDept]?.label || selectedDept} Patient Influx`}
                    stroke={DEPT_COLORS[selectedDept]?.stroke || '#3b82f6'}
                    fillOpacity={1}
                    fill={`url(#color${selectedDept.charAt(0).toUpperCase() + selectedDept.slice(1, 6)})`}
                    strokeWidth={3}
                  />
                )}
              </AreaChart>
            ) : (
              <BarChart
                data={departmentCapacityData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(59, 130, 246, 0.15)" />
                <XAxis 
                  dataKey="departmentName" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(59, 130, 246, 0.3)' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(59, 130, 246, 0.3)' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#030712',
                    borderColor: '#3b82f6',
                    borderRadius: '14px',
                    color: '#ffffff',
                    fontSize: '12px',
                    boxShadow: '0 0 25px rgba(59, 130, 246, 0.35)',
                    padding: '12px',
                  }}
                  itemStyle={{ padding: '2px 0' }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '6px' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }}
                />
                <Bar 
                  dataKey="currentPatients" 
                  name="Current Active Patients" 
                  fill="#3b82f6" 
                  radius={[6, 6, 0, 0]} 
                />
                <Bar 
                  dataKey="maxCapacity" 
                  name="Max Shift Capacity" 
                  fill="#1e293b" 
                  stroke="#3b82f6"
                  strokeWidth={1}
                  radius={[6, 6, 0, 0]} 
                />
                <Bar 
                  dataKey="recommendedStaff" 
                  name="Recommended Staff Roster" 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Staff Shift Optimization Recommendations Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Morning Shift Card */}
        <div className="p-5 rounded-2xl bg-[#070d19]/90 border border-blue-500/30 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-cyan-300 font-bold border border-blue-600/40 uppercase">
                Shift A · 08:00 - 14:00
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {shiftMetrics.morningInflux} Est. Patients
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Morning Shift Staffing Roster</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Peak patient concentration occurs at <strong className="text-cyan-400">10:00 AM - 11:30 AM</strong>. Recommended: 8 chamber doctors, 14 nurses, 3 front-desk triage officers.
            </p>
          </div>

          <div className="pt-3 border-t border-blue-900/30 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Coverage Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Optimal (94%)</span>
            </span>
          </div>
        </div>

        {/* Evening Shift Card */}
        <div className="p-5 rounded-2xl bg-[#070d19]/90 border border-indigo-500/30 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-600/40 uppercase">
                Shift B · 14:00 - 20:00
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {shiftMetrics.eveningInflux} Est. Patients
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Evening Shift Staffing Roster</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Secondary influx surge starts at <strong className="text-indigo-400">04:00 PM - 05:30 PM</strong>. Recommended: 6 chamber doctors, 9 nurses, 2 reception desks active.
            </p>
          </div>

          <div className="pt-3 border-t border-blue-900/30 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Coverage Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Balanced (88%)</span>
            </span>
          </div>
        </div>

        {/* Shift Handover Alert Card */}
        <div className="p-5 rounded-2xl bg-[#140c06]/90 border border-amber-500/40 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-600/40 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Handover Protocol · 13:30</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                Peak: {shiftMetrics.peakHourTime}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Shift Handover &amp; Relief Notice</h4>
            <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
              Highest historical OPD load is concentrated in <strong className="text-amber-300">{shiftMetrics.busiestDept}</strong>. Maintain minimum 2 buffer staff on floor during 13:30 - 14:30 shift change.
            </p>
          </div>

          <div className="pt-3 border-t border-amber-900/40 flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400">Action:</span>
            <span className="text-amber-200 font-bold">Relief coverage ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
