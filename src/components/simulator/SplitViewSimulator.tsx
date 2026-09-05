import React, { useState } from 'react';
import { DoctorConsole } from '../doctor/DoctorConsole';
import { LiveTokenTracker } from '../patient/LiveTokenTracker';
import { PatientToken } from '../../types';
import { queueService } from '../../services/queueStore';
import { Layers, Stethoscope, Smartphone, Sparkles, Volume2 } from 'lucide-react';
import { soundEngine } from '../AudioChime';

export const SplitViewSimulator: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<PatientToken | null>(() => {
    const tokens = queueService.getState().tokens;
    return tokens.find((t) => t.tokenDisplay === 'TK-014') || tokens[0] || null;
  });

  return (
    <div className="py-6 max-w-[1550px] mx-auto px-4 sm:px-6 space-y-6">
      {/* Simulator Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/40 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-300">
          <Layers className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-sm text-white">Live Multi-Panel Queue Simulator</div>
            <div className="text-slate-400">
              Test sub-second queue synchronization: Click <strong className="text-cyan-300">"Call Next Patient"</strong> on the Doctor Desk (Left) and watch the Patient Phone (Right) instantly sound the chime and advance in real time!
            </div>
          </div>
        </div>

        <button
          onClick={() => soundEngine.playTokenCallChime()}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-mono flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span>Test Audio Chime</span>
        </button>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Doctor Consultation Chamber (7 Cols) */}
        <div className="xl:col-span-7 rounded-3xl border border-cyan-500/30 bg-slate-950/60 overflow-hidden shadow-2xl">
          <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>Doctor Consultation Desk (Chamber 301)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              Broadcast Host
            </span>
          </div>

          <div className="p-2 sm:p-4">
            <DoctorConsole initialDoctorId="doc-1" />
          </div>
        </div>

        {/* Right Side: Patient Phone Tracker (5 Cols) */}
        <div className="xl:col-span-5 rounded-3xl border border-emerald-500/30 bg-slate-950/60 overflow-hidden shadow-2xl">
          <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Patient Mobile Screen (Live Listener)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 animate-pulse">
              Listening to Broadcast
            </span>
          </div>

          <div className="p-2 sm:p-4">
            <LiveTokenTracker
              initialToken={selectedToken}
              onSelectToken={(t) => setSelectedToken(t)}
              onBookNew={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
