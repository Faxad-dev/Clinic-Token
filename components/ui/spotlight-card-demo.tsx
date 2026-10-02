import React from 'react';
import { GlowCard } from "@/components/ui/spotlight-card";
import { Activity, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';

export function Default() {
  return (
    <div className="w-full min-h-[400px] flex flex-wrap items-center justify-center gap-6 p-6">
      <GlowCard glowColor="blue" size="md">
        <div className="flex flex-col justify-between h-full">
          <div className="p-3 bg-blue-50/80 rounded-xl w-fit border border-blue-200">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Cardiology Radar</h3>
            <p className="text-xs text-slate-600 mt-1">Live token telemetry and chamber synchronicity.</p>
          </div>
        </div>
      </GlowCard>
      <GlowCard glowColor="purple" size="md">
        <div className="flex flex-col justify-between h-full">
          <div className="p-3 bg-purple-50/80 rounded-xl w-fit border border-purple-200">
            <HeartPulse className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Neurology OPD</h3>
            <p className="text-xs text-slate-600 mt-1">Sub-second queue broadcast and consult tracking.</p>
          </div>
        </div>
      </GlowCard>
      <GlowCard glowColor="green" size="md">
        <div className="flex flex-col justify-between h-full">
          <div className="p-3 bg-emerald-50/80 rounded-xl w-fit border border-emerald-200">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Emergency Triage</h3>
            <p className="text-xs text-slate-600 mt-1">24/7 Red Code Trauma priority allocation.</p>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

export default Default;
