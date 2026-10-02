import React, { useState, useEffect, useRef } from 'react';
import { Doctor, Department, PatientToken, HospitalQueueState, DepartmentId, DoctorAuthAccount } from '../../types';
import { queueService } from '../../services/queueStore';
import { AdminUser } from '../../services/adminAuthStore';
import { doctorAuthService } from '../../services/doctorAuthStore';
import { 
  ShieldCheck, 
  UserPlus, 
  CalendarClock, 
  BarChart3, 
  Users, 
  Ticket, 
  MapPin, 
  Activity, 
  Plus, 
  Check, 
  Trash2,
  Edit,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertCircle,
  LogOut,
  Lock,
  UserCheck,
  Camera,
  UploadCloud,
  Image as ImageIcon,
  Copy,
  CheckCheck,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Stethoscope,
  X,
  KeyRound
} from 'lucide-react';
import { DepartmentLoadChart } from './DepartmentLoadChart';
import { MobileSlider } from '../ui/MobileSlider';

interface AdminReceptionPanelProps {
  authenticatedAdmin?: AdminUser | null;
  onLogout?: () => void;
  onSwitchToDoctor?: (doctor: Doctor) => void;
}

// Curated high-resolution clinical doctor avatars
const CLINICAL_AVATAR_PRESETS = [
  {
    id: 'male-cardio',
    label: 'Chief Consultant (Male)',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'female-neuro',
    label: 'Neuro Specialist (Female)',
    url: 'https://images.unsplash.com/photo-1594824813637-44c5a0e0cb8a?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'male-senior',
    label: 'Senior Physician (Male)',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'female-peds',
    label: 'Pediatric Specialist (Female)',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'male-surgeon',
    label: 'Trauma Surgeon (Male)',
    url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'female-derma',
    label: 'Clinical Dermatologist (Female)',
    url: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=600&auto=format&fit=crop&q=80',
  },
];

