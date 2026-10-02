// component.tsx
'use client';
import React, { useRef, forwardRef } from 'react';
import { ReactLenis } from 'lenis/react';
import { useTransform, motion, useScroll, MotionValue } from 'motion/react';
import { cn } from '@/lib/utils';

export interface ProjectData {
  title: string;
  description: string;
  link: string;
  color: string;
}

export interface CardProps {
  i: number;
  title: string;
  description: string;
  url: string;
  color: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

export const Card = ({
  i,
  title,
  description,
  url,
  color,
  progress,
  range,
  targetScale,
}: CardProps) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="min-h-[500px] sm:h-screen flex items-center justify-center sticky top-0 py-4 sm:py-0"
    >
      <motion.div
        style={{
          backgroundColor: color,
          scale,
          top: `calc(-2vh + ${i * 20}px)`,
        }}
        className={cn(
          "flex flex-col relative sm:-top-[20%] min-h-[400px] sm:h-[450px] w-[92%] sm:w-[70%] rounded-2xl sm:rounded-md p-5 sm:p-10 origin-top shadow-2xl text-white border border-white/10"
        )}
      >
        <h2 className="text-xl sm:text-2xl text-center font-semibold tracking-tight">{title}</h2>
        <div className="flex flex-col sm:flex-row h-full mt-4 sm:mt-5 gap-4 sm:gap-10 justify-between">
          <div className="w-full sm:w-[40%] relative top-0 sm:top-[10%] flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">{description}</p>
            <span className="flex items-center gap-2 pt-3">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="underline cursor-pointer text-xs sm:text-sm font-medium hover:text-white"
              >
                See more
              </a>
              <svg
                width="22"
                height="12"
                viewBox="0 0 22 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block"
              >
                <path
                  d="M21.5303 6.53033C21.8232 6.23744 21.8232 5.76256 21.5303 5.46967L16.7574 0.696699C16.4645 0.403806 15.9896 0.403806 15.6967 0.696699C15.4038 0.989592 15.4038 1.46447 15.6967 1.75736L19.9393 6L15.6967 10.2426C15.4038 10.5355 15.4038 11.0104 15.6967 11.3033C15.9896 11.5962 16.4645 11.5962 16.7574 11.3033L21.5303 6.53033ZM0 6.75L21 6.75V5.25L0 5.25L0 6.75Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </div>

          <div
            className="relative w-full sm:w-[60%] h-44 sm:h-full rounded-xl overflow-hidden shrink-0 shadow-md"
          >
            <motion.div
              className="w-full h-full"
              style={{ scale: imageScale }}
            >
              <img src={url} alt={title} className="absolute inset-0 w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export interface ComponentRootProps {
  projects: ProjectData[];
}

const Component = forwardRef<HTMLElement, ComponentRootProps>(({ projects }, ref) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <ReactLenis root>
      <main className="bg-black" ref={container}>
        <section className="text-white h-[60vh] sm:h-[70vh] w-full bg-slate-950 grid place-content-center relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

          <h1 className="text-3xl sm:text-5xl 2xl:text-7xl px-6 sm:px-8 font-semibold text-center tracking-tight leading-[120%] relative z-10">
            Stacking Cards Using <br /> Motion. Scroll down! 👇
          </h1>
        </section>

        <section className="text-white w-full bg-slate-950">
          {projects.map((project, i) => {
            const targetScale = 1 - (projects.length - i) * 0.05;
            return (
              <Card
                key={`p_${i}`}
                i={i}
                url={project.link}
                title={project.title}
                color={project.color}
                description={project.description}
                progress={scrollYProgress}
                range={[i * (1 / projects.length), 1]}
                targetScale={targetScale}
              />
            );
          })}
        </section>

        <footer className="group bg-slate-950">
          <h1 className="text-[16vw] translate-y-20 leading-[100%] uppercase font-semibold text-center bg-gradient-to-r from-gray-400 to-gray-800 bg-clip-text text-transparent transition-all ease-linear">
            ui-layout
          </h1>
          <div className="bg-black h-40 relative z-10 grid place-content-center text-2xl rounded-tr-full rounded-tl-full"></div>
        </footer>
      </main>
    </ReactLenis>
  );
});

Component.displayName = 'Component';

export default Component;
