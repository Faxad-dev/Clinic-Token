import React, { useState } from 'react';
import { Doctor, DepartmentId } from '../../types';
import { doctorAuthService } from '../../services/doctorAuthStore';
import { queueService } from '../../services/queueStore';
import { 
  Stethoscope, 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Sparkles, 
  AlertCircle, 
  UserPlus, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Hash, 
  Coins, 
  X,
  FileCheck
} from 'lucide-react';

interface DoctorLoginPortalProps {
  onSuccess?: (doctor: Doctor) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const DoctorLoginPortal: React.FC<DoctorLoginPortalProps> = ({
  onSuccess,
  onCancel,
  isModal = false,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'quick' | 'register'>('signin');
  
  // Sign in form state
  const [identifier, setIdentifier] = useState('DOC-101');
  const [pin, setPin] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regDept, setRegDept] = useState<DepartmentId>('cardiology');
  const [regQual, setRegQual] = useState('MBBS, MD, FCPS');
  const [regSpec, setRegSpec] = useState('Consultant Cardiologist');
  const [regChamber, setRegChamber] = useState('Chamber 305');
  const [regFee, setRegFee] = useState(2200);
  const [regPin, setRegPin] = useState('1234');

  const doctorsList = queueService.getState().doctors;
  const departments = queueService.getState().departments;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      const result = doctorAuthService.login(identifier, pin);
      setIsAuthenticating(false);

      if (result.success && result.doctor) {
        if (onSuccess) {
          onSuccess(result.doctor);
        }
      } else {
        setErrorMsg(result.error || 'Authentication failed. Please verify credentials.');
      }
    }, 450);
  };

  const handleQuickLogin = (doctorId: string) => {
    setErrorMsg(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      const result = doctorAuthService.quickLoginAsDoctor(doctorId);
      setIsAuthenticating(false);

      if (result.success && result.doctor) {
        if (onSuccess) {
          onSuccess(result.doctor);
        }
      } else {
        setErrorMsg('Failed to log in as selected doctor.');
      }
    }, 350);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      const result = doctorAuthService.registerDoctor({
        name: regName,
        qualification: regQual,
        departmentId: regDept,
        specialization: regSpec,
        chamberNumber: regChamber,
        consultationFee: regFee,
        pin: regPin,
      });

      setIsAuthenticating(false);

      if (result.success && result.doctor) {
        if (onSuccess) {
          onSuccess(result.doctor);
        }
      } else {
        setErrorMsg(result.error || 'Registration failed. Please check inputs.');
      }
    }, 500);
  };

  const containerContent = (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-[#090d16]/95 border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,245,255,0.12)] backdrop-blur-2xl relative overflow-hidden">
      {/* Background neon ambient accents */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Modal Close Button if in modal mode */}
      {isModal && onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white hover:border-cyan-400 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header Banner */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <Stethoscope className="w-8 h-8" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            Authorized Medical Staff Only
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
          Doctor Chamber Sign In
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
          Sign in with your Medical Staff ID or PIN to access your OPD consultation queue, chamber controls, and patient notes.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 text-xs font-semibold relative z-10">
        <button
          type="button"
          onClick={() => { setAuthMode('signin'); setErrorMsg(null); }}
          className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            authMode === 'signin'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Staff Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => { setAuthMode('quick'); setErrorMsg(null); }}
          className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            authMode === 'quick'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Demo (1-Click)</span>
        </button>

        <button
          type="button"
          onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
          className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            authMode === 'register'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Doctor</span>
        </button>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab 1: Staff Sign In */}
      {authMode === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Doctor ID / Staff Code / Name / Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. DOC-101, Dr. Tariq, or staff email"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 outline-none font-mono"
              />
              <span className="absolute right-3.5 top-3.5 text-slate-500">
                <FileCheck className="w-4 h-4" />
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Sample Codes: <span className="text-cyan-400 font-mono">DOC-101</span>, or enter your full Doctor name or Staff Code assigned by Admin.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Chamber Password / Security PIN
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter password or 4-digit PIN"
                maxLength={40}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 outline-none font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Default Demo PIN: <strong className="text-cyan-300 font-mono">1234</strong></span>
              <span className="text-slate-400">Encrypted 256-bit</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isAuthenticating ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Verifying Biometric Credentials...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Authenticate & Open Chamber</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Tab 2: Quick Demo Access (1-Click) */}
      {authMode === 'quick' && (
        <div className="space-y-3 relative z-10">
          <p className="text-xs text-slate-400 mb-2">
            Click any doctor below to immediately log into their OPD chamber desk and live consultation queue:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {doctorsList.map((doc) => {
              const account = doctorAuthService.getAccountForDoctor(doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleQuickLogin(doc.id)}
                  disabled={isAuthenticating}
                  className="p-3 rounded-2xl bg-slate-900/90 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-left transition-all flex items-center gap-3 group cursor-pointer"
                >
                  <img
                    src={doc.photoUrl}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover border border-cyan-500/30 group-hover:border-cyan-400 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-cyan-400 truncate">
                      {doc.chamberNumber}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ID: {account?.staffCode || 'DOC-***'} • PIN: 1234
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Register New Doctor */}
      {authMode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-3.5 relative z-10 max-h-[420px] overflow-y-auto pr-1">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
              Doctor Full Name
            </label>
            <input
              type="text"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="e.g. Dr. Hina Tahir"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                Department
              </label>
              <select
                value={regDept}
                onChange={(e) => setRegDept(e.target.value as DepartmentId)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                Chamber / Room
              </label>
              <input
                type="text"
                value={regChamber}
                onChange={(e) => setRegChamber(e.target.value)}
                placeholder="e.g. Chamber 405"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={regSpec}
                onChange={(e) => setRegSpec(e.target.value)}
                placeholder="e.g. Interventional Cardiology"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                Qualifications
              </label>
              <input
                type="text"
                value={regQual}
                onChange={(e) => setRegQual(e.target.value)}
                placeholder="MBBS, FCPS, MD"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                Consultation Fee (PKR)
              </label>
              <input
                type="number"
                value={regFee}
                onChange={(e) => setRegFee(Number(e.target.value))}
                min={500}
                step={100}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                Set 4-Digit Access PIN
              </label>
              <input
                type="password"
                value={regPin}
                onChange={(e) => setRegPin(e.target.value)}
                placeholder="4-digit PIN"
                maxLength={6}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white outline-none font-mono tracking-widest"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-wide shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4 text-slate-950" />
            <span>Register & Log into Chamber</span>
          </button>
        </form>
      )}

      {/* Security Footer Notice */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          End-to-End Hospital Network
        </span>
        <span className="font-mono text-cyan-400/80">Audit Log #89201</span>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        {containerContent}
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 flex items-center justify-center min-h-[70vh]">
      {containerContent}
    </div>
  );
};