export const AdminReceptionPanel: React.FC<AdminReceptionPanelProps> = ({
  authenticatedAdmin,
  onLogout,
  onSwitchToDoctor,
}) => {
  const [queueState, setQueueState] = useState<HospitalQueueState>(queueService.getState());
  const [activeTab, setActiveTab] = useState<'roster' | 'walkin' | 'departments' | 'analytics'>('roster');
  
  // Add doctor modal state
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocDept, setNewDocDept] = useState<DepartmentId>('cardiology');
  const [newDocSpec, setNewDocSpec] = useState('');
  const [newDocQual, setNewDocQual] = useState('MBBS, MD, FCPS');
  const [newDocExp, setNewDocExp] = useState(8);
  const [newDocChamber, setNewDocChamber] = useState('Chamber 205');
  const [newDocFee, setNewDocFee] = useState(2000);
  const [newDocMorningSlots, setNewDocMorningSlots] = useState(20);

  // Profile Photo state
  const [newDocPhotoUrl, setNewDocPhotoUrl] = useState(CLINICAL_AVATAR_PRESETS[0].url);
  const [photoInputMode, setPhotoInputMode] = useState<'presets' | 'upload' | 'url'>('presets');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password & Chamber Console Credentials state
  const [newDocPassword, setNewDocPassword] = useState('Doc@2026');
  const [showDocPassword, setShowDocPassword] = useState(false);
  const [newDocStaffCode, setNewDocStaffCode] = useState(`DOC-${Math.floor(100 + Math.random() * 900)}`);
  const [newDocEmail, setNewDocEmail] = useState('');

  // Credentials dialogs
  const [createdDoctorModal, setCreatedDoctorModal] = useState<{
    doctor: Doctor;
    account: DoctorAuthAccount;
  } | null>(null);
  const [viewCredentialsDoctor, setViewCredentialsDoctor] = useState<{
    doctor: Doctor;
    account: DoctorAuthAccount;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Quick Walk-in form state
  const [walkinDocId, setWalkinDocId] = useState(queueState.doctors[0]?.id || '');
  const [walkinPatientName, setWalkinPatientName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('+92 300 ');
  const [walkinAge, setWalkinAge] = useState<number | ''>(30);
  const [walkinEmergency, setWalkinEmergency] = useState(false);
  const [walkinSuccess, setWalkinSuccess] = useState<PatientToken | null>(null);

  useEffect(() => {
    const unsub = queueService.subscribe((state) => {
      setQueueState({ ...state });
    });
    return () => unsub();
  }, []);

  // Update staff code / email dynamically as name changes if empty
  const handleNameChange = (nameVal: string) => {
    setNewDocName(nameVal);
    if (!newDocEmail || newDocEmail.endsWith('@auranexus.med')) {
      const clean = nameVal.toLowerCase().replace(/[^a-z]/g, '');
      if (clean) {
        setNewDocEmail(`dr.${clean}@auranexus.med`);
      }
    }
  };

  const handlePhotoFileUpload = (file: File) => {
    setPhotoError(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size exceeds 5MB. Please upload a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setNewDocPhotoUrl(result);
      }
    };
    reader.onerror = () => {
      setPhotoError('Error reading selected image file.');
    };
    reader.readAsDataURL(file);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = 'Doc@';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewDocPassword(res);
  };

  const handleCopyText = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenAddDoctorModal = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setNewDocStaffCode(`DOC-${randomNum}`);
    setNewDocPassword(`Doc@${randomNum}`);
    setNewDocName('');
    setNewDocSpec('');
    setNewDocEmail('');
    setNewDocPhotoUrl(CLINICAL_AVATAR_PRESETS[0].url);
    setPhotoError(null);
    setIsAddingDoctor(true);
  };

  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocSpec.trim()) return;

    const formattedName = newDocName.trim().startsWith('Dr.') 
      ? newDocName.trim() 
      : `Dr. ${newDocName.trim()}`;

    // 1. Add doctor to hospital queue registry
    const doctor = queueService.addDoctor({
      name: formattedName,
      qualification: newDocQual.trim() || 'MBBS, FCPS',
      departmentId: newDocDept,
      specialization: newDocSpec.trim(),
      experienceYears: Number(newDocExp) || 5,
      chamberNumber: newDocChamber.trim() || 'Chamber 205',
      consultationFee: Number(newDocFee) || 2000,
      availability: 'available',
      photoUrl: newDocPhotoUrl.trim() || CLINICAL_AVATAR_PRESETS[0].url,
      schedules: [
        {
          id: `slot-${Date.now()}-am`,
          shift: 'morning',
          timeRange: '09:00 AM - 01:30 PM',
          maxCapacity: Number(newDocMorningSlots) || 20,
          tokensIssued: 0,
        },
      ],
    });

    // 2. Register doctor credentials in doctorAuthService
    const finalStaffCode = newDocStaffCode.trim() || `DOC-${Math.floor(100 + Math.random() * 900)}`;
    const finalEmail = newDocEmail.trim() || `${formattedName.toLowerCase().replace(/[^a-z]/g, '')}@auranexus.med`;
    const finalPassword = newDocPassword.trim() || 'Doc@2026';

    const account = doctorAuthService.registerDoctorCredentials({
      doctorId: doctor.id,
      staffCode: finalStaffCode,
      email: finalEmail,
      password: finalPassword,
      pin: finalPassword,
    });

    setIsAddingDoctor(false);
    setCreatedDoctorModal({ doctor, account });
  };

  const handleShowDoctorCredentials = (doc: Doctor) => {
    let account = doctorAuthService.getAccountForDoctor(doc.id);
    if (!account) {
      // Create registered credentials record if missing
      account = doctorAuthService.registerDoctorCredentials({
        doctorId: doc.id,
        staffCode: `DOC-${Math.floor(100 + Math.random() * 900)}`,
        email: `${doc.name.toLowerCase().replace(/[^a-z]/g, '')}@auranexus.med`,
        password: '1234',
        pin: '1234',
      });
    }
    setViewCredentialsDoctor({ doctor: doc, account });
  };

  const handleWalkinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinPatientName.trim()) return;

    const token = queueService.bookToken({
      doctorId: walkinDocId,
      patientName: walkinPatientName.trim(),
      patientPhone: walkinPhone.trim(),
      patientAge: Number(walkinAge) || 25,
      patientGender: 'male',
      symptoms: 'Walk-in reception triage',
      slotShift: 'morning',
      isEmergencyPriority: walkinEmergency,
    });

    setWalkinSuccess(token);
    setWalkinPatientName('');
  };

  const stats = queueService.getHospitalStats();

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-[#030712] text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Hospital Administration &amp; Telemetry Desk</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] leading-[1.15]">
            OPD Central Governance
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage medical specialists, configure daily OPD slot capacities, issue walk-in tokens, and audit departmental throughput.
          </p>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {authenticatedAdmin && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-cyan-300 text-xs font-mono shadow-[0_0_10px_rgba(59,130,246,0.25)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse"></span>
              <span className="font-semibold truncate max-w-[120px] sm:max-w-none">{authenticatedAdmin.displayName}</span>
            </div>
          )}

          <button
            id="btn-admin-add-doctor"
            onClick={handleOpenAddDoctorModal}
            className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,0.35)] transition-all flex items-center gap-1.5 cursor-pointer micro-spring"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Specialist</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all queues and re-seed demo data?')) {
                queueService.resetQueueForDemo();
              }
            }}
            className="px-2.5 sm:px-3 py-2 rounded-xl bg-[#081026] hover:bg-[#0f1d44] border border-blue-900/40 text-slate-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all micro-spring"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Reset Demo</span>
            <span className="sm:hidden">Reset</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-2.5 sm:px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm micro-spring"
              title="Lock Admin Console & Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-blue-900/30 gap-2 sm:gap-4 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 micro-spring ${
            activeTab === 'roster'
              ? 'border-blue-500 text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="hidden md:inline">Specialists &amp; Slot Configuration ({queueState.doctors.length})</span>
          <span className="md:hidden">Specialists ({queueState.doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('walkin')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 micro-spring ${
            activeTab === 'walkin'
              ? 'border-blue-500 text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span className="hidden md:inline">Reception Walk-in Desk</span>
          <span className="md:hidden">Walk-in Desk</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 micro-spring ${
            activeTab === 'departments'
              ? 'border-blue-500 text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden md:inline">Departmental Overview ({queueState.departments.length})</span>
          <span className="md:hidden">Departments ({queueState.departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 micro-spring ${
            activeTab === 'analytics'
              ? 'border-blue-500 text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden md:inline">Live Queue Analytics</span>
          <span className="md:hidden">Analytics</span>
        </button>
      </div>

      {/* TAB 1: Doctor Roster & Slot Configuration */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <MobileSlider desktopGridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {queueState.doctors.map((doc) => {
              const queue = queueService.getDoctorQueue(doc.id);
              const totalTokensIssued = doc.schedules.reduce((acc, s) => acc + s.tokensIssued, 0);

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl bg-[#070d19]/90 border border-blue-500/25 space-y-4 hover:border-blue-400 shadow-xl transition-all micro-spring text-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={doc.photoUrl}
                          alt={doc.name}
                          referrerPolicy="no-referrer"
                          className="w-13 h-13 rounded-2xl object-cover border-2 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#070d19] shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Roster Active" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{doc.name}</h4>
                        </div>
                        <div className="text-xs text-slate-400">{doc.specialization}</div>
                        <div className="text-[10px] font-mono text-cyan-400 font-semibold mt-0.5">
                          {doc.qualification}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleShowDoctorCredentials(doc)}
                      className="p-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 border border-blue-500/40 text-cyan-300 text-xs font-mono transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-sm micro-spring"
                      title="View Doctor Login Credentials & Password"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Credentials</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-[#040813] border border-blue-900/40">
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px]">Chamber</span>
                      <span className="font-semibold text-cyan-300 font-mono">{doc.chamberNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px]">Fee (PKR)</span>
                      <span className="font-semibold text-white font-mono">{doc.consultationFee}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px]">Queue Load</span>
                      <span className="font-semibold text-emerald-400 font-mono">
                        {queue.waitingCount} waiting / {queue.completedCount} done
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px]">Avg Consult</span>
                      <span className="font-semibold text-blue-400 font-mono">~{doc.avgConsultationMinutes}m</span>
                    </div>
                  </div>

                  {/* Schedule slots */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                      Configured OPD Slots:
                    </div>
                    {doc.schedules.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-2 rounded-lg bg-[#040813] border border-blue-900/30 flex items-center justify-between text-xs"
                      >
                        <span className="capitalize text-slate-300 font-medium">
                          {slot.shift} ({slot.timeRange})
                        </span>
                        <span className="font-mono text-cyan-400 font-semibold text-[11px]">
                          {slot.tokensIssued} / {slot.maxCapacity} cap
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </MobileSlider>
        </div>
      )}

      {/* TAB 2: Walk-In Reception Desk */}
      {activeTab === 'walkin' && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#070d19]/90 border border-blue-500/25 shadow-2xl space-y-6 text-white">
          <div className="flex items-center gap-3 pb-4 border-b border-blue-900/30">
            <div className="p-2.5 rounded-xl bg-blue-950/80 text-cyan-400 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.25)]">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Issue Reception Walk-in Token</h3>
              <p className="text-xs text-slate-400">For counter patients visiting OPD without online pre-booking.</p>
            </div>
          </div>

          {walkinSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400/60 text-center space-y-2 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse">
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                Walk-In Token Generated!
              </div>
              <div className="text-4xl font-black font-mono text-white tracking-widest drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]">
                {walkinSuccess.tokenDisplay}
              </div>
              <div className="text-xs text-slate-300">
                Assigned to <strong className="text-white">{walkinSuccess.doctorName}</strong>. Patient placed in live telemetry queue.
              </div>
            </div>
          )}

          <form onSubmit={handleWalkinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-cyan-400 font-semibold mb-1">
                Assign Doctor &amp; Chamber *
              </label>
              <select
                value={walkinDocId}
                onChange={(e) => setWalkinDocId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#03060f] border border-blue-900/40 text-base sm:text-sm font-medium text-white focus:outline-none focus:border-blue-500 shadow-inner"
              >
                {queueState.doctors.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#03060f] text-white">
                    {d.name} • {d.chamberNumber} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-cyan-400 font-semibold mb-1">
                Patient Name *
              </label>
              <input
                type="text"
                required
                value={walkinPatientName}
                onChange={(e) => setWalkinPatientName(e.target.value)}
                placeholder="Walk-in patient name..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#03060f] border border-blue-900/40 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-cyan-400 font-semibold mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#03060f] border border-blue-900/40 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-cyan-400 font-semibold mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={walkinAge}
                  onChange={(e) => setWalkinAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="35"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#03060f] border border-blue-900/40 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#040813] border border-blue-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span className="text-xs text-slate-300 font-medium">Emergency / Priority Pass</span>
              </div>
              <input
                type="checkbox"
                checked={walkinEmergency}
                onChange={(e) => setWalkinEmergency(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>

            <button
              id="btn-admin-issue-walkin"
              type="submit"
              className="w-full min-h-[44px] py-3.5 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer micro-spring"
            >
              <Ticket className="w-4 h-4" />
              <span>Issue Immediate Walk-In Token</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Departmental Overview */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {/* Department Shift Load Quick Telemetry Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#070d19]/90 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(59,130,246,0.15)] text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Hospital Department Load &amp; Staff Shift Telemetry</h4>
                <p className="text-xs text-slate-400">Track hourly patient influx trends, peak bottlenecks, and optimal clinician shift allocations.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.35)] flex items-center gap-1.5 cursor-pointer shrink-0 micro-spring"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Open Influx &amp; Shift Graph</span>
            </button>
          </div>

          <MobileSlider desktopGridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {queueState.departments.map((dept) => {
              const deptDocs = queueState.doctors.filter((d) => d.departmentId === dept.id);
              const deptTokens = queueState.tokens.filter((t) => t.departmentId === dept.id);
              const waitingCount = deptTokens.filter((t) => t.status === 'waiting').length;
              const completedCount = deptTokens.filter((t) => t.status === 'completed').length;

              return (
                <div
                  key={dept.id}
                  className="p-6 rounded-2xl bg-[#070d19]/90 border border-blue-500/25 shadow-xl space-y-4 hover:border-blue-400 transition-all micro-spring text-white"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                        {dept.chamberWing}
                      </span>
                      <h3 className="text-base font-bold text-white">{dept.name}</h3>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-600/40 font-medium">
                      {deptDocs.length} Specialists
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{dept.tagline}</p>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center p-2.5 sm:p-3 rounded-xl bg-[#040813] border border-blue-900/40 font-mono">
                    <div className="min-w-0">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase truncate">Total</span>
                      <span className="text-base font-bold text-white">{deptTokens.length}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase truncate">Waiting</span>
                      <span className="text-base font-bold text-amber-400">{waitingCount}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase truncate">Served</span>
                      <span className="text-base font-bold text-emerald-400">{completedCount}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 pt-2 border-t border-blue-900/30">
                    Head of Wing: <strong className="text-slate-200">{dept.headOfDepartment}</strong>
                  </div>
                </div>
              );
            })}
          </MobileSlider>
        </div>
      )}

      {/* TAB 4: Daily Token Reports & Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 text-white">
          {/* Key Metrics Cards */}
          <MobileSlider desktopGridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[#070d19]/90 border border-blue-500/25 shadow-xl micro-spring">
              <div className="text-xs text-slate-400 font-mono uppercase font-semibold">Total Tokens Generated Today</div>
              <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">
                {stats.totalTokens}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 font-medium">+18% vs yesterday</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#070d19]/90 border border-blue-500/25 shadow-xl micro-spring">
              <div className="text-xs text-slate-400 font-mono uppercase font-semibold">Currently in Queue</div>
              <div className="text-3xl font-extrabold font-mono text-amber-400 mt-1">
                {stats.waitingTokens}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Across all 6 wings</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#070d19]/90 border border-blue-500/25 shadow-xl micro-spring">
              <div className="text-xs text-slate-400 font-mono uppercase font-semibold">Consultations Completed</div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                {stats.completedTokens}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 font-medium">Prescriptions archived</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#070d19]/90 border border-blue-500/25 shadow-xl micro-spring">
              <div className="text-xs text-slate-400 font-mono uppercase font-semibold">Average Turnaround Pace</div>
              <div className="text-3xl font-extrabold font-mono text-blue-400 mt-1">
                ~{stats.avgConsultMins}m
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Rolling average formula</div>
            </div>
          </MobileSlider>

          {/* Recharts-based Department Load Graph & Shift Allocation */}
          <DepartmentLoadChart queueState={queueState} />

          {/* Tokens Log Table */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[#070d19]/90 border border-blue-500/25 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/30">
              <h3 className="text-sm sm:text-base font-bold text-white">Live OPD Tokens Ledger</h3>
              <span className="text-xs font-mono text-cyan-400">
                {queueState.tokens.length} records logged
              </span>
            </div>

            {/* Mobile Stacked Cards (below md) */}
            <div className="md:hidden space-y-3">
              {queueState.tokens.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">No tokens logged yet today.</div>
              ) : (
                queueState.tokens.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-[#040813] border border-blue-900/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-cyan-400">
                        {t.tokenDisplay}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                          t.status === 'in-progress'
                            ? 'bg-blue-950 text-cyan-300 border border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                            : t.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                            : t.status === 'waiting'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                            : 'bg-[#0b1329] text-slate-400 border border-slate-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-semibold text-white">
                        {t.patientName} <span className="text-slate-400 font-mono text-[11px]">({t.patientAge}y)</span>
                      </span>
                      <span className="capitalize text-slate-400 font-mono text-[11px]">{t.slotShift} shift</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1.5 border-t border-blue-900/30">
                      <span className="truncate max-w-[180px]">{t.doctorName}</span>
                      <span className="font-mono">
                        {new Date(t.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table (md and above) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-blue-900/40 text-cyan-400 font-mono uppercase bg-[#03060f]">
                    <th className="py-2.5 px-3">Token #</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Consultant</th>
                    <th className="py-2.5 px-3">Shift</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Booked At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/20">
                  {queueState.tokens.map((t) => (
                    <tr key={t.id} className="hover:bg-blue-950/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                        {t.tokenDisplay}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {t.patientName} <span className="text-slate-400 font-mono text-[11px]">({t.patientAge}y)</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{t.doctorName}</td>
                      <td className="py-2.5 px-3 capitalize text-slate-400">{t.slotShift}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                            t.status === 'in-progress'
                              ? 'bg-blue-950 text-cyan-300 border border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                              : t.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                              : t.status === 'waiting'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                              : 'bg-[#0b1329] text-slate-400 border border-slate-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {new Date(t.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {isAddingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto overscroll-contain">
          <div className="w-full max-w-2xl my-auto rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 space-y-5 shadow-2xl max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Consultant Specialist</h3>
                  <p className="text-[11px] text-slate-500">Configure clinical details, profile photo, and chamber console login password.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingDoctor(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-5 text-xs">
              {/* SECTION 1: Doctor Clinical Profile */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-blue-700 font-semibold flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>1. Clinical Identification & OPD Chamber</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold uppercase font-mono mb-1 text-[10px]">
                      Doctor Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDocName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Dr. Noman Arshad"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none shadow-sm text-base sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold uppercase font-mono mb-1 text-[10px]">
                      Qualifications & Degrees
                    </label>
                    <input
                      type="text"
                      value={newDocQual}
                      onChange={(e) => setNewDocQual(e.target.value)}
                      placeholder="e.g. MBBS, MD, FCPS (Cardiology)"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none shadow-sm text-base sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold uppercase font-mono mb-1 text-[10px]">Department</label>
                    <select
                      value={newDocDept}
                      onChange={(e) => setNewDocDept(e.target.value as DepartmentId)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none shadow-sm text-base sm:text-sm"
                    >
                      {queueState.departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold uppercase font-mono mb-1 text-[10px]">Chamber Room</label>
                    <input
                      type="text"
                      value={newDocChamber}
                      onChange={(e) => setNewDocChamber(e.target.value)}
                      placeholder="e.g. Chamber 205 (2nd Floor)"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none shadow-sm text-base sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold uppercase font-mono mb-1 text-[10px]">
                    Specialization Focus *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDocSpec}
                    onChange={(e) => setNewDocSpec(e.target.value)}
                    placeholder="e.g. Pediatric Cardiology, Angioplasty & Heart Rhythm"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none shadow-sm text-base sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold uppercase font-mono mb-1 text-[10px]">Exp (Yrs)</label>
                    <input
                      type="number"
                      value={newDocExp}
                      onChange={(e) => setNewDocExp(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none shadow-sm text-base sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold uppercase font-mono mb-1 text-[10px]">Fee (PKR)</label>
                    <input
                      type="number"
                      value={newDocFee}
                      onChange={(e) => setNewDocFee(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none shadow-sm text-base sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold uppercase font-mono mb-1 text-[10px]">Slot Tokens</label>
                    <input
                      type="number"
                      value={newDocMorningSlots}
                      onChange={(e) => setNewDocMorningSlots(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none shadow-sm text-base sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Doctor Profile Photo */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-blue-700 font-semibold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>2. Doctor Profile Photo</span>
                  </div>

                  {/* Mode Tabs */}
                  <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPhotoInputMode('presets')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        photoInputMode === 'presets'
                          ? 'bg-white text-blue-700 font-semibold shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                        photoInputMode === 'upload'
                          ? 'bg-white text-blue-700 font-semibold shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <UploadCloud className="w-3 h-3" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoInputMode('url')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        photoInputMode === 'url'
                          ? 'bg-white text-blue-700 font-semibold shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {/* Active Photo Preview Bar */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="relative">
                    <img
                      src={newDocPhotoUrl || CLINICAL_AVATAR_PRESETS[0].url}
                      alt="Doctor Preview"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/50 shadow-md"
                      onError={() => {
                        setNewDocPhotoUrl(CLINICAL_AVATAR_PRESETS[0].url);
                        setPhotoError('Failed to load provided image URL, reverted to clinical preset.');
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[9px] text-white">
                      ✓
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-900 font-semibold text-xs truncate">
                      {newDocName.trim() || 'Attending Physician Avatar'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {newDocSpec.trim() || 'Selected specialty portrait'}
                    </div>
                    <div className="text-[10px] font-mono text-blue-600 font-semibold mt-0.5">
                      Ready for OPD card & doctor portal
                    </div>
                  </div>
                </div>

                {photoError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{photoError}</span>
                  </div>
                )}

                {/* Mode Content: Presets */}
                {photoInputMode === 'presets' && (
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 text-[10px] font-mono">
                      Select from high-resolution clinical doctor avatars:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CLINICAL_AVATAR_PRESETS.map((preset) => {
                        const isSelected = newDocPhotoUrl === preset.url;
                        return (
                          <button
                            type="button"
                            key={preset.id}
                            onClick={() => {
                              setNewDocPhotoUrl(preset.url);
                              setPhotoError(null);
                            }}
                            className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <div className={`text-[11px] font-semibold truncate ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                {preset.label}
                              </div>
                              <div className="text-[9px] text-slate-400 font-mono">Verified</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mode Content: File Upload (Drag & Drop + Click) */}
                {photoInputMode === 'upload' && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingPhoto(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingPhoto(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingPhoto(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handlePhotoFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                      isDraggingPhoto
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/20'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handlePhotoFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-slate-800 font-medium text-xs">
                      Drop doctor photo here, or <span className="text-blue-600 underline">browse device</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP (Max 5MB). Photo is stored directly with doctor profile.
                    </p>
                  </div>
                )}

                {/* Mode Content: URL Input */}
                {photoInputMode === 'url' && (
                  <div>
                    <label className="block text-slate-500 text-[10px] font-mono mb-1">
                      Paste Doctor Photo Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newDocPhotoUrl}
                        onChange={(e) => {
                          setNewDocPhotoUrl(e.target.value);
                          setPhotoError(null);
                        }}
                        placeholder="https://example.com/doctor-photo.jpg"
                        className="flex-1 p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none text-base sm:text-sm font-mono shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setNewDocPhotoUrl(CLINICAL_AVATAR_PRESETS[0].url)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-mono transition-colors flex items-center justify-center cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Doctor Chamber Console Sign-In & Password Credentials */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                        <KeyRound className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-slate-900 font-bold text-xs tracking-wide">
                          Doctor Console Sign-In Credentials
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Set the password and login identifier for the doctor chamber console.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      title="Generate secure password"
                    >
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span>Auto-Generate</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Password Field */}
                    <div>
                      <label className="block text-slate-700 font-mono text-[10px] uppercase font-semibold mb-1">
                        Doctor Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showDocPassword ? 'text' : 'password'}
                          required
                          value={newDocPassword}
                          onChange={(e) => setNewDocPassword(e.target.value)}
                          placeholder="e.g. Doc@2026"
                          className="w-full pl-3 pr-11 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-base sm:text-sm focus:border-blue-600 focus:outline-none shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDocPassword(!showDocPassword)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showDocPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Minimum 4 characters (e.g. Doc@107, 1234)
                      </span>
                    </div>

                    {/* Staff Code */}
                    <div>
                      <label className="block text-slate-700 font-mono text-[10px] uppercase font-semibold mb-1">
                        Staff Code (Login ID)
                      </label>
                      <input
                        type="text"
                        value={newDocStaffCode}
                        onChange={(e) => setNewDocStaffCode(e.target.value)}
                        placeholder="e.g. DOC-107"
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-blue-700 font-bold font-mono text-base sm:text-sm focus:border-blue-600 focus:outline-none shadow-sm"
                      />
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Can be entered as login ID
                      </span>
                    </div>
                  </div>

                  {/* Staff Email (Optional / Auto-filled) */}
                  <div>
                    <label className="block text-slate-700 font-mono text-[10px] uppercase font-semibold mb-1">
                      Staff Email Address (Optional Login ID)
                    </label>
                    <input
                      type="email"
                      value={newDocEmail}
                      onChange={(e) => setNewDocEmail(e.target.value)}
                      placeholder="e.g. dr.noman@auranexus.med"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono text-base sm:text-sm focus:border-blue-600 focus:outline-none shadow-sm"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-blue-100 text-[11px] text-slate-600 flex items-start gap-2 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      The doctor can log in to the <strong className="text-slate-900">Doctor Sign In Portal</strong> using their <strong className="text-blue-700">Staff Code</strong>, <strong className="text-slate-900">Full Name ({newDocName || 'Dr. Name'})</strong>, or <strong className="text-blue-700">Email</strong> with the password you set above.
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingDoctor(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer text-center font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-md shadow-blue-600/25 cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Save Specialist & Create Login</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Created & Credentials Ready Success Modal */}
      {createdDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto overscroll-contain">
          <div className="w-full max-w-lg my-auto rounded-3xl bg-white border-2 border-emerald-500 p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90dvh] overflow-y-auto">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-3 shadow-sm">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Specialist Successfully Registered!</h3>
              <p className="text-xs text-slate-600">
                Doctor profile has been added to OPD roster and chamber console login credentials are live.
              </p>
            </div>

            {/* Doctor Profile Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
              <img
                src={createdDoctorModal.doctor.photoUrl}
                alt={createdDoctorModal.doctor.name}
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 text-sm">{createdDoctorModal.doctor.name}</div>
                <div className="text-xs text-slate-500">{createdDoctorModal.doctor.specialization}</div>
                <div className="text-[11px] font-mono text-blue-700 font-semibold mt-0.5">
                  {createdDoctorModal.doctor.chamberNumber} • Fee: PKR {createdDoctorModal.doctor.consultationFee}
                </div>
              </div>
            </div>

            {/* Credentials Summary Box */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-semibold text-blue-800 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  Doctor Sign-In Credentials
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  Ready
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-500">Staff Code (Login ID):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700">{createdDoctorModal.account.staffCode}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(createdDoctorModal.account.staffCode, 'staffCode')}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                      title="Copy Staff Code"
                    >
                      {copiedKey === 'staffCode' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-500">Doctor Name (Login ID):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{createdDoctorModal.doctor.name}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(createdDoctorModal.doctor.name, 'docName')}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                      title="Copy Doctor Name"
                    >
                      {copiedKey === 'docName' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-blue-200 bg-blue-50/40">
                  <span className="text-blue-800 font-semibold">Console Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-900">{createdDoctorModal.account.password}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(createdDoctorModal.account.password || '', 'pwd')}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                      title="Copy Password"
                    >
                      {copiedKey === 'pwd' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  const summary = `Aura Nexus Doctor Portal Login\nDoctor: ${createdDoctorModal.doctor.name}\nStaff Code: ${createdDoctorModal.account.staffCode}\nPassword: ${createdDoctorModal.account.password}\nEmail: ${createdDoctorModal.account.email}`;
                  handleCopyText(summary, 'all');
                }}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'all' ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Credentials Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy All Details</span>
                  </>
                )}
              </button>

              {onSwitchToDoctor && (
                <button
                  type="button"
                  onClick={() => {
                    const doc = createdDoctorModal.doctor;
                    setCreatedDoctorModal(null);
                    onSwitchToDoctor(doc);
                  }}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-600/25"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Log in as Doctor Now</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setCreatedDoctorModal(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Doctor Credentials Modal (Opened from Roster card) */}
      {viewCredentialsDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto overscroll-contain">
          <div className="w-full max-w-md my-auto rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 space-y-5 shadow-2xl max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Chamber Login Credentials</h3>
                  <p className="text-[10px] text-slate-500">Practitioner portal access details</p>
                </div>
              </div>
              <button
                onClick={() => setViewCredentialsDoctor(null)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Close credentials modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Doctor Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={viewCredentialsDoctor.doctor.photoUrl}
                alt={viewCredentialsDoctor.doctor.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900">{viewCredentialsDoctor.doctor.name}</h4>
                <div className="text-[11px] text-slate-500">{viewCredentialsDoctor.doctor.specialization}</div>
                <div className="text-[10px] font-mono text-blue-700 font-semibold">{viewCredentialsDoctor.doctor.chamberNumber}</div>
              </div>
            </div>

            {/* Credentials Fields */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-500">Staff Code (ID):</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-700">{viewCredentialsDoctor.account.staffCode}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(viewCredentialsDoctor.account.staffCode, 'viewStaffCode')}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  >
                    {copiedKey === 'viewStaffCode' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-500">Full Name (ID):</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{viewCredentialsDoctor.doctor.name}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(viewCredentialsDoctor.doctor.name, 'viewDocName')}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  >
                    {copiedKey === 'viewDocName' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-500">Email (ID):</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700 text-[11px]">{viewCredentialsDoctor.account.email}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(viewCredentialsDoctor.account.email, 'viewEmail')}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  >
                    {copiedKey === 'viewEmail' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="text-blue-800 font-semibold">Chamber Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-900">
                    {viewCredentialsDoctor.account.password || viewCredentialsDoctor.account.pin}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(viewCredentialsDoctor.account.password || viewCredentialsDoctor.account.pin, 'viewPwd')}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  >
                    {copiedKey === 'viewPwd' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const summary = `Doctor Portal Login\nName: ${viewCredentialsDoctor.doctor.name}\nStaff Code: ${viewCredentialsDoctor.account.staffCode}\nPassword: ${viewCredentialsDoctor.account.password || viewCredentialsDoctor.account.pin}\nEmail: ${viewCredentialsDoctor.account.email}`;
                  handleCopyText(summary, 'viewAll');
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'viewAll' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Credentials</span>
              </button>

              {onSwitchToDoctor && (
                <button
                  type="button"
                  onClick={() => {
                    const doc = viewCredentialsDoctor.doctor;
                    setViewCredentialsDoctor(null);
                    onSwitchToDoctor(doc);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-600/25"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Launch Console</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
