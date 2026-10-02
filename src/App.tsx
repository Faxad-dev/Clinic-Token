import React, { useState, useEffect } from 'react';
import { ActivePanel, Doctor, PatientToken, DepartmentId, HospitalQueueState } from './types';
import { queueService } from './services/queueStore';
import { doctorAuthService } from './services/doctorAuthStore';
import { adminAuthService, AdminUser } from './services/adminAuthStore';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/patient/HeroSection';
import { DepartmentsSection } from './components/patient/DepartmentsSection';
import { DoctorDirectory } from './components/patient/DoctorDirectory';
import { BookingModal } from './components/patient/BookingModal';
import { LiveTokenTracker } from './components/patient/LiveTokenTracker';
import { DoctorConsole } from './components/doctor/DoctorConsole';
import { DoctorLoginPortal } from './components/doctor/DoctorLoginPortal';
import { AdminReceptionPanel } from './components/admin/AdminReceptionPanel';
import { AdminLoginPortal } from './components/admin/AdminLoginPortal';
import { SplitViewSimulator } from './components/simulator/SplitViewSimulator';
import { CinematicHero } from './components/ui/cinematic-landing-hero';
import StackingCardsDemo from '@/components/ui/demo';
import { LiveTelemetryBar } from './components/patient/LiveTelemetryBar';
import { WorkflowSection } from './components/patient/WorkflowSection';
import { HospitalTrustSection } from './components/patient/HospitalTrustSection';
import { TokenProximityAlert } from './components/patient/TokenProximityAlert';
import { NetworkStatusIndicator } from './components/NetworkStatusIndicator';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Switch } from './components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './components/ui/tooltip';
import { 
  HeartPulse, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Github, 
  ChevronUp,
  Activity,
  Ticket,
  Stethoscope,
  Lock,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Mail,
  Send,
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  Moon,
  Sun,
  Twitter
} from 'lucide-react';

