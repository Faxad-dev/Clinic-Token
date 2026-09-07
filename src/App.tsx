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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
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

      {/* Swiss Minimalist Clinical Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Doctor Portal & Clinical Staff Gateway Banner in Footer */}
          <div className="mb-10 p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-[0_12px_36px_rgba(15,23,42,0.12)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-white tracking-tight">
                    Medical Practitioner & Doctor Portal
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Doctor Only
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
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

            <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
              {authenticatedDoctor ? (
                <>
                  <button
                    onClick={() => {
                      setActivePanel('doctor');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Open Consultation Desk</span>
                  </button>
                  <button
                    onClick={() => doctorAuthService.logout()}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                    title="Sign out of doctor portal"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2.5 w-full md:w-auto">
                  <button
                    id="btn-footer-doctor-signin"
                    onClick={() => {
                      setIsDoctorLoginModalOpen(true);
                    }}
                    className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-white" />
                    <span>Doctor Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePanel('doctor');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Chamber Desk
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200">
            <div className="space-y-3.5 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-slate-900 tracking-tight">AURA NEXUS HOSPITAL</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-semibold">
                  OPD LIVE v3.2
                </span>
              </div>
              <p className="text-slate-600 text-xs max-w-md leading-relaxed">
                Precision Swiss-engineered outpatient telemetry and token management system. Eliminates physical queue congestion with instantaneous synchronization between doctor chambers and patient mobile devices.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-700 font-mono pt-1">
                <span className="flex items-center gap-1 font-semibold text-blue-700">
                  <Phone className="w-3.5 h-3.5" /> Emergency Triage: +92 (042) 111-287-200
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> 24/7 Red Code Trauma
                </span>
              </div>
            </div>

            <div>
              <div className="font-mono uppercase text-slate-900 text-[11px] font-bold tracking-wider mb-3">
                Emergency Wings
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">• Wing A: Cardiac Resuscitation</li>
                <li className="flex items-center gap-1.5">• Wing B: Acute Stroke & Neuro ICU</li>
                <li className="flex items-center gap-1.5">• Wing C: Orthopedic Trauma Surgery</li>
                <li className="flex items-center gap-1.5">• Wing D: Neonatal Intensive Care</li>
              </ul>
            </div>

            <div>
              <div className="font-mono uppercase text-slate-900 text-[11px] font-bold tracking-wider mb-3">
                System Panels
              </div>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <button onClick={() => setActivePanel('patient')} className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">
                    Patient OPD Booking
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePanel('tracker')} className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">
                    Real-time Token Radar
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActivePanel('doctor');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Doctor Consultation Desk</span>
                    {authenticatedDoctor ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                        Online
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        Login
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setIsDoctorLoginModalOpen(true)}
                    className="hover:text-blue-700 transition-colors flex items-center gap-1.5 text-blue-600 font-semibold cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
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
                    className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Admin / Reception Desk</span>
                    {authenticatedAdmin ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-white font-bold">
                        {authenticatedAdmin.username}
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-300">
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
                      className="hover:text-slate-900 transition-colors flex items-center gap-1.5 text-slate-700 font-medium cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                      <span>Admin Sign In (Fahad)</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 Aura Nexus Health Systems. All rights reserved. Outpatient Clinical Telemetry.
            </div>
            <div className="flex items-center gap-4 font-mono">
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Telemetry Online
              </span>
              <span>•</span>
              <span className="text-slate-600">Latency &lt;12ms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
