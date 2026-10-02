import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  Smartphone, 
  BellRing, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Play,
  RotateCcw,
  Sparkles,
  Radio,
  ChevronDown
} from 'lucide-react';
import { GlowCard } from '../ui/spotlight-card';
import StackingCards, { StackingCardItem } from '@/components/ui/stacking-cards';
import { cn } from '@/lib/utils';

interface WorkflowSectionProps {
  onBookClick: () => void;
  onTrackClick: () => void;
}

export const WorkflowSection: React.FC<WorkflowSectionProps> = ({
  onBookClick,
  onTrackClick,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedTokenStatus, setSimulatedTokenStatus] = useState<string>('Token #TK-014 Registered');
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulatedTokenStatus('Step 1: Token #TK-014 Issued (Wait: 14 mins)');
    setActiveStep(1);

    setTimeout(() => {
      setActiveStep(2);
      setSimulatedTokenStatus('Step 2: Radar Active · Position #2 · Enjoy hospital lounge');
    }, 2000);

    setTimeout(() => {
      setActiveStep(3);
      setSimulatedTokenStatus('Step 3: 🔔 Buzzer Alert! Direct Walk-In to Chamber #102');
    }, 4200);

    setTimeout(() => {
      setIsSimulating(false);
    }, 6500);
  };

  const steps = [
    {
      step: '01',
      title: 'Digital Token Generation',
      subtitle: 'Instant QR & Queue Slot',
      description: 'Select your preferred specialist physician. Receive an authenticated digital token with dynamic wait time estimation and exact chamber wing instructions.',
      icon: Ticket,
      accentColor: 'from-blue-600 to-cyan-500',
      badge: 'Zero Counter Queuing',
      highlight: 'Sub-second Sync',
    },
    {
      step: '02',
      title: 'Live Radar Telemetry',
      subtitle: 'Track Anywhere on Mobile',
      description: 'Relax in the hospital garden or cafe. Your smartphone displays real-time radar token countdowns, current serving numbers, and chamber doctor status.',
      icon: Smartphone,
      accentColor: 'from-cyan-500 to-teal-500',
      badge: 'Freedom of Movement',
      highlight: 'SMS & Web Alerts',
    },
    {
      step: '03',
      title: 'Direct Chamber Walk-In',
      subtitle: 'Zero Lobby Overcrowding',
      description: 'When you are 2 tokens away, a gentle vibration buzzer alerts you. Walk straight through the physician door into Chamber #102 with zero lobby stress.',
      icon: BellRing,
      accentColor: 'from-emerald-500 to-green-600',
      badge: 'Zero Lobby Wait',
      highlight: 'Priority Consultation',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-950 text-white relative overflow-visible md:overflow-hidden border-b border-slate-800">
      {/* Background Subtle Radial Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[800px] h-[500px] bg-gradient-to-tr from-cyan-600/10 via-blue-500/10 to-transparent blur-3xl pointer-events-none -z-0"
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <GlowCard
            customSize
            glowColor="cyan"
            backdrop="rgba(15, 23, 42, 0.7)"
            backupBorder="rgba(51, 65, 85, 0.5)"
            spotlightSize={400}
            className="w-full rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-800/80 shadow-2xl relative overflow-visible md:overflow-hidden"
          >
            {/* Section Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16"
            >
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Predictive Outpatient Protocol</span>
                </div>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                  How Aura Nexus Eliminates Waiting Room Stress
                </h2>
                <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
                  Our Swiss-engineered clinical queuing system replaces crowded waiting halls with frictionless sub-second mobile telemetry.
                </p>
              </div>

              {/* Interactive Simulation Trigger */}
              <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                    isSimulating
                      ? 'bg-emerald-600/80 text-white animate-pulse'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-500/25 active:scale-95'
                  }`}
                >
                  {isSimulating ? (
                    <>
                      <Radio className="w-3.5 h-3.5 animate-spin" />
                      <span>Simulating Flow...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Simulate 3-Step Journey</span>
                    </>
                  )}
                </button>
                <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{simulatedTokenStatus}</span>
                </div>
              </div>
            </motion.div>

            {/* Card Content Renderer */}
            {(() => {
              const renderCard = (item: typeof steps[0], index: number) => {
                const stepNum = index + 1;
                const isSelected = activeStep === stepNum;

                return (
                  <div
                    onClick={() => setActiveStep(stepNum)}
                    className={`relative rounded-3xl p-6 sm:p-7 transition-all duration-350 cursor-pointer flex flex-col justify-between border shadow-xl ${
                      isSelected
                        ? 'bg-slate-900/98 border-cyan-400 shadow-[0_16px_45px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                        : 'bg-slate-900/85 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Step Top Bar */}
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
                        <span className="text-3xl font-black font-mono text-cyan-400/80 transition-colors">
                          {item.step}
                        </span>
                        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-800/90 text-cyan-300 border border-slate-700 shadow-sm">
                          {item.badge}
                        </span>
                      </div>

                      {/* Icon Box with Gradient */}
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${item.accentColor} p-0.5 shadow-lg shadow-blue-500/20 mb-4 sm:mb-5 flex items-center justify-center`}>
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                          <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {item.title}
                      </h3>
                      <div className="text-xs font-mono text-cyan-400/90 font-medium mt-0.5 mb-2.5 sm:mb-3">
                        {item.subtitle}
                      </div>

                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Card Bottom Meta */}
                    <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.highlight}</span>
                      </span>

                      <span className="text-cyan-400 font-semibold flex items-center gap-1 text-[11px] group-hover:translate-x-1 transition-transform">
                        <span>{isSelected ? 'Active Step' : 'Explore'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              };

              return (
                <>
                  {/* Mobile Stacking Cards (< md) */}
                  <div className="md:hidden">
                    <div
                      ref={mobileContainerRef}
                      className="h-[490px] bg-[#030712]/90 border border-blue-900/40 rounded-3xl overflow-y-auto overscroll-contain shadow-2xl relative scroll-smooth"
                    >
                      <StackingCards
                        totalCards={steps.length}
                        scrollOptions={{ container: mobileContainerRef }}
                        scaleMultiplier={0.035}
                      >
                        {/* Stage progress header bar */}
                        <div className="sticky top-0 z-20 font-mono h-[46px] w-full px-4 text-xs font-semibold flex justify-between items-center text-cyan-400 bg-[#070e1e]/95 backdrop-blur-md border-b border-blue-900/40 shadow-sm">
                          <span className="flex items-center gap-2 text-[11px] text-cyan-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            <span>Step-by-Step Patient Protocol</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Stage {activeStep} / 3
                          </span>
                        </div>

                        {steps.map((item, index) => {
                          const stepNum = index + 1;
                          const isSelected = activeStep === stepNum;
                          return (
                            <StackingCardItem
                              key={item.step}
                              index={index}
                              className="h-[440px]"
                              topPosition={`${18 + index * 14}px`}
                            >
                              <div
                                onClick={() => setActiveStep(stepNum)}
                                className={cn(
                                  "h-[88%] w-[94%] mx-auto rounded-3xl p-5 flex flex-col justify-between shadow-2xl border transition-all duration-300 relative cursor-pointer overflow-hidden",
                                  index === 0 && "bg-gradient-to-br from-blue-950 via-[#0a152e] to-[#030712] border-blue-500/50 shadow-[0_12px_35px_rgba(37,99,235,0.3)]",
                                  index === 1 && "bg-gradient-to-br from-cyan-950 via-[#071d24] to-[#030712] border-cyan-500/50 shadow-[0_12px_35px_rgba(6,182,212,0.3)]",
                                  index === 2 && "bg-gradient-to-br from-emerald-950 via-[#07211a] to-[#030712] border-emerald-500/50 shadow-[0_12px_35px_rgba(16,185,129,0.3)]",
                                  isSelected && "ring-2 ring-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                                )}
                              >
                                {/* Card Body Top */}
                                <div>
                                  <div className="flex items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl font-black font-mono text-cyan-300">
                                        {item.step}
                                      </span>
                                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-500/30">
                                        {item.badge}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">
                                      {isSelected ? '● Focused' : 'Tap to focus'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 mb-3">
                                    <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-tr p-0.5 shadow-md flex items-center justify-center shrink-0", item.accentColor)}>
                                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                                        <item.icon className="w-5 h-5 text-cyan-400" />
                                      </div>
                                    </div>
                                    <div className="min-w-0">
                                      <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                                        {item.title}
                                      </h3>
                                      <div className="text-[11px] font-mono text-cyan-400/90 font-medium">
                                        {item.subtitle}
                                      </div>
                                    </div>
                                  </div>

                                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-4">
                                    {item.description}
                                  </p>
                                </div>

                                {/* Card Body Bottom Meta */}
                                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>{item.highlight}</span>
                                  </span>
                                  <span className="text-cyan-400 font-semibold flex items-center gap-1 text-[11px]">
                                    <span>{isSelected ? 'Active Step' : 'Select'}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            </StackingCardItem>
                          );
                        })}

                        {/* Stacking completion banner reveal at end of scroll */}
                        <div className="w-full py-8 text-center bg-slate-950/60 flex flex-col items-center justify-center gap-3 px-4 border-t border-slate-800/60">
                          <div className="font-mono text-cyan-300 text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>All 3 Workflow Stages Active</span>
                          </div>
                          <p className="text-[11px] text-slate-400 max-w-xs">
                            Direct OPD token registration, live radar telemetry, and chamber buzzer notifications.
                          </p>
                          <button
                            onClick={onBookClick}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 cursor-pointer flex items-center gap-2 active:scale-95 transition-all"
                          >
                            <span>Book Specialist Doctor</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </StackingCards>
                    </div>
                  </div>

                  {/* Desktop Standard 3-Step Responsive Grid (md and above) */}
                  <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">
                    {steps.map((item, index) => (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
                        className="h-full"
                      >
                        {renderCard(item, index)}
                      </motion.div>
                    ))}
                  </div>
                </>
              );
            })()}

            {/* Bottom Fast Action Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Ready to consult with a specialist physician?</div>
                  <div className="text-xs text-slate-400">Tokens are available for morning and evening shifts today across all 6 clinical wings.</div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={onBookClick}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Book Doctor Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onTrackClick}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>Track Active Token</span>
                </button>
              </div>
            </motion.div>

          </GlowCard>
        </motion.div>
      </div>
    </section>
  );
};
