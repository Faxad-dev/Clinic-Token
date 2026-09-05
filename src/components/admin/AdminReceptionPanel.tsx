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
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/15 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-purple-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Hospital Administration & Reception Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            OPD Central Governance
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage medical specialists, configure daily OPD slot capacities, issue walk-in tokens, and audit departmental throughput.
          </p>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {authenticatedAdmin && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold truncate max-w-[120px] sm:max-w-none">{authenticatedAdmin.displayName}</span>
            </div>
          )}

          <button
            id="btn-admin-add-doctor"
            onClick={handleOpenAddDoctorModal}
            className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
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
            className="px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Reset Demo</span>
            <span className="sm:hidden">Reset</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-2.5 sm:px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Lock Admin Console & Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'roster'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="hidden md:inline">Specialists & Slot Configuration ({queueState.doctors.length})</span>
          <span className="md:hidden">Specialists ({queueState.doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('walkin')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'walkin'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span className="hidden md:inline">Reception Walk-in Desk</span>
          <span className="md:hidden">Walk-in Desk</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'departments'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden md:inline">Departmental Overview ({queueState.departments.length})</span>
          <span className="md:hidden">Departments ({queueState.departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'analytics'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {queueState.doctors.map((doc) => {
              const queue = queueService.getDoctorQueue(doc.id);
              const totalTokensIssued = doc.schedules.reduce((acc, s) => acc + s.tokensIssued, 0);

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={doc.photoUrl}
                          alt={doc.name}
                          referrerPolicy="no-referrer"
                          className="w-13 h-13 rounded-2xl object-cover border-2 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Roster Active" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{doc.name}</h4>
                        </div>
                        <div className="text-xs text-slate-400">{doc.specialization}</div>
                        <div className="text-[10px] font-mono text-purple-300 mt-0.5">
                          {doc.qualification}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleShowDoctorCredentials(doc)}
                      className="p-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-mono transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                      title="View Doctor Login Credentials & Password"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                      <span className="hidden sm:inline">Credentials</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-slate-500 block font-mono">Chamber</span>
                      <span className="font-semibold text-cyan-300 font-mono">{doc.chamberNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-mono">Fee (PKR)</span>
                      <span className="font-semibold text-white font-mono">{doc.consultationFee}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-mono">Queue Load</span>
                      <span className="font-semibold text-emerald-400 font-mono">
                        {queue.waitingCount} waiting / {queue.completedCount} done
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-mono">Avg Consult</span>
                      <span className="font-semibold text-purple-300 font-mono">~{doc.avgConsultationMinutes}m</span>
                    </div>
                  </div>

                  {/* Schedule slots */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-mono text-slate-400 font-medium">
                      Configured OPD Slots:
                    </div>
                    {doc.schedules.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-2 rounded-lg bg-slate-800/60 flex items-center justify-between text-xs"
                      >
                        <span className="capitalize text-slate-300 font-medium">
                          {slot.shift} ({slot.timeRange})
                        </span>
                        <span className="font-mono text-cyan-300 text-[11px]">
                          {slot.tokensIssued} / {slot.maxCapacity} cap
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Walk-In Reception Desk */}
      {activeTab === 'walkin' && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Issue Reception Walk-in Token</h3>
              <p className="text-xs text-slate-400">For counter patients visiting OPD without online pre-booking.</p>
            </div>
          </div>

          {walkinSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2">
              <div className="text-xs font-mono uppercase text-emerald-300 font-bold">
                Walk-In Token Generated!
              </div>
              <div className="text-4xl font-black font-mono text-white tracking-widest">
                {walkinSuccess.tokenDisplay}
              </div>
              <div className="text-xs text-slate-300">
                Assigned to <strong>{walkinSuccess.doctorName}</strong>. Patient placed in live queue.
              </div>
            </div>
          )}

          <form onSubmit={handleWalkinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Assign Doctor & Chamber *
              </label>
              <select
                value={walkinDocId}
                onChange={(e) => setWalkinDocId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white focus:outline-none focus:border-purple-400"
              >
                {queueState.doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} • {d.chamberNumber} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Patient Name *
              </label>
              <input
                type="text"
                required
                value={walkinPatientName}
                onChange={(e) => setWalkinPatientName(e.target.value)}
                placeholder="Walk-in patient name..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={walkinAge}
                  onChange={(e) => setWalkinAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span className="text-xs text-slate-200">Emergency / Priority Pass</span>
              </div>
              <input
                type="checkbox"
                checked={walkinEmergency}
                onChange={(e) => setWalkinEmergency(e.target.checked)}
                className="w-4 h-4 accent-purple-400 cursor-pointer"
              />
            </div>

            <button
              id="btn-admin-issue-walkin"
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Issue Immediate Walk-In Token</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Departmental Overview */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queueState.departments.map((dept) => {
            const deptDocs = queueState.doctors.filter((d) => d.departmentId === dept.id);
            const deptTokens = queueState.tokens.filter((t) => t.departmentId === dept.id);
            const waitingCount = deptTokens.filter((t) => t.status === 'waiting').length;
            const completedCount = deptTokens.filter((t) => t.status === 'completed').length;

            return (
              <div
                key={dept.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
                      {dept.chamberWing}
                    </span>
                    <h3 className="text-base font-bold text-white">{dept.name}</h3>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {deptDocs.length} Specialists
                  </span>
                </div>

                <p className="text-xs text-slate-400">{dept.tagline}</p>

                <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Total</span>
                    <span className="text-base font-bold font-mono text-white">{deptTokens.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Waiting</span>
                    <span className="text-base font-bold font-mono text-amber-400">{waitingCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Served</span>
                    <span className="text-base font-bold font-mono text-emerald-400">{completedCount}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                  Head of Wing: <strong className="text-slate-200">{dept.headOfDepartment}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: Daily Token Reports & Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Total Tokens Generated Today</div>
              <div className="text-3xl font-extrabold font-mono text-cyan-300 mt-1">
                {stats.totalTokens}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">+18% vs yesterday</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Currently in Queue</div>
              <div className="text-3xl font-extrabold font-mono text-amber-300 mt-1">
                {stats.waitingTokens}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Across all 6 wings</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Consultations Completed</div>
              <div className="text-3xl font-extrabold font-mono text-emerald-300 mt-1">
                {stats.completedTokens}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">Prescriptions archived</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Average Turnaround Pace</div>
              <div className="text-3xl font-extrabold font-mono text-purple-300 mt-1">
                ~{stats.avgConsultMins}m
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Rolling average formula</div>
            </div>
          </div>

          {/* Tokens Log Table */}
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm sm:text-base font-bold text-white">Live OPD Tokens Ledger</h3>
              <span className="text-xs font-mono text-slate-400">
                {queueState.tokens.length} records logged
              </span>
            </div>

            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                    <th className="py-2.5 px-3">Token #</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Consultant</th>
                    <th className="py-2.5 px-3">Shift</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Booked At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {queueState.tokens.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                        {t.tokenDisplay}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">
                        {t.patientName} ({t.patientAge}y)
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{t.doctorName}</td>
                      <td className="py-2.5 px-3 capitalize text-slate-400">{t.slotShift}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                            t.status === 'in-progress'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : t.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : t.status === 'waiting'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-3xl bg-[#0d1322] border border-purple-500/40 p-5 sm:p-7 space-y-5 shadow-[0_0_50px_rgba(168,85,247,0.25)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Consultant Specialist</h3>
                  <p className="text-[11px] text-slate-400">Configure clinical details, profile photo, and chamber console login password.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingDoctor(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-5 text-xs">
              {/* SECTION 1: Doctor Clinical Profile */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>1. Clinical Identification & OPD Chamber</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 uppercase font-mono mb-1 text-[10px]">
                      Doctor Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDocName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Dr. Noman Arshad"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase font-mono mb-1 text-[10px]">
                      Qualifications & Degrees
                    </label>
                    <input
                      type="text"
                      value={newDocQual}
                      onChange={(e) => setNewDocQual(e.target.value)}
                      placeholder="e.g. MBBS, MD, FCPS (Cardiology)"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 uppercase font-mono mb-1 text-[10px]">Department</label>
                    <select
                      value={newDocDept}
                      onChange={(e) => setNewDocDept(e.target.value as DepartmentId)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none"
                    >
                      {queueState.departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase font-mono mb-1 text-[10px]">Chamber Room</label>
                    <input
                      type="text"
                      value={newDocChamber}
                      onChange={(e) => setNewDocChamber(e.target.value)}
                      placeholder="e.g. Chamber 205 (2nd Floor)"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-mono mb-1 text-[10px]">
                    Specialization Focus *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDocSpec}
                    onChange={(e) => setNewDocSpec(e.target.value)}
                    placeholder="e.g. Pediatric Cardiology, Angioplasty & Heart Rhythm"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 uppercase font-mono mb-1 text-[10px]">Exp (Yrs)</label>
                    <input
                      type="number"
                      value={newDocExp}
                      onChange={(e) => setNewDocExp(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase font-mono mb-1 text-[10px]">Fee (PKR)</label>
                    <input
                      type="number"
                      value={newDocFee}
                      onChange={(e) => setNewDocFee(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase font-mono mb-1 text-[10px]">Slot Tokens</label>
                    <input
                      type="number"
                      value={newDocMorningSlots}
                      onChange={(e) => setNewDocMorningSlots(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Doctor Profile Photo */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>2. Doctor Profile Photo</span>
                  </div>

                  {/* Mode Tabs */}
                  <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPhotoInputMode('presets')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        photoInputMode === 'presets'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                        photoInputMode === 'upload'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
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
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {/* Active Photo Preview Bar */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="relative">
                    <img
                      src={newDocPhotoUrl || CLINICAL_AVATAR_PRESETS[0].url}
                      alt="Doctor Preview"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-400/50 shadow-md"
                      onError={() => {
                        setNewDocPhotoUrl(CLINICAL_AVATAR_PRESETS[0].url);
                        setPhotoError('Failed to load provided image URL, reverted to clinical preset.');
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-slate-950 flex items-center justify-center text-[9px] text-white">
                      ✓
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs truncate">
                      {newDocName.trim() || 'Attending Physician Avatar'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {newDocSpec.trim() || 'Selected specialty portrait'}
                    </div>
                    <div className="text-[10px] font-mono text-purple-300 mt-0.5">
                      Ready for OPD card & doctor portal
                    </div>
                  </div>
                </div>

                {photoError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{photoError}</span>
                  </div>
                )}

                {/* Mode Content: Presets */}
                {photoInputMode === 'presets' && (
                  <div className="space-y-1.5">
                    <label className="block text-slate-400 text-[10px] font-mono">
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
                                ? 'bg-purple-900/30 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <div className={`text-[11px] font-semibold truncate ${isSelected ? 'text-purple-200' : 'text-slate-300'}`}>
                                {preset.label}
                              </div>
                              <div className="text-[9px] text-slate-500 font-mono">Verified</div>
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
                        ? 'border-purple-400 bg-purple-500/10'
                        : 'border-slate-700 bg-slate-950/60 hover:border-purple-500/50 hover:bg-slate-900/60'
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
                    <UploadCloud className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-white font-medium text-xs">
                      Drop doctor photo here, or <span className="text-purple-400 underline">browse device</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP (Max 5MB). Photo is stored directly with doctor profile.
                    </p>
                  </div>
                )}

                {/* Mode Content: URL Input */}
                {photoInputMode === 'url' && (
                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono mb-1">
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
                        className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setNewDocPhotoUrl(CLINICAL_AVATAR_PRESETS[0].url)}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-mono"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Doctor Chamber Console Sign-In & Password Credentials */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                        <KeyRound className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-xs tracking-wide">
                          Doctor Console Sign-In Credentials
                        </div>
                        <div className="text-[10px] text-purple-300/80">
                          Set the password and login identifier for the doctor chamber console.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      title="Generate secure password"
                    >
                      <Sparkles className="w-3 h-3 text-purple-300" />
                      <span>Auto-Generate</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Password Field */}
                    <div>
                      <label className="block text-slate-300 font-mono text-[10px] uppercase mb-1">
                        Doctor Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showDocPassword ? 'text' : 'password'}
                          required
                          value={newDocPassword}
                          onChange={(e) => setNewDocPassword(e.target.value)}
                          placeholder="e.g. Doc@2026"
                          className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-900/90 border border-purple-500/40 text-white font-mono text-xs focus:border-purple-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDocPassword(!showDocPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showDocPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Minimum 4 characters (e.g. Doc@107, 1234)
                      </span>
                    </div>

                    {/* Staff Login Code */}
                    <div>
                      <label className="block text-slate-300 font-mono text-[10px] uppercase mb-1">
                        Staff Code (Login ID)
                      </label>
                      <input
                        type="text"
                        value={newDocStaffCode}
                        onChange={(e) => setNewDocStaffCode(e.target.value)}
                        placeholder="e.g. DOC-107"
                        className="w-full p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-cyan-300 font-mono text-xs focus:border-purple-400 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Can be entered as login ID
                      </span>
                    </div>
                  </div>

                  {/* Staff Email (Optional / Auto-filled) */}
                  <div>
                    <label className="block text-slate-300 font-mono text-[10px] uppercase mb-1">
                      Staff Email Address (Optional Login ID)
                    </label>
                    <input
                      type="email"
                      value={newDocEmail}
                      onChange={(e) => setNewDocEmail(e.target.value)}
                      placeholder="e.g. dr.noman@auranexus.med"
                      className="w-full p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 font-mono text-xs focus:border-purple-400 focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-slate-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      The doctor can log in to the <strong className="text-white">Doctor Sign In Portal</strong> using their <strong className="text-cyan-300">Staff Code</strong>, <strong className="text-white">Full Name ({newDocName || 'Dr. Name'})</strong>, or <strong className="text-purple-300">Email</strong> with the password you set above.
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingDoctor(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer flex items-center justify-center gap-2 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#0d1322] border-2 border-emerald-500/50 p-6 sm:p-7 space-y-5 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Specialist Successfully Registered!</h3>
              <p className="text-xs text-slate-400">
                Doctor profile has been added to OPD roster and chamber console login credentials are live.
              </p>
            </div>

            {/* Doctor Profile Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
              <img
                src={createdDoctorModal.doctor.photoUrl}
                alt={createdDoctorModal.doctor.name}
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-500/40"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-sm">{createdDoctorModal.doctor.name}</div>
                <div className="text-xs text-slate-400">{createdDoctorModal.doctor.specialization}</div>
                <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                  {createdDoctorModal.doctor.chamberNumber} • Fee: PKR {createdDoctorModal.doctor.consultationFee}
                </div>
              </div>
            </div>

            {/* Credentials Summary Box */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-semibold text-purple-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  Doctor Sign-In Credentials
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Staff Code (Login ID):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-300">{createdDoctorModal.account.staffCode}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(createdDoctorModal.account.staffCode, 'staffCode')}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Copy Staff Code"
                    >
                      {copiedKey === 'staffCode' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Doctor Name (Login ID):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{createdDoctorModal.doctor.name}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(createdDoctorModal.doctor.name, 'docName')}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Copy Doctor Name"
                    >
                      {copiedKey === 'docName' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-purple-500/30 bg-purple-950/20">
                  <span className="text-purple-300">Console Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-200">{createdDoctorModal.account.password}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(createdDoctorModal.account.password || '', 'pwd')}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Copy Password"
                    >
                      {copiedKey === 'pwd' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'all' ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Credentials Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
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
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Log in as Doctor Now</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setCreatedDoctorModal(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Doctor Credentials Modal (Opened from Roster card) */}
      {viewCredentialsDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#0d1322] border border-purple-500/40 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Chamber Login Credentials</h3>
                  <p className="text-[10px] text-slate-400">Practitioner portal access details</p>
                </div>
              </div>
              <button
                onClick={() => setViewCredentialsDoctor(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Doctor Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <img
                src={viewCredentialsDoctor.doctor.photoUrl}
                alt={viewCredentialsDoctor.doctor.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-purple-500/40"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white">{viewCredentialsDoctor.doctor.name}</h4>
                <div className="text-[11px] text-slate-400">{viewCredentialsDoctor.doctor.specialization}</div>
                <div className="text-[10px] font-mono text-cyan-300">{viewCredentialsDoctor.doctor.chamberNumber}</div>
              </div>
            </div>

            {/* Credentials Fields */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Staff Code (ID):</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-cyan-300">{viewCredentialsDoctor.account.staffCode}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(viewCredentialsDoctor.account.staffCode, 'viewStaffCode')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'viewStaffCode' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Full Name (ID):</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{viewCredentialsDoctor.doctor.name}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(viewCredentialsDoctor.doctor.name, 'viewDocName')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'viewDocName' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Email (ID):</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-300 text-[11px]">{viewCredentialsDoctor.account.email}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(viewCredentialsDoctor.account.email, 'viewEmail')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'viewEmail' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/40">
                <span className="text-purple-300 font-semibold">Chamber Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-200">
                    {viewCredentialsDoctor.account.password || viewCredentialsDoctor.account.pin}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(viewCredentialsDoctor.account.password || viewCredentialsDoctor.account.pin, 'viewPwd')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'viewPwd' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'viewAll' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
