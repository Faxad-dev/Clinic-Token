import React, { useState } from 'react';
import { ActivePanel, PatientToken, Doctor } from '../types';
import { AdminUser } from '../services/adminAuthStore';
import { 
  HeartPulse, 
  UserRound, 
  Stethoscope, 
  ShieldCheck, 
  Tv2, 
  RotateCcw,
  Sparkles,
  Layers,
  Lock,
  UserCheck,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { queueService } from '../services/queueStore';

interface NavbarProps {
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
  activeToken: PatientToken | null;
  onOpenTracker: () => void;
  authenticatedDoctor?: Doctor | null;
  onOpenDoctorLogin?: () => void;
  authenticatedAdmin?: AdminUser | null;
  onOpenAdminLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePanel,
  setActivePanel,
  activeToken,
  onOpenTracker,
  authenticatedDoctor,
  onOpenDoctorLogin,
  authenticatedAdmin,
  onOpenAdminLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset queue state to default sample data for live demonstration?')) {
      queueService.resetQueueForDemo();
    }
  };

  const handleTabClick = (panel: ActivePanel) => {
    setActivePanel(panel);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0f17]/90 border-b border-cyan-500/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        {/* Top emergency & system status ticker */}
        <div className="bg-gradient-to-r from-cyan-950/50 via-blue-950/60 to-slate-900/50 border-b border-cyan-500/10 px-3 sm:px-6 py-1 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-cyan-400 font-mono min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wider uppercase text-[10px] sm:text-[11px] font-semibold truncate">
              <span className="sm:hidden">Live Queue Sync</span>
              <span className="hidden sm:inline">Live Queue Telemetry Active</span>
            </span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-slate-400 hidden md:inline">Zero-Lag Token Broadcast • Sub-second Sync</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {authenticatedAdmin && (
              <button
                onClick={() => handleTabClick('admin')}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 hover:bg-purple-500/25 transition-all text-[11px] font-mono font-medium"
                title="Hospital Administrator Logged In"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span className="truncate max-w-[80px] sm:max-w-none">Admin: {authenticatedAdmin.username}</span>
              </button>
            )}

            {authenticatedDoctor && (
              <button
                onClick={() => handleTabClick('doctor')}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 transition-all text-[11px] font-mono font-medium"
                title="Attending Physician Logged In"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="truncate max-w-[80px] sm:max-w-none">{authenticatedDoctor.name}</span>
                <span className="text-[10px] text-emerald-400/80 hidden sm:inline">({authenticatedDoctor.chamberNumber})</span>
              </button>
            )}

            {activeToken && (
              <button
                onClick={() => {
                  onOpenTracker();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 transition-all text-[11px] font-mono font-medium animate-pulse"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="hidden xs:inline">Token:</span> <strong className="text-white">{activeToken.tokenDisplay}</strong>
              </button>
            )}

            <button
              onClick={handleReset}
              title="Reset queue state for fresh demo"
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors px-1.5 sm:px-2 py-0.5 rounded hover:bg-white/5"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Main navigation row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div 
            onClick={() => handleTabClick('patient')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all">
              <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  AURA NEXUS
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1 sm:px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 tracking-wider font-semibold">
                  MED•OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden lg:block">
                Hospital Appointment & Live Token System
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Navigation Bar (md+) */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner overflow-x-auto max-w-full">
            <button
              id="nav-tab-patient"
              onClick={() => handleTabClick('patient')}
              className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activePanel === 'patient'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <UserRound className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Patient Portal</span>
              <span className="lg:hidden">Patient</span>
            </button>

            <button
              id="nav-tab-tracker"
              onClick={() => handleTabClick('tracker')}
              className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative ${
                activePanel === 'tracker'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Tv2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Live Token Tracker</span>
              <span className="lg:hidden">Radar</span>
              {activeToken && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 absolute -top-0.5 -right-0.5 animate-ping"></span>
              )}
            </button>

            <button
              id="nav-tab-doctor"
              onClick={() => handleTabClick('doctor')}
              className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activePanel === 'doctor'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {authenticatedDoctor ? (
                <>
                  <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden lg:inline">Doctor Console</span>
                  <span className="lg:hidden">Doctor</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active Doctor Session"></span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden lg:inline">Doctor Portal</span>
                  <span className="lg:hidden">Doctor</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Sign In
                  </span>
                </>
              )}
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => handleTabClick('admin')}
              className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activePanel === 'admin'
                  ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {authenticatedAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden lg:inline">Admin / Reception</span>
                  <span className="lg:hidden">Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Admin Logged In (Fahad)"></span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden lg:inline">Admin / Reception</span>
                  <span className="lg:hidden">Admin</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    Fahad
                  </span>
                </>
              )}
            </button>
          </nav>

          {/* Desktop Live Simulator quick toggle */}
          <div className="hidden lg:flex items-center">
            <button
              id="btn-simulator-mode"
              onClick={() => handleTabClick('simulator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                activePanel === 'simulator'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-900/90 text-emerald-400 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/30'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Split Simulator</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-400/20 text-emerald-300 rounded font-mono">
                Live Demo
              </span>
            </button>
          </div>

          {/* Mobile Right Controls: Simulator + Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => handleTabClick('simulator')}
              className={`p-2 rounded-xl border text-xs transition-all ${
                activePanel === 'simulator'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-900 text-emerald-400 border-slate-700'
              }`}
              title="Split Simulator"
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 hover:border-cyan-400 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5 text-slate-200" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#090d16]/98 border-b border-cyan-500/30 px-4 py-4 space-y-2 backdrop-blur-2xl shadow-2xl animate-fadeIn">
            <button
              onClick={() => handleTabClick('patient')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                activePanel === 'patient'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/70 text-slate-300 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                  <UserRound className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Patient OPD Portal</div>
                  <div className="text-[10px] text-slate-400 font-normal">Search specialists, book slots, triage</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => handleTabClick('tracker')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                activePanel === 'tracker'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/70 text-slate-300 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Tv2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Live Token Radar</span>
                    {activeToken && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        {activeToken.tokenDisplay}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">Live queue progression & audio chime</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => handleTabClick('doctor')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                activePanel === 'doctor'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/70 text-slate-300 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Doctor Chamber Console</span>
                    {authenticatedDoctor ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                        Sign In
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {authenticatedDoctor ? `${authenticatedDoctor.name} • ${authenticatedDoctor.chamberNumber}` : 'Call next patient, write prescriptions'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => handleTabClick('admin')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                activePanel === 'admin'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-900/70 text-slate-300 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Admin & Reception Desk</span>
                    {authenticatedAdmin ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                        Fahad (Active)
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                        Fahad Sign In
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">Add doctors, credentials, walk-ins, stats</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => handleTabClick('simulator')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                activePanel === 'simulator'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900/70 text-slate-300 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Split Screen Live Simulator</div>
                  <div className="text-[10px] text-slate-400 font-normal">Side-by-side doctor desk + patient mobile screen</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        )}
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (md:hidden) for 1-thumb thumb access */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-cyan-500/20 px-2 py-1.5 flex items-center justify-around shadow-[0_-5px_20px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => handleTabClick('patient')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activePanel === 'patient'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserRound className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Patient</span>
        </button>

        <button
          onClick={() => handleTabClick('tracker')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
            activePanel === 'tracker'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tv2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Radar</span>
          {activeToken && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1 right-2 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('doctor')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
            activePanel === 'doctor'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Stethoscope className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Doctor</span>
          {authenticatedDoctor && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1 right-2"></span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('admin')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
            activePanel === 'admin'
              ? 'text-purple-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Admin</span>
          {authenticatedAdmin && (
            <span className="w-2 h-2 rounded-full bg-purple-400 absolute top-1 right-2"></span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('simulator')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activePanel === 'simulator'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Demo</span>
        </button>
      </nav>
    </>
  );
};
