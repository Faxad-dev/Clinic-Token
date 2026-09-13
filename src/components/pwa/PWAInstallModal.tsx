import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  Check, 
  Copy, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  QrCode
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'prompt' | 'ios' | 'android' | 'qr'>('prompt');
  const [copied, setCopied] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success'>('idle');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://aura-nexus.med';

  useEffect(() => {
    if (isIOS) {
      setActiveTab('ios');
    } else if (isInstallable || isAndroid) {
      setActiveTab('prompt');
    } else {
      setActiveTab('qr');
    }
  }, [isIOS, isAndroid, isInstallable, isOpen]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    setInstallStatus('installing');
    const result = await install();
    if (result === 'accepted') {
      setInstallStatus('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setInstallStatus('idle');
      if (isIOS) {
        setActiveTab('ios');
      } else {
        setActiveTab('android');
      }
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#0d1424] border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-100 p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Background Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Header with Close */}
        <div className="relative flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center overflow-hidden">
              <img 
                src="/icon.svg" 
                alt="Aura Nexus Icon" 
                className="w-full h-full object-cover rounded-[14px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Smartphone className="w-6 h-6 text-white absolute" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Install Mobile App</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-400">Direct installation from this website to your phone</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits Pill Strip */}
        <div className="relative grid grid-cols-3 gap-2 my-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5 text-center">
            <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">Instant Access</div>
            <div className="text-[9px] text-slate-400">No App Store Login</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5 text-center">
            <Smartphone className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">Full Screen</div>
            <div className="text-[9px] text-slate-400">Native Feel &amp; Icon</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">Live Radar</div>
            <div className="text-[9px] text-slate-400">Real-time OPD alerts</div>
          </div>
        </div>

        {/* Status if already installed */}
        {isInstalled && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Aura Nexus is installed on this device! You can launch it anytime directly from your home screen or apps menu.</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 text-xs mb-4">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'prompt' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Tap Install</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ios' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>iPhone / iOS</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'android' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* TAB 1: 1-Tap / Browser Direct Prompt */}
        {activeTab === 'prompt' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900/60 border border-cyan-500/20 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center mx-auto shadow-inner">
                <Download className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Ready for 1-Tap Installation</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
                  Add Aura Nexus Med•OS directly onto your phone or desktop home screen.
                </p>
              </div>

              <button
                onClick={handleNativeInstall}
                disabled={installStatus === 'installing'}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {installStatus === 'installing' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Preparing Installation...</span>
                  </>
                ) : installStatus === 'success' ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Installed Successfully!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Install App on Device</span>
                  </>
                )}
              </button>

              {!isInstallable && (
                <p className="text-[11px] text-amber-300/90 pt-1">
                  If the prompt does not show automatically on your browser, select your device tab above (iPhone or Android) for simple 2-step setup!
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: iOS / Safari Guide */}
        {activeTab === 'ios' && (
          <div className="space-y-3">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>How to Install on iPhone / iPad (Safari):</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-white">Tap the Share icon</span> in the bottom toolbar of Safari (box with an arrow pointing up).
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-white">Scroll down and tap "Add to Home Screen"</span> (with the plus icon <PlusSquare className="w-3.5 h-3.5 inline text-cyan-400" />).
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-white">Tap "Add"</span> in the top-right corner. Aura Nexus is now installed on your home screen!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Android Guide */}
        {activeTab === 'android' && (
          <div className="space-y-3">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Smartphone className="w-4 h-4" />
                <span>How to Install on Android (Chrome / Samsung Internet):</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-white">Tap the 3 dots menu (⋮)</span> in the top right corner of Chrome.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-white">Tap "Install app" or "Add to Home screen"</span>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    Confirm <span className="font-semibold text-white">"Install"</span>. The app icon will appear alongside your other native apps!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QR Code for Phone Scan */}
        {activeTab === 'qr' && (
          <div className="text-center space-y-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
              <p className="text-xs text-slate-300 mb-3 font-medium">
                Point your phone camera at this QR code to open &amp; install directly on your device:
              </p>
              
              <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-cyan-500/30">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&color=0b0f17&data=${encodeURIComponent(currentUrl)}`}
                  alt="Scan to open on phone" 
                  className="w-40 h-40 object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to text box if external QR generator blocked
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="mt-3 text-[11px] text-cyan-300 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compatible with all modern iOS &amp; Android devices</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Link & Copy */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy App URL</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 font-semibold transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};

export default PWAInstallModal;
