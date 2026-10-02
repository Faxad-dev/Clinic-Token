import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { 
  ShieldCheck, 
  Award, 
  HeartHandshake, 
  CheckCircle2, 
  Phone, 
  Radio, 
  Sparkles, 
  Building2, 
  Users, 
  Clock, 
  Star,
  Check
} from 'lucide-react';
import { GlowCard } from '../ui/spotlight-card';
import { cn } from '@/lib/utils';

interface TrustCardData {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
  image: string;
  color: string;
  accentBorder: string;
}

const MobileTrustCard: React.FC<{
  i: number;
  card: TrustCardData;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}> = ({ i, card, progress, range, targetScale }) => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress: cardProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'],
  });

  const imageScale = useTransform(cardProgress, [0, 1], [1.4, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="min-h-[460px] flex items-center justify-center sticky top-0 py-3"
    >
      <motion.div
        style={{
          backgroundColor: card.color,
          scale,
          top: `calc(16px + ${i * 18}px)`,
        }}
        className={cn(
          "flex flex-col relative w-full rounded-3xl p-5 origin-top border shadow-2xl justify-between min-h-[400px]",
          card.accentBorder
        )}
      >
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-cyan-400 shadow-sm shrink-0">
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                  {card.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-cyan-300 border border-blue-500/30 font-semibold inline-block mt-0.5">
                  {card.badge}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              0{i + 1}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
            {card.description}
          </p>
        </div>

        <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-3.5 border border-white/10 shrink-0 shadow-inner">
          <motion.div className="w-full h-full" style={{ scale: imageScale }}>
            <img
              src={card.image}
              alt={card.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>

        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold font-mono">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Verified Hospital Protocol</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans">
            Continuous Audit
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export const HospitalTrustSection: React.FC = () => {
  const mobileStackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: mobileStackRef,
    offset: ['start start', 'end end'],
  });

  const trustCards: TrustCardData[] = [
    {
      icon: Award,
      title: 'JCI Accredited Facility',
      description: 'Aura Nexus meets international Gold Seal hospital standards for clinical safety and patient outcomes.',
      badge: 'Gold Seal Standard',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
      color: '#081427',
      accentBorder: 'border-blue-500/40 shadow-[0_16px_40px_rgba(30,58,138,0.25)]',
    },
    {
      icon: Radio,
      title: 'Swiss Telemetry Sync',
      description: 'Proprietary sub-second websocket radar synchronization between doctor chambers and patient mobile devices.',
      badge: '<12ms Latency',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
      color: '#061a24',
      accentBorder: 'border-cyan-500/40 shadow-[0_16px_40px_rgba(6,182,212,0.25)]',
    },
    {
      icon: ShieldCheck,
      title: '100% Data Confidentiality',
      description: 'End-to-end encrypted clinical notes, zero public queue exposure, and HIPAA-compliant token architecture.',
      badge: 'HIPAA Compliant',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
      color: '#052018',
      accentBorder: 'border-emerald-500/40 shadow-[0_16px_40px_rgba(16,185,129,0.25)]',
    },
  ];

  const testimonials = [
    {
      patient: 'Farooq Rehman',
      token: 'Token TK-008 · Cardiology',
      comment: 'I checked my token on my phone from the hospital cafe. The buzzer alerted me 5 minutes before Dr. Tariq was ready. I walked straight into Room 102 without sitting in a packed lobby for even 1 minute.',
      rating: 5,
      date: 'Visited Yesterday',
    },
    {
      patient: 'Dr. Mariam Siddiqui',
      token: 'Token TK-019 · Neurology',
      comment: 'As a physician myself, this is the future of outpatient medicine. Complete transparency on chamber wait times and doctor availability without the chaos of paper tokens.',
      rating: 5,
      date: 'Visited 3 days ago',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-950 text-white relative border-b border-slate-800 overflow-visible md:overflow-hidden">
      {/* Background Subtle Radial Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-600/10 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-0"
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
            glowColor="blue"
            backdrop="rgba(15, 23, 42, 0.7)"
            backupBorder="rgba(51, 65, 85, 0.5)"
            spotlightSize={400}
            className="w-full rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-800/80 shadow-2xl relative overflow-visible md:overflow-hidden"
          >
            {/* Top Accreditations Row */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center max-w-3xl mx-auto mb-10 sm:mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Clinical Trust &amp; Standards</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Engineered for Patient Safety &amp; Dignity
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2">
                Eliminating clinical waiting room congestion through rigorous Swiss healthcare telemetry protocols.
              </p>
            </motion.div>

            {/* Mobile Stacking Cards View (< md) using stacking-card architecture */}
            <div className="md:hidden mb-12">
              <div ref={mobileStackRef} className="relative">
                {trustCards.map((card, i) => {
                  const targetScale = 1 - (trustCards.length - i) * 0.05;
                  return (
                    <MobileTrustCard
                      key={card.title}
                      i={i}
                      card={card}
                      progress={scrollYProgress}
                      range={[i * (1 / trustCards.length), 1]}
                      targetScale={targetScale}
                    />
                  );
                })}
              </div>
            </div>

            {/* Desktop 3 Pillars Grid (md and above) */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
              {trustCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
                  className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-700 hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                        <card.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-cyan-300 border border-blue-500/20 font-semibold">
                        {card.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Hospital Protocol</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Real Patient Feedback Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + (i * 0.12), ease: 'easeOut' }}
                  className="p-6 rounded-3xl bg-slate-950 border border-slate-800/90 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(item.rating)].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.date}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                      "{item.comment}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{item.patient}</div>
                      <div className="text-[11px] font-mono text-cyan-400">{item.token}</div>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold">
                      Verified Patient
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </GlowCard>
        </motion.div>
      </div>
    </section>
  );
};
