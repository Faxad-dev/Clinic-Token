import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Clock, 
  Users, 
  Stethoscope, 
  ShieldCheck, 
  Zap, 
  Phone,
  ChevronRight,
  Radio
} from 'lucide-react';
import { queueService } from '../../services/queueStore';

interface LiveTelemetryBarProps {
  onOpenTracker: () => void;
  onScrollToDoctors: () => void;
}

export const LiveTelemetryBar: React.FC<LiveTelemetryBarProps> = ({
  onOpenTracker,
  onScrollToDoctors,
}) => {
  const [stats, setStats] = useState(queueService.getHospitalStats());
  const [activeServing, setActiveServing] = useState<string>('TK-014');

  useEffect(() => {
    const unsub = queueService.subscribe((state) => {
      setStats(queueService.getHospitalStats());
      const serving = state.tokens.find((t) => t.status === 'in-progress');
      if (serving) {
        setActiveServing(serving.tokenDisplay);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="w-full bg-[#030712]/95 border-y border-blue-900/30 text-white relative z-20 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Left: Live Pulse Status & Current Token */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold tracking-tight shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"></span>
              </span>
              <span>LIVE OPD TELEMETRY</span>
            </div>

            <div 
              onClick={onOpenTracker}
              className="min-h-[44px] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#081026] border border-blue-500/50 text-cyan-300 hover:text-white hover:bg-blue-950/80 transition-all text-xs font-medium cursor-pointer group shadow-[0_0_15px_rgba(59,130,246,0.2)] micro-spring"
              title="Click to track live queue radar"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform animate-pulse" />
              <span className="text-slate-300">Now Serving:</span>
              <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-blue-600/50 border border-blue-400/50 shadow-[0_0_8px_rgba(59,130,246,0.4)]">
                {activeServing}
              </span>
              <ChevronRight className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Center: Live Hospital Metrics Grid */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#070c18] border border-blue-900/30">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Avg Wait Time</div>
                <div className="font-bold text-white font-mono flex items-center gap-1.5">
                  <span>{stats.avgConsultMins} mins</span>
                  <span className="text-emerald-400 text-[10px] font-sans">(-3m optimal)</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#070c18] border border-blue-900/30">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Active Chambers</div>
                <div className="font-bold text-white font-mono">
                  {stats.totalDoctors} Specialists Consulting
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#070c18] border border-blue-900/30">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Tokens Synced</div>
                <div className="font-bold text-white font-mono">
                  {stats.totalTokens} Patients Today
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Triage Hotline */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-center lg:justify-end">
            <a 
              href="tel:+92042111287200" 
              className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all micro-spring"
            >
              <Phone className="w-3 h-3 text-rose-400" />
              <span className="font-mono">Emergency: 24/7 Red Code</span>
            </a>

            <button
              onClick={onScrollToDoctors}
              className="min-h-[44px] px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-[0_0_18px_rgba(59,130,246,0.35)] transition-all cursor-pointer flex items-center justify-center gap-1 micro-spring"
            >
              <span>Book Token</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
