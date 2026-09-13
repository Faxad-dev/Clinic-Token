import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  ChevronRight,
  Smartphone,
  Download,
  HomeIcon,
  Package,
  Component,
  Activity,
  ScrollText,
  SunMoon
} from 'lucide-react';
import { queueService } from '../services/queueStore';
import { PWAInstallModal } from './pwa/PWAInstallModal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import { UpgradeBanner } from '@/components/ui/upgrade-banner';

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
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const { isInstalled } = usePWAInstall();

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
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/95 border-b border-slate-800 shadow-[0_2px_15px_rgba(15,23,42,0.4)]">
        {/* Top emergency & system status ticker */}
        <div className="bg-slate-950/90 border-b border-slate-800/80 px-3 sm:px-6 py-1 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-300 font-mono min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="tracking-wider uppercase text-[10px] sm:text-[11px] font-bold text-slate-100 truncate">
              <span className="sm:hidden">Live Queue Sync</span>
              <span className="hidden sm:inline">Live Queue Telemetry Active</span>
            </span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="text-slate-400 hidden md:inline">Zero-Lag Token Broadcast • Sub-second Sync</span>
          </div>

          {/* Upgrade Banner with animated gear icons and smooth enter */}
          {showUpgradeBanner && (
            <div className="hidden lg:flex items-center">
              <UpgradeBanner
                buttonText="Upgrade to Hospital Cloud Pro"
                description="for multi-clinic token telemetry & sub-second sync"
                onClose={() => setShowUpgradeBanner(false)}
                onClick={() => {
                  alert('Hospital Cloud Pro Upgrade: Unlimited Chambers, Custom Hospital Branding & Real-time SMS Gateway.');
                }}
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {authenticatedAdmin && (
              <button
                onClick={() => handleTabClick('admin')}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-all text-[11px] font-mono font-semibold cursor-pointer shadow-sm"
                title="Hospital Administrator Logged In"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="truncate max-w-[90px] sm:max-w-none">Admin: {authenticatedAdmin.username}</span>
              </button>
            )}

            {authenticatedDoctor && (
              <button
                onClick={() => handleTabClick('doctor')}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60 transition-all text-[11px] font-mono font-semibold cursor-pointer"
                title="Attending Physician Logged In"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="truncate max-w-[90px] sm:max-w-none">{authenticatedDoctor.name}</span>
                <span className="text-[10px] text-emerald-400 hidden sm:inline font-bold">({authenticatedDoctor.chamberNumber})</span>
              </button>
            )}

            {activeToken && (
              <button
                onClick={() => {
                  onOpenTracker();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-500/50 text-blue-300 hover:bg-blue-900/60 transition-all text-[11px] font-mono font-bold cursor-pointer animate-pulse"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span className="hidden xs:inline">Token:</span> <strong>{activeToken.tokenDisplay}</strong>
              </button>
            )}

            <button
              onClick={handleReset}
              title="Reset queue state for fresh demo"
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors px-1.5 sm:px-2 py-0.5 rounded hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline font-medium">Reset</span>
            </button>
          </div>
        </div>

        {/* Main navigation row */}
        <div 
          style={{ backgroundColor: 'var(--color-slate-900)' }}
          className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 bg-slate-900"
        >
          {/* Logo & Brand */}
          <div 
            onClick={() => handleTabClick('patient')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 group-hover:bg-blue-500 transition-all">
              <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-105 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  AURA NEXUS
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-900/60 border border-blue-700/60 text-blue-300 tracking-wider font-bold">
                  MED•OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden lg:block font-medium">
                Hospital OPD Telemetry & Token Management
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Navigation Bar (md+) with Apple-Style Dock */}
          <motion.nav 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="hidden md:flex items-center justify-center relative overflow-visible"
          >
            <Dock 
              className="items-center bg-[#141518]/95 border border-white/10 shadow-2xl px-2 sm:px-2.5 py-1 gap-1.5 sm:gap-2 rounded-full backdrop-blur-xl"
              panelHeight={50}
              magnification={62}
              distance={120}
            >
              {/* 1. Home / Patient OPD */}
              <DockItem
                id="nav-tab-patient"
                onClick={() => handleTabClick('patient')}
                className={`aspect-square rounded-full flex items-center justify-center transition-all relative ${
                  activePanel === 'patient'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 border border-blue-400/50'
                    : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700/90 hover:text-white border border-white/5'
                }`}
                aria-label="Patient OPD Portal"
              >
                <DockLabel>Patient OPD</DockLabel>
                <DockIcon>
                  <HomeIcon className="w-5 h-5" />
                </DockIcon>
                {activePanel === 'patient' && (
                  <span className="w-1 h-1 rounded-full bg-cyan-300 absolute bottom-1"></span>
                )}
              </DockItem>

              {/* 2. Products / Medical Specialties */}
              <DockItem
                id="nav-tab-departments"
                onClick={() => {
                  handleTabClick('patient');
                  const el = document.getElementById('departments-section') || document.getElementById('doctors-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="aspect-square rounded-full flex items-center justify-center transition-all relative bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700/90 hover:text-white border border-white/5"
                aria-label="Medical Specialties Roster"
              >
                <DockLabel>Specialties</DockLabel>
                <DockIcon>
                  <Package className="w-5 h-5" />
                </DockIcon>
              </DockItem>

              {/* 3. Components / Doctor Console */}
              <DockItem
                id="nav-tab-doctor"
                onClick={() => handleTabClick('doctor')}
                className={`aspect-square rounded-full flex items-center justify-center transition-all relative ${
                  activePanel === 'doctor'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 border border-blue-400/50'
                    : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700/90 hover:text-white border border-white/5'
                }`}
                aria-label="Doctor Console"
              >
                <DockLabel>{authenticatedDoctor ? `Dr. ${authenticatedDoctor.name}` : 'Doctor Console'}</DockLabel>
                <DockIcon>
                  <Component className="w-5 h-5" />
                </DockIcon>
                {authenticatedDoctor ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-0.5 right-0.5 ring-2 ring-neutral-900" title="Active Doctor Session"></span>
                ) : null}
                {activePanel === 'doctor' && (
                  <span className="w-1 h-1 rounded-full bg-cyan-300 absolute bottom-1"></span>
                )}
              </DockItem>

              {/* 4. Activity / Live Token Radar */}
              <DockItem
                id="nav-tab-tracker"
                onClick={() => handleTabClick('tracker')}
                className={`aspect-square rounded-full flex items-center justify-center transition-all relative ${
                  activePanel === 'tracker'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 border border-emerald-400/50'
                    : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700/90 hover:text-white border border-white/5'
                }`}
                aria-label="Live Token Radar"
              >
                <DockLabel>Token Radar</DockLabel>
                <DockIcon>
                  <Activity className="w-5 h-5" />
                </DockIcon>
                {activeToken && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 absolute -top-0.5 -right-0.5 animate-ping"></span>
                )}
                {activePanel === 'tracker' && (
                  <span className="w-1 h-1 rounded-full bg-emerald-200 absolute bottom-1"></span>
                )}
              </DockItem>

              {/* 5. Change Log / Admin Reception Desk */}
              <DockItem
                id="nav-tab-admin"
                onClick={() => handleTabClick('admin')}
                className={`aspect-square rounded-full flex items-center justify-center transition-all relative ${
                  activePanel === 'admin'
                    ? 'bg-slate-700 text-white shadow-lg border border-slate-400/50'
                    : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700/90 hover:text-white border border-white/5'
                }`}
                aria-label="Admin Reception Desk"
              >
                <DockLabel>{authenticatedAdmin ? `Admin: ${authenticatedAdmin.username}` : 'Admin Desk'}</DockLabel>
                <DockIcon>
                  <ScrollText className="w-5 h-5" />
                </DockIcon>
                {authenticatedAdmin ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-0.5 right-0.5 ring-2 ring-neutral-900" title="Admin Active"></span>
                ) : null}
                {activePanel === 'admin' && (
                  <span className="w-1 h-1 rounded-full bg-cyan-300 absolute bottom-1"></span>
                )}
              </DockItem>

              {/* 6. 3D Cinematic Animation */}
              <DockItem
                id="nav-tab-cinematic"
                onClick={() => handleTabClick('cinematic')}
                className={`aspect-square rounded-full flex items-center justify-center transition-all relative ${
                  activePanel === 'cinematic'
                    ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg border border-cyan-400/50'
                    : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700/90 hover:text-white border border-white/5'
                }`}
                aria-label="3D Hardware Animation"
              >
                <DockLabel>3D Animation</DockLabel>
                <DockIcon>
                  <Sparkles className="w-5 h-5" />
                </DockIcon>
                {activePanel === 'cinematic' && (
                  <span className="w-1 h-1 rounded-full bg-white absolute bottom-1"></span>
                )}
              </DockItem>

              {/* 7. Live Simulator */}
              <DockItem
                id="nav-tab-simulator"
                onClick={() => handleTabClick('simulator')}
                className={`aspect-square rounded-full flex items-center justify-center transition-all relative ${
                  activePanel === 'simulator'
                    ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400/50'
                    : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700/90 hover:text-white border border-white/5'
                }`}
                aria-label="Split Screen Live Simulator"
              >
                <DockLabel>Simulator</DockLabel>
                <DockIcon>
                  <Layers className="w-5 h-5" />
                </DockIcon>
                {activePanel === 'simulator' && (
                  <span className="w-1 h-1 rounded-full bg-cyan-300 absolute bottom-1"></span>
                )}
              </DockItem>
            </Dock>
          </motion.nav>

          {/* Desktop Right Controls */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              id="btn-nav-install-pwa"
              onClick={() => setIsPWAOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow"
              title="Install Aura Nexus as a Mobile or Desktop App"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isInstalled ? "App Active" : "Install App"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </button>
          </div>

          {/* Mobile Right Controls: Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-slate-200" />}
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

            {/* Mobile App PWA Install Link */}
            <button
              onClick={() => {
                setIsPWAOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-slate-900 to-blue-950 text-white border border-cyan-500/40 shadow-md cursor-pointer transition-all hover:border-cyan-400"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>Install Mobile App</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 font-bold">
                      PWA
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-normal">Add directly to phone home screen</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-cyan-300" />
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

      <PWAInstallModal
        isOpen={isPWAOpen}
        onClose={() => setIsPWAOpen(false)}
      />
    </>
  );
};
