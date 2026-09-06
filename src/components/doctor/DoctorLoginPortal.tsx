import React, { useState } from 'react';
import { Doctor } from '../../types';
import { doctorAuthService } from '../../services/doctorAuthStore';
import { 
  Stethoscope, 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  X,
  FileCheck,
  Building2
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
  // Sign in form state
  const [identifier, setIdentifier] = useState('DOC-101');
  const [pin, setPin] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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

  const containerContent = (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-[#090d16]/95 border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,245,255,0.12)] backdrop-blur-2xl relative overflow-hidden">
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

      {/* Error Message Box */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Staff Sign In Form */}
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
            Assigned Codes: <span className="text-cyan-400 font-mono">DOC-101</span>, or enter your doctor name / staff code assigned by Admin.
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
            <span>Demo PIN: <strong className="text-cyan-300 font-mono">1234</strong></span>
            <span className="text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              Encrypted 256-bit
            </span>
          </div>
        </div>

        {/* Clinical governance guidance notice */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
          <Building2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            New consultants and specialists are registered through the <strong className="text-cyan-300">Admin Section</strong>. If you are a new medical officer or need credentials reset, please visit the hospital reception administration desk.
          </p>
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
