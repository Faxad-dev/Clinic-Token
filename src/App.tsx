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
  UserCheck
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
  
  // Track patient's current token in session
  const [userActiveToken, setUserActiveToken] = useState<PatientToken | null>(() => {
    // Default to the demo patient Zubair Farooq (TK-014) if none created yet
    return queueState.tokens.find((t) => t.tokenDisplay === 'TK-014') || queueState.tokens[0] || null;
  });

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
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
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

      {/* Main View Switching */}
      <main className="flex-1 pb-16 md:pb-0">
        {activePanel === 'patient' && (
          <div className="animate-fadeIn">
            {/* Hero Section */}
            <HeroSection
              onBookClick={handleScrollToDoctors}
              onTrackClick={() => setActivePanel('tracker')}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onBookDoctor={(doc) => setBookingDoctor(doc)}
              onSelectDepartment={(id) => {
                setSelectedDepartment(id);
                handleScrollToDoctors();
              }}
            />

            {/* Diseases / Departments Explorer */}
            <DepartmentsSection
              departments={queueState.departments}
              selectedDepartment={selectedDepartment}
              onSelectDepartment={(id) => {
                setSelectedDepartment(id);
                handleScrollToDoctors();
              }}
            />

            {/* Doctors Roster & Live Capacity */}
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

      {/* Futuristic Clinical Footer */}
      <footer className="mt-16 border-t border-cyan-500/10 bg-[#080c14] text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Doctor Portal & Clinical Staff Gateway Banner in Footer */}
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-cyan-950/30 to-slate-900/90 border border-cyan-500/25 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white tracking-wide">
                    Medical Practitioner & Doctor Portal
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Doctor Only
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {authenticatedDoctor ? (
                    <span>
                      Active Physician Session: <strong className="text-emerald-400 font-semibold">{authenticatedDoctor.name}</strong> ({authenticatedDoctor.chamberNumber} • {authenticatedDoctor.specialization})
                    </span>
                  ) : (
                    <span>
                      Restricted to attending hospital doctors and specialists. Sign in to access your OPD consultation desk and call patients.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
              {authenticatedDoctor ? (
                <>
                  <button
                    onClick={() => {
                      setActivePanel('doctor');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Open Consultation Desk</span>
                  </button>
                  <button
                    onClick={() => doctorAuthService.logout()}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                    title="Sign out of doctor portal"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    id="btn-footer-doctor-signin"
                    onClick={() => {
                      setIsDoctorLoginModalOpen(true);
                    }}
                    className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-950" />
                    <span>Doctor Sign In / Login</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePanel('doctor');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Chamber Desk
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-white tracking-wider">AURA NEXUS HOSPITAL</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  OPD LIVE v3.2
                </span>
              </div>
              <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                Next-generation automated outpatient telemetry and live token management. Engineered for zero waiting hall congestion and sub-second queue synchronization.
              </p>
              <div className="flex items-center gap-4 text-[11px] text-cyan-400 font-mono">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> ER Triage: +92 (042) 111-287-200
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 24/7 Red Code Trauma
                </span>
              </div>
            </div>

            <div>
              <div className="font-mono uppercase text-slate-300 text-[11px] font-bold tracking-wider mb-3">
                Emergency Wings
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>• Wing A: Cardiac Resuscitation</li>
                <li>• Wing B: Acute Stroke & Neuro ICU</li>
                <li>• Wing C: Orthopedic Trauma Surgery</li>
                <li>• Wing D: Neonatal Intensive Care</li>
              </ul>
            </div>

            <div>
              <div className="font-mono uppercase text-slate-300 text-[11px] font-bold tracking-wider mb-3">
                System Panels
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setActivePanel('patient')} className="hover:text-cyan-300 transition-colors">
                    Patient OPD Booking
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePanel('tracker')} className="hover:text-cyan-300 transition-colors">
                    Real-time Token Radar
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActivePanel('doctor');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                  >
                    <span>Doctor Consultation Desk</span>
                    {authenticatedDoctor ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Online
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        Login
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setIsDoctorLoginModalOpen(true)}
                    className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 text-cyan-400 font-medium"
                  >
                    <KeyRound className="w-3 h-3 text-cyan-400" />
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
                    className="hover:text-purple-300 transition-colors flex items-center gap-1.5"
                  >
                    <span>Admin / Reception Desk</span>
                    {authenticatedAdmin ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        {authenticatedAdmin.username}
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        Sign In
                      </span>
                    )}
                  </button>
                </li>
                {!authenticatedAdmin && (
                  <li>
                    <button 
                      id="btn-footer-admin-signin"
                      onClick={() => setIsAdminLoginModalOpen(true)}
                      className="hover:text-purple-300 transition-colors flex items-center gap-1.5 text-purple-400 font-medium"
                    >
                      <ShieldCheck className="w-3 h-3 text-purple-400" />
                      <span>Admin Sign In (Fahad)</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 Aura Nexus Health Systems. All rights reserved. This is an OPD queue management system and does not replace emergency medical diagnosis.
            </div>
            <div className="flex items-center gap-4 font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Telemetry Online
              </span>
              <span>•</span>
              <span className="text-cyan-400">Latency &lt;15ms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
