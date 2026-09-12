"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  RotateCcw, 
  Smartphone, 
  CheckCircle2, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  Pause
} from "lucide-react";

const INJECTED_STYLES = `
  /* Environment Overlays */
  .film-grain {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.04; mix-blend-mode: overlay;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .bg-grid-theme {
      background-size: 50px 50px;
      background-image: 
          linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 0%, transparent 75%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 75%);
  }

  /* Physical Skeuomorphic Materials */
  .text-3d-matte {
      color: #FFFFFF;
      text-shadow: 
          0 10px 25px rgba(0, 0, 0, 0.6), 
          0 2px 4px rgba(0, 0, 0, 0.4);
  }

  .text-silver-matte {
      background: linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.5));
  }

  .text-card-silver-matte {
      background: linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: 
          drop-shadow(0px 10px 20px rgba(0,0,0,0.8)) 
          drop-shadow(0px 4px 6px rgba(0,0,0,0.6));
  }

  /* Deep Physical Card with Dynamic Mouse Lighting */
  .premium-depth-card {
      background: linear-gradient(145deg, #0d1a3e 0%, #060b18 100%);
      box-shadow: 
          0 30px 80px -15px rgba(0, 0, 0, 0.9),
          0 15px 35px -10px rgba(0, 0, 0, 0.8),
          inset 0 1px 2px rgba(255, 255, 255, 0.2),
          inset 0 -2px 4px rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
  }

  .card-sheen {
      position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
      background: radial-gradient(700px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.08) 0%, transparent 45%);
      mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  /* Realistic iPhone Hardware */
  .iphone-bezel {
      background-color: #0b0d13;
      box-shadow: 
          inset 0 0 0 2px #475569, 
          inset 0 0 0 7px #05070a, 
          0 35px 70px -15px rgba(0,0,0,0.9),
          0 15px 25px -5px rgba(0,0,0,0.75);
      transform-style: preserve-3d;
  }

  .hardware-btn {
      background: linear-gradient(90deg, #404040 0%, #171717 100%);
      box-shadow: 
          -2px 0 5px rgba(0,0,0,0.8),
          inset -1px 0 1px rgba(255,255,255,0.15),
          inset 1px 0 2px rgba(0,0,0,0.8);
      border-left: 1px solid rgba(255,255,255,0.05);
  }
  
  .screen-glare {
      background: linear-gradient(115deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 45%);
  }

  .widget-depth {
      background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
      box-shadow: 
          0 8px 16px rgba(0,0,0,0.35),
          inset 0 1px 1px rgba(255,255,255,0.08),
          inset 0 -1px 1px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.06);
  }

  .floating-ui-badge {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%);
      backdrop-filter: blur(20px); 
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 
          0 0 0 1px rgba(255, 255, 255, 0.15),
          0 20px 40px -10px rgba(0, 0, 0, 0.8),
          inset 0 1px 1px rgba(255,255,255,0.25),
          inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  .progress-ring {
      transform: rotate(-90deg);
      transform-origin: center;
      stroke-dasharray: 402;
      stroke-dashoffset: 402;
      stroke-linecap: round;
  }
`;

export interface CinematicHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  brandName?: string;
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  onBookClick?: () => void;
  onTrackClick?: () => void;
}