export default function App() {
  const [queueState, setQueueState] = useState<HospitalQueueState>(queueService.getState());
  const [activePanel, setActivePanel] = useState<ActivePanel>('patient');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [authenticatedDoctor, setAuthenticatedDoctor] = useState<Doctor | null>(() => 
    doctorAuthService.getAuthenticatedDoctor()
  );
  const [isDoctorLoginModalOpen, setIsDoctorLoginModalOpen] = useState(false);
  const [authenticatedAdmin, setAuthenticatedAdmin] = useState<AdminUser | null>(() =>
    adminAuthService.getAuthenticatedAdmin()
  );
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [cinematicTheme, setCinematicTheme] = useState<'hospital' | 'sobers' | 'stacking-demo'>('hospital');
  
  // Track patient's current token in session
  const [userActiveToken, setUserActiveToken] = useState<PatientToken | null>(() => {
    // Default to the demo patient Zubair Farooq (TK-014) if none created yet
    return queueState.tokens.find((t) => t.tokenDisplay === 'TK-014') || queueState.tokens[0] || null;
  });

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setIsSubmittingNewsletter(true);
    setTimeout(() => {
      setIsSubmittingNewsletter(false);
      setNewsletterSubscribed(true);
    }, 450);
  };

  useEffect(() => {
    const unsub = queueService.subscribe((state) => {
      setQueueState({ ...state });
      // Keep active token synchronized if status changes
      if (userActiveToken) {
        const updated = state.tokens.find((t) => t.id === userActiveToken.id);
        if (updated) {
          setUserActiveToken(updated);
        }
      }
    });
    return () => unsub();
  }, [userActiveToken?.id]);

  // Subscribe to doctor authentication state changes
  useEffect(() => {
    const unsubAuth = doctorAuthService.subscribe((doc) => {
      setAuthenticatedDoctor(doc);
    });
    return () => unsubAuth();
  }, []);

  // Subscribe to admin authentication state changes
  useEffect(() => {
    const unsubAdmin = adminAuthService.subscribe((admin) => {
      setAuthenticatedAdmin(admin);
    });
    return () => unsubAdmin();
  }, []);

  const handleBookingConfirmed = (token: PatientToken) => {
    setUserActiveToken(token);
    setActivePanel('tracker');
  };

  const handleScrollToDoctors = () => {
    const el = document.getElementById('doctors-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-dvh bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* High-Contrast Obsidian Radar Grid & Ambient Telemetry Glows */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40 hud-radar-grid" 
        aria-hidden="true" 
      />
      <div 
        className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" 
        aria-hidden="true" 
      />
      <div 
        className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-0" 
        aria-hidden="true" 
      />

      {/* Top Navbar */}
      <Navbar
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        activeToken={userActiveToken}
        onOpenTracker={() => setActivePanel('tracker')}
        authenticatedDoctor={authenticatedDoctor}
        onOpenDoctorLogin={() => setIsDoctorLoginModalOpen(true)}
        authenticatedAdmin={authenticatedAdmin}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
      />

      {/* Automated Patient Proximity Notification System (3 Spots Away Alert) */}
      <TokenProximityAlert
        activeToken={userActiveToken}
        onOpenTracker={() => setActivePanel('tracker')}
      />

      {/* Real-time Network Telemetry Status Indicator (Bottom-Left Corner) */}
      <NetworkStatusIndicator />

      {/* Main View Switching */}
      <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 relative z-10">
        {activePanel === 'patient' && (
          <div className="animate-fadeIn">
            {/* 3D Cinematic Hero */}
            <div className="border-b border-slate-800 shadow-xl">
              <CinematicHero
                brandName="Aura Nexus"
                tagline1="Track your care,"
                tagline2="zero waiting room stress."
                cardHeading="OPD Queue, redefined."
                cardDescription={
                  <>
                    <span className="text-white font-semibold">Aura Nexus Med•OS</span> synchronizes patient arrival, doctor chamber capacity, and token progression with predictive sub-second telemetry and zero lobby crowding.
                  </>
                }
                metricValue={queueService.getHospitalStats().totalTokens || 128}
                metricLabel="Tokens Synced"
                ctaHeading="Experience seamless OPD."
                ctaDescription="Instant digital tokens, live radar wait times, and direct specialist physician access."
                onBookClick={handleScrollToDoctors}
                onTrackClick={() => setActivePanel('tracker')}
              />
            </div>

            {/* Live OPD Telemetry Pulse Bar */}
            <LiveTelemetryBar
              onOpenTracker={() => setActivePanel('tracker')}
              onScrollToDoctors={handleScrollToDoctors}
            />

            {/* How It Works - 3-Step Predictive Protocol with Handsome Motion */}
            <WorkflowSection
              onBookClick={handleScrollToDoctors}
              onTrackClick={() => setActivePanel('tracker')}
            />

            {/* Clinical Specializations & Departments Explorer */}
            <DepartmentsSection
              departments={queueState.departments}
              selectedDepartment={selectedDepartment}
              onSelectDepartment={(id) => {
                setSelectedDepartment(id);
                handleScrollToDoctors();
              }}
            />

            {/* Doctors Roster & Live Chamber Capacity */}
            <DoctorDirectory
              doctors={queueState.doctors}
              departments={queueState.departments}
              selectedDepartment={selectedDepartment}
              searchQuery={searchQuery}
              onBookDoctor={(doc) => setBookingDoctor(doc)}
              onClearSearch={() => setSearchQuery('')}
              onSelectDepartment={(id) => setSelectedDepartment(id)}
              onSetSearchQuery={(q) => setSearchQuery(q)}
            />

            {/* Clinical Accreditations & Hospital Trust Proof */}
            <HospitalTrustSection />
          </div>
        )}

        {activePanel === 'tracker' && (
          <div className="animate-fadeIn">
            <LiveTokenTracker
              initialToken={userActiveToken}
              onSelectToken={(tok) => setUserActiveToken(tok)}
              onBookNew={() => {
                setActivePanel('patient');
                handleScrollToDoctors();
              }}
            />
          </div>
        )}

        {activePanel === 'doctor' && (
          <div className="animate-fadeIn">
            {authenticatedDoctor ? (
              <DoctorConsole
                authenticatedDoctor={authenticatedDoctor}
                onLogout={() => doctorAuthService.logout()}
              />
            ) : (
              <DoctorLoginPortal
                onSuccess={(doc) => {
                  // Session established via store
                }}
              />
            )}
          </div>
        )}

        {activePanel === 'admin' && (
          <div className="animate-fadeIn">
            {authenticatedAdmin ? (
              <AdminReceptionPanel
                authenticatedAdmin={authenticatedAdmin}
                onLogout={() => adminAuthService.logout()}
                onSwitchToDoctor={(doctor) => {
                  doctorAuthService.quickLoginAsDoctor(doctor.id);
                  setActivePanel('doctor');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : (
              <AdminLoginPortal
                onSuccess={(admin) => {
                  // Session established via store
                }}
              />
            )}
          </div>
        )}

        {activePanel === 'simulator' && (
          <div className="animate-fadeIn">
            <SplitViewSimulator />
          </div>
        )}

        {activePanel === 'cinematic' && (
          <div className="animate-fadeIn relative min-h-dvh bg-[#050914] text-white">
            {/* Top Interactive Controls Floating Strip */}
            <div className="sticky top-14 sm:top-16 z-50 bg-[#0a101d]/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                    <span>3D Hardware Mockup & Cinematic Timeline</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/30 font-semibold hidden sm:inline-block">
                      Scroll to Scrub Timeline
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">
                    Scroll up/down to explore phone 3D tilt, token ring progress, floating badges, and card pullback.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Preset Switcher */}
                <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-700 text-xs flex-wrap gap-1">
                  <button
                    onClick={() => setCinematicTheme('hospital')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                      cinematicTheme === 'hospital'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Aura Nexus Med•OS
                  </button>
                  <button
                    onClick={() => setCinematicTheme('sobers')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                      cinematicTheme === 'sobers'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sobers (Original)
                  </button>
                  <button
                    onClick={() => setCinematicTheme('stacking-demo')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                      cinematicTheme === 'stacking-demo'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Clinical Pillars
                  </button>
                </div>

                <button
                  onClick={() => {
                    setActivePanel('patient');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Back to Portal
                </button>
              </div>
            </div>

            {/* View Selector: GSAP Cinematic Hero or Stacking Cards */}
            {cinematicTheme === 'stacking-demo' ? (
              <div className="max-w-4xl mx-auto px-4 py-8">
                <StackingCardsDemo />
              </div>
            ) : cinematicTheme === 'hospital' ? (
              <CinematicHero
                brandName="Aura Nexus"
                tagline1="Track your care,"
                tagline2="zero waiting room stress."
                cardHeading="OPD Queue, redefined."
                cardDescription={
                  <>
                    <span className="text-white font-semibold">Aura Nexus Med•OS</span> synchronizes patient arrival, doctor chamber capacity, and token progression with predictive sub-second telemetry and zero lobby crowding.
                  </>
                }
                metricValue={queueService.getHospitalStats().totalTokens || 128}
                metricLabel="Tokens Synced"
                ctaHeading="Experience seamless OPD."
                ctaDescription="Instant digital tokens, live radar wait times, and direct specialist physician access."
                onBookClick={() => {
                  setActivePanel('patient');
                  setTimeout(handleScrollToDoctors, 100);
                }}
                onTrackClick={() => setActivePanel('tracker')}
              />
            ) : (
              <CinematicHero 
                onBookClick={() => setActivePanel('patient')}
                onTrackClick={() => setActivePanel('tracker')}
              />
            )}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onBookingConfirmed={handleBookingConfirmed}
        />
      )}

      {/* Doctor Login Modal (can be triggered from footer or anywhere) */}
      {isDoctorLoginModalOpen && (
        <DoctorLoginPortal
          isModal={true}
          onCancel={() => setIsDoctorLoginModalOpen(false)}
          onSuccess={(doc) => {
            setIsDoctorLoginModalOpen(false);
            setActivePanel('doctor');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Admin Login Modal (can be triggered from footer or anywhere) */}
      {isAdminLoginModalOpen && (
        <AdminLoginPortal
          isModal={true}
          onCancel={() => setIsAdminLoginModalOpen(false)}
          onSuccess={(admin) => {
            setIsAdminLoginModalOpen(false);
            setActivePanel('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Obsidian Bio-Luminescent HUD Footer */}
      <footer className="mt-16 border-t border-blue-900/30 bg-[#030712] text-slate-400 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
          
          {/* Doctor Portal & Clinical Staff Gateway Banner in Footer */}
          <div className="mb-10 sm:mb-12 p-5 sm:p-6 rounded-2xl bg-[#080e1d]/90 text-white border border-blue-500/25 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-white tracking-tight">
                    Medical Practitioner & Doctor Portal
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/40 font-semibold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Doctor Only
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                  {authenticatedDoctor ? (
                    <span>
                      Active Physician Session: <strong className="text-emerald-400 font-semibold">{authenticatedDoctor.name}</strong> ({authenticatedDoctor.chamberNumber} • {authenticatedDoctor.specialization})
                    </span>
                  ) : (
                    <span>
                      Restricted to attending hospital doctors and specialists. Sign in to access your OPD consultation desk, token queue, and patient clinical notes.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
              {authenticatedDoctor ? (
                <>
                  <button
                    onClick={() => {
                      setActivePanel('doctor');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer micro-spring"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Open Consultation Desk</span>
                  </button>
                  <button
                    onClick={() => doctorAuthService.logout()}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer text-center micro-spring"
                    title="Sign out of doctor portal"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                  <button
                    id="btn-footer-doctor-signin"
                    onClick={() => {
                      setIsDoctorLoginModalOpen(true);
                    }}
                    className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer micro-spring"
                  >
                    <Lock className="w-3.5 h-3.5 text-white" />
                    <span>Doctor Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePanel('doctor');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#0b1329] hover:bg-[#111e40] text-slate-200 border border-blue-900/40 text-xs font-medium transition-colors cursor-pointer text-center micro-spring"
                  >
                    Chamber Desk
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Footer Grid: Stacks vertically on mobile (<768px), 4 columns on tablet/desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-10 border-b border-slate-800/80">
            {/* Column 1: Hospital Overview & Emergency Contacts */}
            <div className="space-y-4 md:col-span-2 lg:col-span-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-white tracking-tight">
                  AURA NEXUS HOSPITAL
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  OPD LIVE v3.2
                </span>
              </div>
              <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                Precision Swiss-engineered outpatient telemetry and token management system. Eliminates physical queue congestion with instantaneous synchronization between doctor chambers and patient mobile devices.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[11px] text-slate-400 font-mono pt-1">
                <span className="flex items-center gap-1.5 font-semibold text-blue-400">
                  <Phone className="w-3.5 h-3.5" /> Emergency Triage: +92 (042) 111-287-200
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> 24/7 Red Code Trauma
                </span>
              </div>
            </div>

            {/* Column 2: Emergency Wings */}
            <div className="space-y-3 md:col-span-1 lg:col-span-2">
              <div className="font-mono uppercase text-slate-200 text-[11px] font-bold tracking-wider">
                Emergency Wings
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500/80 shrink-0"></span>
                  <span>Wing A: Cardiac Resuscitation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/80 shrink-0"></span>
                  <span>Wing B: Acute Stroke & Neuro ICU</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 shrink-0"></span>
                  <span>Wing C: Orthopedic Trauma Surgery</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shrink-0"></span>
                  <span>Wing D: Neonatal Intensive Care</span>
                </li>
              </ul>
            </div>

            {/* Column 3: System Panels & Quick Portals */}
            <div className="space-y-3 md:col-span-1 lg:col-span-3">
              <div className="font-mono uppercase text-slate-200 text-[11px] font-bold tracking-wider">
                System Panels
              </div>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <button 
                    onClick={() => setActivePanel('patient')} 
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer py-1 inline-block"
                  >
                    Patient OPD Booking
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActivePanel('tracker')} 
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer py-1 inline-block"
                  >
                    Real-time Token Radar
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActivePanel('doctor');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer py-1"
                  >
                    <span>Doctor Consultation Desk</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60 font-semibold">
                      {authenticatedDoctor ? 'Online' : 'Login'}
                    </span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setIsDoctorLoginModalOpen(true)}
                    className="hover:text-blue-300 transition-colors flex items-center gap-1.5 text-blue-400 font-semibold cursor-pointer py-1"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    <span>Doctor Sign In / Login</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      if (authenticatedAdmin) {
                        setActivePanel('admin');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        setIsAdminLoginModalOpen(true);
                      }
                    }} 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer py-1"
                  >
                    <span>Admin / Reception Desk</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                      {authenticatedAdmin ? authenticatedAdmin.username : 'Sign In'}
                    </span>
                  </button>
                </li>
                {!authenticatedAdmin && (
                  <li>
                    <button 
                      id="btn-footer-admin-signin"
                      onClick={() => setIsAdminLoginModalOpen(true)}
                      className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 font-medium cursor-pointer py-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Admin Sign In (Fahad)</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Column 4: Newsletter Subscription for Health Tips & Clinic Updates */}
            <div className="space-y-3 md:col-span-2 lg:col-span-3">
              <div className="font-mono uppercase text-slate-200 text-[11px] font-bold tracking-wider">
                Health Tips & Updates
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Subscribe for preventive wellness advisories, seasonal viral bulletins, and doctor OPD scheduling updates.
              </p>

              {newsletterSubscribed ? (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold text-white">Subscribed to Clinic Bulletins</div>
                    <p className="text-[11px] text-slate-400">
                      Dispatches sent to <span className="text-emerald-300 font-mono">{newsletterEmail}</span>.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setNewsletterSubscribed(false);
                        setNewsletterEmail('');
                      }}
                      className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer pt-0.5 inline-block"
                    >
                      Change email address
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      aria-label="Email address for health tips and clinic updates"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#070d19] border border-blue-900/40 text-base sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingNewsletter}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 micro-spring"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingNewsletter ? 'Subscribing...' : 'Subscribe to Health Tips'}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-0.5">
                    <ShieldCheck className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>Verified medical dispatches · Unsubscribe anytime</span>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sub-footer Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 Aura Nexus Health Systems. All rights reserved. Outpatient Clinical Telemetry.
            </div>
            <div className="flex items-center gap-3 sm:gap-4 font-mono">
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Telemetry Online
              </span>
              <span className="text-slate-700">•</span>
              <span className="text-slate-400">
                Latency &lt;12ms
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
