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
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200 shadow-[0_2px_15px_rgba(15,23,42,0.05)]">
        {/* Top emergency & system status ticker */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-3 sm:px-6 py-1 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-700 font-mono min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="tracking-wider uppercase text-[10px] sm:text-[11px] font-bold text-slate-900 truncate">
              <span className="sm:hidden">Live Queue Sync</span>
              <span className="hidden sm:inline">Live Queue Telemetry Active</span>
            </span>
            <span className="text-slate-300 hidden md:inline">•</span>
            <span className="text-slate-500 hidden md:inline">Zero-Lag Token Broadcast • Sub-second Sync</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {authenticatedAdmin && (
              <button
                onClick={() => handleTabClick('admin')}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all text-[11px] font-mono font-semibold cursor-pointer shadow-sm"
                title="Hospital Administrator Logged In"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="truncate max-w-[90px] sm:max-w-none">Admin: {authenticatedAdmin.username}</span>
              </button>
            )}

            {authenticatedDoctor && (
              <button
                onClick={() => handleTabClick('doctor')}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition-all text-[11px] font-mono font-semibold cursor-pointer"
                title="Attending Physician Logged In"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span className="truncate max-w-[90px] sm:max-w-none">{authenticatedDoctor.name}</span>
                <span className="text-[10px] text-emerald-700 hidden sm:inline font-bold">({authenticatedDoctor.chamberNumber})</span>
              </button>
            )}

            {activeToken && (
              <button
                onClick={() => {
                  onOpenTracker();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 transition-all text-[11px] font-mono font-bold cursor-pointer animate-pulse"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span className="hidden xs:inline">Token:</span> <strong>{activeToken.tokenDisplay}</strong>
              </button>
            )}

            <button
              onClick={handleReset}
              title="Reset queue state for fresh demo"
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 transition-colors px-1.5 sm:px-2 py-0.5 rounded hover:bg-slate-200/60 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-600" />
              <span className="hidden sm:inline font-medium">Reset</span>
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
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 group-hover:bg-blue-700 transition-all">
              <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-105 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  AURA NEXUS
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 tracking-wider font-bold">
                  MED•OS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden lg:block font-medium">
                Hospital OPD Telemetry & Token Management
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Navigation Bar (md+) */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 shadow-inner overflow-x-auto max-w-full">
            <button
              id="nav-tab-patient"
              onClick={() => handleTabClick('patient')}
              className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activePanel === 'patient'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserRound className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline">Patient Portal</span>
              <span className="lg:hidden">Patient</span>
            </button>

            <button
              id="nav-tab-tracker"
              onClick={() => handleTabClick('tracker')}
              className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap relative cursor-pointer ${
                activePanel === 'tracker'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Tv2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden lg:inline">Live Token Tracker</span>
              <span className="lg:hidden">Radar</span>
              {activeToken && (
                <span className="w-2 h-2 rounded-full bg-blue-600 absolute -top-0.5 -right-0.5 animate-ping"></span>
              )}
            </button>

            <button
              id="nav-tab-doctor"
              onClick={() => handleTabClick('doctor')}
              className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activePanel === 'doctor'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {authenticatedDoctor ? (
                <>
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden lg:inline">Doctor Console</span>
                  <span className="lg:hidden">Doctor</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Doctor Session"></span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden lg:inline">Doctor Portal</span>
                  <span className="lg:hidden">Doctor</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Sign In
                  </span>
                </>
              )}
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => handleTabClick('admin')}
              className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activePanel === 'admin'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {authenticatedAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
                  <span className="hidden lg:inline">Admin / Reception</span>
                  <span className="lg:hidden">Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Admin Logged In (Fahad)"></span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden lg:inline">Admin / Reception</span>
                  <span className="lg:hidden">Admin</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                    Fahad
                  </span>
                </>
              )}
            </button>

            <button
              id="nav-tab-cinematic"
              onClick={() => handleTabClick('cinematic')}
              className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activePanel === 'cinematic'
                  ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activePanel === 'cinematic' ? 'text-cyan-200' : 'text-blue-600'}`} />
              <span>3D Animation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
            </button>
          </nav>

          {/* Desktop Live Simulator and 3D Cinematic quick toggles */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              id="btn-cinematic-mode"
              onClick={() => handleTabClick('cinematic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                activePanel === 'cinematic'
                  ? 'bg-gradient-to-r from-blue-900 to-indigo-950 text-white border-blue-900 shadow-md'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}
              title="Interactive 3D Hardware Mockup Hero Animation"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>3D Hero</span>
            </button>

            <button
              id="btn-simulator-mode"
              onClick={() => handleTabClick('simulator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                activePanel === 'simulator'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Split Simulator</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono font-bold">
                Live Demo
              </span>
            </button>
          </div>

          {/* Mobile Right Controls: Simulator + Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => handleTabClick('simulator')}
              className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                activePanel === 'simulator'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Split Simulator"
            >
              <Layers className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 shadow-xl animate-fadeIn">
            <button
              onClick={() => handleTabClick('patient')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'patient'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                  <UserRound className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900">Patient OPD Portal</div>
                  <div className="text-[10px] text-slate-500 font-normal">Search specialists, book slots, triage</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleTabClick('tracker')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'tracker'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Tv2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Live Token Radar</span>
                    {activeToken && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">
                        {activeToken.tokenDisplay}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">Live queue progression & audio chime</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleTabClick('doctor')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'doctor'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Doctor Chamber Console</span>
                    {authenticatedDoctor ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                        Sign In
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    {authenticatedDoctor ? `${authenticatedDoctor.name} • ${authenticatedDoctor.chamberNumber}` : 'Call next patient, write prescriptions'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleTabClick('admin')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'admin'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-slate-200 text-slate-800">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Admin & Reception Desk</span>
                    {authenticatedAdmin ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-white font-bold">
                        Fahad (Active)
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        Fahad Sign In
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">Add doctors, credentials, walk-ins, stats</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleTabClick('simulator')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'simulator'
                  ? 'bg-slate-900 text-white border border-slate-900'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold">Split Screen Live Simulator</div>
                  <div className="text-[10px] text-slate-400 font-normal">Side-by-side doctor desk + patient mobile screen</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleTabClick('cinematic')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'cinematic'
                  ? 'bg-gradient-to-r from-blue-900 to-indigo-950 text-white border border-blue-900'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold">3D Cinematic Hardware Mockup</div>
                  <div className="text-[10px] text-slate-400 font-normal">Scroll-driven 3D device tilt & timeline animation</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (md:hidden) for 1-thumb thumb access */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => handleTabClick('patient')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activePanel === 'patient'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserRound className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Patient</span>
        </button>

        <button
          onClick={() => handleTabClick('tracker')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
            activePanel === 'tracker'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tv2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Radar</span>
          {activeToken && (
            <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1 right-2 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('doctor')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
            activePanel === 'doctor'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Doctor</span>
          {authenticatedDoctor && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-2"></span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('admin')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
            activePanel === 'admin'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Admin</span>
          {authenticatedAdmin && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-2"></span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('simulator')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activePanel === 'simulator'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Demo</span>
        </button>
      </nav>
    </>
  );
};
