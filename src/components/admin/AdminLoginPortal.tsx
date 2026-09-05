import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  X
} from 'lucide-react';
import { adminAuthService, AdminUser } from '../../services/adminAuthStore';

interface AdminLoginPortalProps {
  onSuccess: (admin: AdminUser) => void;
  isModal?: boolean;
  onCancel?: () => void;
}

export const AdminLoginPortal: React.FC<AdminLoginPortalProps> = ({
  onSuccess,
  isModal = false,
  onCancel,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const result = adminAuthService.login(username, password);
      setIsLoading(false);
      if (result.success && result.admin) {
        onSuccess(result.admin);
      } else {
        setErrorMsg(result.message);
      }
    }, 300);
  };

  const handleFillDemoCredentials = () => {
    setUsername('Fahad');
    setPassword('Fahadali.938');
    setErrorMsg('');
  };

  const content = (
    <div className="w-full max-w-md mx-auto">
      {/* Glow Card */}
      <div className="relative rounded-3xl bg-[#090d16] border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl overflow-hidden">
        {/* Subtle top indicator beam */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-600"></div>

        {isModal && onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Badge & Title */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-cyan-500/20 border border-purple-500/40 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-mono font-semibold uppercase tracking-wider mb-1.5">
              <Lock className="w-3 h-3" />
              <span>Restricted Access Control</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Admin & Reception Sign In
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Authorized clinical officers & hospital administrators only.
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-rose-300">Access Denied</div>
              <div className="text-slate-300 mt-0.5">{errorMsg}</div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Admin Username</span>
              <span className="text-[10px] text-cyan-400 font-normal">Case-Sensitive</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="admin-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm text-slate-100 placeholder-slate-600 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Admin Password</span>
              <span className="text-[10px] text-slate-500 font-normal">Security Encrypted</span>
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm text-slate-100 placeholder-slate-600 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-cyan-500 to-blue-600 hover:from-purple-500 hover:via-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(168,85,247,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Sign In to Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Authorized Credentials Helper Card */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Authorized Administrator Key</span>
            </span>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 transition-colors font-medium cursor-pointer"
            >
              Autofill Credentials
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Username:</span>
              <span className="text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Fahad
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Password:</span>
              <span className="text-purple-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Fahadali.938
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Reception desk privileges allow adding/editing medical officers, scheduling shift quotas, issuing walk-in physical OPD tokens, and managing department directories.
          </p>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        {content}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {content}
    </div>
  );
};
