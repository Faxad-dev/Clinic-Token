import React, { useState } from 'react';
import { ActivePanel, PatientToken, Doctor } from '../types';
import { AdminUser } from '../services/adminAuthStore';
import { 
  HeartPulse, 
  UserRound, 
  Stethoscope, 
  ShieldCheck, 
  Tv2, 
  Sparkles,
  Layers,
  Menu,
  X,
  ChevronRight,
  Smartphone,
  Download,
  Building2,
  Users,
  Radio
} from 'lucide-react';
import { PWAInstallModal } from './pwa/PWAInstallModal';
import { usePWAInstall } from '../hooks/usePWAInstall';

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
  const [isPWAOpen, setIsPWAOpen] = useState(false);
  const { isInstalled } = usePWAInstall();

  const handleTabClick = (panel: ActivePanel) => {
    setActivePanel(panel);
    setMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    if (activePanel !== 'patient') {
      setActivePanel('patient');
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#030712]/95 border-b border-blue-900/30 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        {/* Main Navigation Row */}
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Logo & Brand */}
            <div 
              onClick={() => handleTabClick('patient')}
              className="flex items-center gap-3 cursor-pointer group shrink-0 select-none"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:scale-105 transition-all">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    AURA NEXUS
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-950 border border-blue-600/50 text-cyan-300 tracking-wider font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    MED•OS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden xl:block font-medium">
                  Hospital OPD Telemetry & Token Management
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-[#060c18]/90 border border-blue-900/40 rounded-2xl p-1.5 shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]">
              <button
                id="nav-tab-patient"
                onClick={() => handleTabClick('patient')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer micro-spring ${
                  activePanel === 'patient'
                    ? 'bg-blue-600 text-white shadow-[0_0_18px_rgba(59,130,246,0.45)]'
                    : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
                }`}
              >
                <UserRound className="w-3.5 h-3.5" />
                <span>Patient Portal</span>
              </button>

              <button
                id="nav-tab-departments"
                onClick={() => scrollToSection('departments-section')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-blue-950/40 transition-all cursor-pointer micro-spring"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Specialties</span>
              </button>

              <button
                id="nav-tab-doctors"
                onClick={() => scrollToSection('doctors-section')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-blue-950/40 transition-all cursor-pointer micro-spring"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Doctors</span>
              </button>

              <button
                id="nav-tab-tracker"
                onClick={() => handleTabClick('tracker')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative micro-spring ${
                  activePanel === 'tracker'
                    ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
                }`}
              >
                <Tv2 className="w-3.5 h-3.5" />
                <span>Live Radar</span>
                {activeToken && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                )}
              </button>

              <button
                id="nav-tab-simulator"
                onClick={() => handleTabClick('simulator')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer micro-spring ${
                  activePanel === 'simulator'
                    ? 'bg-indigo-600 text-white shadow-[0_0_18px_rgba(99,102,241,0.45)]'
                    : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Simulator</span>
              </button>
            </nav>

            {/* Desktop Right Action Portals (Doctor / Admin / PWA) */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <button
                id="nav-btn-doctor-login"
                onClick={() => {
                  if (authenticatedDoctor) {
                    handleTabClick('doctor');
                  } else if (onOpenDoctorLogin) {
                    onOpenDoctorLogin();
                  } else {
                    handleTabClick('doctor');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer micro-spring ${
                  activePanel === 'doctor'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    : 'bg-[#080e1d] text-slate-200 border-blue-900/40 hover:bg-blue-950/60 hover:text-white hover:border-blue-700/60'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                <span>{authenticatedDoctor ? 'Doctor Desk' : 'Doctor Portal'}</span>
              </button>

              <button
                id="nav-btn-admin-login"
                onClick={() => {
                  if (authenticatedAdmin) {
                    handleTabClick('admin');
                  } else if (onOpenAdminLogin) {
                    onOpenAdminLogin();
                  } else {
                    handleTabClick('admin');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer micro-spring ${
                  activePanel === 'admin'
                    ? 'bg-cyan-700 text-white border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-[#080e1d] text-slate-200 border-blue-900/40 hover:bg-blue-950/60 hover:text-white hover:border-blue-700/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>{authenticatedAdmin ? 'Admin Desk' : 'Admin'}</span>
              </button>

              <button
                id="btn-nav-install-pwa"
                onClick={() => setIsPWAOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200 text-xs font-bold transition-all cursor-pointer micro-spring shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                title="Install Aura Nexus as Mobile or Desktop App"
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xl:inline">{isInstalled ? 'App Active' : 'Install App'}</span>
                <span className="xl:hidden">PWA</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </button>
            </div>

            {/* Mobile / Tablet Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {activeToken && (
                <button
                  onClick={() => handleTabClick('tracker')}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center"
                >
                  {activeToken.tokenDisplay}
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-slate-200" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-2 shadow-2xl animate-fadeIn text-slate-200">
            <button
              onClick={() => handleTabClick('patient')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'patient'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <UserRound className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Patient Portal</div>
                  <div className="text-[11px] text-slate-400">Book specialists & live queue explorer</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => scrollToSection('departments-section')}
              className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Clinical Specialties</div>
                  <div className="text-[11px] text-slate-400">Cardiology, Neurology, Pediatrics & more</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => scrollToSection('doctors-section')}
              className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Doctors Directory</div>
                  <div className="text-[11px] text-slate-400">Available consultants & live chamber slots</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleTabClick('tracker')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'tracker'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Tv2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Live Token Radar</span>
                    {activeToken && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-bold">
                        {activeToken.tokenDisplay}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">Live position, estimated wait & audio chime</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleTabClick('doctor')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'doctor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Doctor Chamber Console</span>
                    {authenticatedDoctor && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {authenticatedDoctor ? `${authenticatedDoctor.name} (${authenticatedDoctor.chamberNumber})` : 'Call next patient & triage'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleTabClick('admin')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'admin'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-700 text-slate-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Admin Reception Desk</span>
                    {authenticatedAdmin && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-cyan-300 font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">Reception walk-ins, doctors roster & queue stats</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleTabClick('simulator')}
              className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Live Split-Screen Simulator</div>
                  <div className="text-[11px] text-slate-400">Test doctor chamber + patient mobile live</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleTabClick('cinematic')}
              className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">3D Hardware Mockup Tour</div>
                  <div className="text-[11px] text-slate-400">Interactive device tilt & timeline</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Install PWA Option in drawer */}
            <button
              onClick={() => {
                setIsPWAOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-900/60 to-cyan-900/60 text-white border border-cyan-500/40 shadow-md cursor-pointer transition-all hover:border-cyan-400"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>Install Hospital Mobile App</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 font-bold">
                      PWA
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">Add to home screen for offline token updates</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-cyan-300" />
            </button>
          </div>
        )}
      </header>

      {/* Mobile Sticky Bottom Bar (Thumb Navigation on small phones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-2 sm:px-3 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => handleTabClick('patient')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center py-1 px-2.5 sm:px-3 rounded-xl transition-all cursor-pointer ${
            activePanel === 'patient'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserRound className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">OPD</span>
        </button>

        <button
          onClick={() => handleTabClick('tracker')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center py-1 px-2.5 sm:px-3 rounded-xl transition-all relative cursor-pointer ${
            activePanel === 'tracker'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tv2 className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Radar</span>
          {activeToken && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-2 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('doctor')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center py-1 px-2.5 sm:px-3 rounded-xl transition-all relative cursor-pointer ${
            activePanel === 'doctor'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Stethoscope className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Doctor</span>
          {authenticatedDoctor && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-2"></span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('admin')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center py-1 px-2.5 sm:px-3 rounded-xl transition-all relative cursor-pointer ${
            activePanel === 'admin'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Admin</span>
          {authenticatedAdmin && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-2"></span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('simulator')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center py-1 px-2.5 sm:px-3 rounded-xl transition-all cursor-pointer ${
            activePanel === 'simulator'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Simulator</span>
        </button>
      </nav>

      <PWAInstallModal
        isOpen={isPWAOpen}
        onClose={() => setIsPWAOpen(false)}
      />
    </>
  );
};
