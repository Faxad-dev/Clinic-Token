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
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Modal Close Button if in modal mode */}
      {isModal && onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors z-20 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header Banner */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-3 shadow-sm">
          <Stethoscope className="w-8 h-8" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Authorized Medical Staff Only
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
          Doctor Chamber Sign In
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
          Sign in with your Medical Staff ID or PIN to access your OPD consultation queue, chamber controls, and patient notes.
        </p>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Staff Sign In Form */}
      <form onSubmit={handleSignIn} className="space-y-4 relative z-10">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-semibold mb-1.5">
            Doctor ID / Staff Code / Name / Email
          </label>
          <div className="relative">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. DOC-101, Dr. Tariq, or staff email"
              required
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 placeholder-slate-400 outline-none font-mono shadow-sm"
            />
            <span className="absolute right-3.5 top-3.5 text-slate-400">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Assigned Codes: <span className="text-blue-700 font-mono font-semibold">DOC-101</span>, or enter your doctor name / staff code assigned by Admin.
          </p>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-semibold mb-1.5">
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
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 placeholder-slate-400 outline-none font-mono tracking-wider shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Demo PIN: <strong className="text-blue-700 font-mono">1234</strong></span>
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Lock className="w-3 h-3 text-blue-600" />
              Encrypted 256-bit
            </span>
          </div>
        </div>

        {/* Clinical governance guidance notice */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2.5">
          <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            New consultants and specialists are registered through the <strong className="text-slate-900">Admin Section</strong>. If you are a new medical officer or need credentials reset, please visit the hospital reception administration desk.
          </p>
        </div>

        <button
          type="submit"
          disabled={isAuthenticating}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm tracking-wide shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isAuthenticating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying Biometric Credentials...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Authenticate & Open Chamber</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Security Footer Notice */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          End-to-End Hospital Network
        </span>
        <span className="font-mono text-slate-400">Audit Log #89201</span>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
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