export function CinematicHero({ 
  brandName = "Aura Nexus",
  tagline1 = "Track your care,",
  tagline2 = "zero waiting room stress.",
  cardHeading = "OPD Queue, redefined.",
  cardDescription = (
    <>
      <span className="text-white font-semibold">Aura Nexus Med•OS</span> synchronizes patient arrival, doctor chamber capacity, and token progression with predictive sub-second telemetry.
    </>
  ),
  metricValue = 128,
  metricLabel = "Tokens Synced",
  ctaHeading = "Experience seamless OPD.",
  ctaDescription = "Instant digital tokens, live radar wait times, and direct specialist physician access.",
  onBookClick,
  onTrackClick,
  className, 
  ...props 
}: CinematicHeroProps) {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const ambientTweenRef = useRef<gsap.core.Tween | null>(null);
  const introTlRef = useRef<gsap.core.Timeline | null>(null);
  const requestRef = useRef<number>(0);

  const [isPlayingRing, setIsPlayingRing] = useState<boolean>(true);

  // 1. High-Performance Real-Time 3D Mouse/Cursor Tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mainCardRef.current || !mockupRef.current) return;
      const rect = mainCardRef.current.getBoundingClientRect();
      
      // Only tilt when cursor is relatively near or over the card
      if (
        e.clientX < rect.left - 100 ||
        e.clientX > rect.right + 100 ||
        e.clientY < rect.top - 100 ||
        e.clientY > rect.bottom + 100
      ) {
        return;
      }

      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        mainCardRef.current?.style.setProperty("--mouse-x", `${mouseX}px`);
        mainCardRef.current?.style.setProperty("--mouse-y", `${mouseY}px`);

        const xNorm = (mouseX / rect.width - 0.5) * 2;
        const yNorm = (mouseY / rect.height - 0.5) * 2;

        gsap.to(mockupRef.current, {
          rotationY: xNorm * 12,
          rotationX: -yNorm * 10,
          ease: "power2.out",
          duration: 0.6,
        });
      });
    };

    const handleMouseLeave = () => {
      // Smoothly return to neutral center on mouse leave
      if (mockupRef.current) {
        gsap.to(mockupRef.current, {
          rotationY: 0,
          rotationX: 0,
          ease: "power3.out",
          duration: 1.0,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    const cardEl = mainCardRef.current;
    if (cardEl) {
      cardEl.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (cardEl) {
        cardEl.removeEventListener("mouseleave", handleMouseLeave);
      }
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // 2. High-Fidelity Entrance Animation Sequence
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clean initial positions
      gsap.set(".hero-title-1", { opacity: 0, y: 25, filter: "blur(10px)" });
      gsap.set(".hero-title-2", { opacity: 0, y: 25, filter: "blur(10px)" });
      gsap.set(".hero-pill-badge", { opacity: 0, scale: 0.9 });
      gsap.set(".main-card", { opacity: 0, y: 35, scale: 0.98 });
      gsap.set(".mockup-wrapper", { opacity: 0, y: 40, rotationX: 15, rotationY: -10, scale: 0.92 });
      gsap.set(".phone-widget-item", { opacity: 0, y: 20 });
      gsap.set(".floating-badge-item", { opacity: 0, y: 25, scale: 0.85 });
      gsap.set(".card-info-left", { opacity: 0, x: -20 });
      gsap.set(".card-brand-right", { opacity: 0, x: 20 });
      gsap.set(".progress-ring", { strokeDashoffset: 402 });

      // Run Entrance Timeline
      const tl = gsap.timeline({ delay: 0.1 });
      introTlRef.current = tl;

      // 1. Taglines reveal
      tl.to(".hero-pill-badge", {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
      })
      .to(".hero-title-1", {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.0,
        ease: "power3.out",
      }, "-=0.5")
      .to(".hero-title-2", {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.0,
        ease: "power3.out",
      }, "-=0.8")

      // 2. Main 3D Card rises into stable position
      .to(".main-card", {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "expo.out",
      }, "-=0.6")

      // 3. iPhone 3D Mockup glides in with perspective
      .to(".mockup-wrapper", {
        opacity: 1,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        duration: 1.4,
        ease: "expo.out",
      }, "-=0.9")

      // 4. Content sides slide in
      .to(".card-info-left", {
        opacity: 1,
        x: 0,
        duration: 1.0,
        ease: "power3.out",
      }, "-=1.0")
      .to(".card-brand-right", {
        opacity: 1,
        x: 0,
        duration: 1.0,
        ease: "power3.out",
      }, "-=1.0")

      // 5. Phone inner widgets stagger
      .to(".phone-widget-item", {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: "back.out(1.4)",
      }, "-=0.7")

      // 6. Token progress ring animates and counter runs
      .to(".progress-ring", {
        strokeDashoffset: 75,
        duration: 1.8,
        ease: "power3.inOut",
      }, "-=0.6")
      .to(".counter-val-num", {
        innerHTML: metricValue,
        snap: { innerHTML: 1 },
        duration: 1.8,
        ease: "expo.out",
      }, "<")

      // 7. Floating badges bounce in
      .to(".floating-badge-item", {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.15,
        duration: 1.0,
        ease: "back.out(1.6)",
      }, "-=1.2");

      // Ambient 3D floating animation (subtle and stable)
      ambientTweenRef.current = gsap.to(mockupRef.current, {
        y: "+=7",
        repeat: -1,
        yoyo: true,
        duration: 2.6,
        ease: "sine.inOut",
      });

    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [metricValue]);

  // Restart intro animation on demand
  const handleReplay = () => {
    if (introTlRef.current) {
      introTlRef.current.restart();
    }
  };

  // Toggle ring pulse animation
  const handleToggleRing = () => {
    setIsPlayingRing(!isPlayingRing);
    const ringEl = document.querySelector(".progress-ring");
    if (ringEl) {
      if (isPlayingRing) {
        gsap.to(ringEl, { strokeDashoffset: 402, duration: 1.0, ease: "power2.inOut" });
      } else {
        gsap.to(ringEl, { strokeDashoffset: 75, duration: 1.2, ease: "power3.out" });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full bg-[#050814] text-white font-sans antialiased overflow-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain" aria-hidden="true" />
      <div className="bg-grid-theme absolute inset-0 z-0 pointer-events-none opacity-40" aria-hidden="true" />

      {/* TOP HEADER SECTION (Natural Flow, Never Hidden) */}
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-8 sm:mb-12">
        <div className="hero-pill-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-cyan-300 text-xs font-semibold mb-4 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive 3D Hardware Telemetry</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-400 font-mono text-[11px]">Sub-Second Sync</span>
        </div>

        <h1 className="hero-title-1 text-3d-matte text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2">
          {tagline1}
        </h1>
        <h2 className="hero-title-2 text-silver-matte text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter">
          {tagline2}
        </h2>
      </div>

      {/* CENTER FOREGROUND: PHYSICAL 3D SKEUOMORPHIC CARD */}
      <div className="relative z-10 max-w-6xl mx-auto" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card relative overflow-hidden rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-10"
        >
          <div className="card-sheen" aria-hidden="true" />

          {/* 3-COLUMN RESPONSIVE LAYOUT */}
          <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-6 z-10">
            
            {/* LEFT COLUMN: Clinical Intelligence & Direct Action (4 cols) */}
            <div className="card-info-left lg:col-span-4 flex flex-col justify-center text-center lg:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-cyan-300 text-[11px] font-semibold w-fit mx-auto lg:mx-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Lobby Crowding</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {cardHeading}
              </h3>

              <div className="text-slate-300/85 text-xs sm:text-sm leading-relaxed max-w-md mx-auto lg:mx-0 font-normal">
                {cardDescription}
              </div>

              {/* Quick CTAs directly on the card */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {onBookClick && (
                  <button
                    onClick={onBookClick}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer group"
                  >
                    <span>Book Appointment</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {onTrackClick && (
                  <button
                    onClick={onTrackClick}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Track Token</span>
                  </button>
                )}
              </div>

              {/* Real-time Status Strip */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>9 Doctors Active</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>&lt;9m Avg Wait</span>
                </div>
              </div>
            </div>

            {/* CENTER COLUMN: 3D REALISTIC IPHONE MOCKUP (4 cols) */}
            <div 
              className="mockup-wrapper lg:col-span-4 relative flex items-center justify-center py-4" 
              style={{ perspective: "1000px" }}
            >
              <div className="relative w-[260px] sm:w-[280px]">
                
                {/* iPhone Hardware Chassis */}
                <div
                  ref={mockupRef}
                  className="relative w-full h-[490px] sm:h-[530px] rounded-[2.8rem] iphone-bezel flex flex-col will-change-transform transform-style-3d cursor-grab active:cursor-grabbing mx-auto"
                >
                  {/* Physical Hardware Buttons */}
                  <div className="absolute top-[100px] -left-[3px] w-[3px] h-[22px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[136px] -left-[3px] w-[3px] h-[38px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[188px] -left-[3px] w-[3px] h-[38px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[146px] -right-[3px] w-[3px] h-[58px] hardware-btn rounded-r-md z-0 scale-x-[-1]" aria-hidden="true" />

                  {/* Inner OLED Display */}
                  <div className="absolute inset-[6px] bg-[#050914] rounded-[2.4rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-white z-10 flex flex-col justify-between p-4 pt-10">
                    <div className="absolute inset-0 screen-glare z-40 pointer-events-none" aria-hidden="true" />

                    {/* Dynamic Island Pill */}
                    <div className="absolute top-[7px] left-1/2 -translate-x-1/2 w-[100px] h-[24px] bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.15)]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[9px] text-cyan-400 font-bold font-mono">OPD</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.9)] animate-pulse" />
                    </div>

                    {/* Top App Header */}
                    <div className="phone-widget-item flex justify-between items-center px-1">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-blue-300/70 uppercase tracking-widest font-bold">Aura Med•OS</span>
                        <span className="text-base font-bold tracking-tight text-white">Live OPD Queue</span>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-blue-600/30 text-cyan-300 flex items-center justify-center font-bold text-[11px] border border-blue-400/30 shadow-md">
                        AN
                      </div>
                    </div>

                    {/* Circular Animated Progress Ring with Counter */}
                    <div className="phone-widget-item relative w-36 h-36 mx-auto flex items-center justify-center my-1 drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)]">
                      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                        <circle cx="72" cy="72" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
                        <circle className="progress-ring" cx="72" cy="72" r="54" fill="none" stroke="#3B82F6" strokeWidth="9" />
                      </svg>
                      <div className="text-center z-10 flex flex-col items-center">
                        <span className="counter-val-num text-3xl font-extrabold tracking-tighter text-white">
                          {metricValue}
                        </span>
                        <span className="text-[8px] text-blue-200/70 uppercase tracking-[0.12em] font-bold mt-0.5">
                          {metricLabel}
                        </span>
                      </div>
                    </div>

                    {/* Telemetry Widgets Inside Screen */}
                    <div className="space-y-2">
                      <div className="phone-widget-item widget-depth rounded-xl p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/20">
                            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-white">Token TK-014</div>
                            <div className="text-[8px] text-emerald-400 font-medium">In Chamber • Room 102</div>
                          </div>
                        </div>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                          LIVE
                        </span>
                      </div>

                      <div className="phone-widget-item widget-depth rounded-xl p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-white">Wait Estimation</div>
                            <div className="text-[8px] text-slate-400 font-medium">Under 9 mins predicted</div>
                          </div>
                        </div>
                        <span className="text-[9px] text-emerald-300 font-bold font-mono">
                          99.4%
                        </span>
                      </div>
                    </div>

                    {/* Bottom Home Indicator */}
                    <div className="w-20 h-1 bg-white/25 rounded-full mx-auto mt-1" />
                  </div>
                </div>

                {/* Floating Glass Badge Left */}
                <div className="floating-badge-item absolute top-8 -left-5 sm:-left-10 floating-ui-badge rounded-xl p-2 sm:p-2.5 flex items-center gap-2 z-30 shadow-lg pointer-events-none">
                  <div className="w-7 h-7 rounded-full bg-blue-500/25 flex items-center justify-center border border-blue-400/40 text-xs">
                    ⚡
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-bold tracking-tight">Zero Waiting Line</p>
                    <p className="text-blue-200/70 text-[9px]">SMS Queue Notification</p>
                  </div>
                </div>

                {/* Floating Glass Badge Right */}
                <div className="floating-badge-item absolute bottom-12 -right-5 sm:-right-10 floating-ui-badge rounded-xl p-2 sm:p-2.5 flex items-center gap-2 z-30 shadow-lg pointer-events-none">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/25 flex items-center justify-center border border-emerald-400/40 text-xs">
                    🏥
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-bold tracking-tight">Chamber Telemetry</p>
                    <p className="text-emerald-300/70 text-[9px]">Sub-second Doctor Sync</p>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: BRAND & MOBILE DOWNLOAD (4 cols) */}
            <div className="card-brand-right lg:col-span-4 flex flex-col justify-center items-center lg:items-end text-center lg:text-right space-y-4">
              <span className="text-xs uppercase font-mono tracking-widest text-blue-300/80">
                Clinical Precision OS
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-card-silver-matte leading-none">
                {brandName}
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                {ctaDescription}
              </p>

              {/* Mobile App Download Badges */}
              <div className="pt-2 flex flex-row gap-2.5">
                <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-left flex items-center gap-2 shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 384 512" aria-hidden="true">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                  <div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">iOS</div>
                    <div className="text-[11px] font-bold text-white">App Store</div>
                  </div>
                </div>

                <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-left flex items-center gap-2 shadow-sm">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                  </svg>
                  <div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Android</div>
                    <div className="text-[11px] font-bold text-white">Google Play</div>
                  </div>
                </div>
              </div>

              {/* Replay 3D Intro Button */}
              <button
                onClick={handleReplay}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer pt-2"
                title="Replay 3D Entrance Sequence"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay 3D Sequence</span>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

export default CinematicHero;
