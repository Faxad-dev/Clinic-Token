'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from 'framer-motion';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_MAGNIFICATION = 72;
const DEFAULT_DISTANCE = 140;
const DEFAULT_PANEL_HEIGHT = 56;

type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};
type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  id?: string;
  key?: React.Key;
  role?: string;
  tabIndex?: number;
  'aria-label'?: string;
};
type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};
type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DocContextType = {
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};
type DockProviderProps = {
  children: React.ReactNode;
  value: DocContextType;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within an DockProvider');
  }
  return context;
}

type DockItemContextType = {
  width: MotionValue<number>;
  isHovered: MotionValue<number>;
};

const DockItemContext = createContext<DockItemContextType | undefined>(undefined);

function useDockItem() {
  return useContext(DockItemContext);
}

function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(() => {
    return Math.max(panelHeight, magnification + 8);
  }, [panelHeight, magnification]);

  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{
        height: height,
      }}
      className='flex max-w-full items-center justify-center overflow-visible'
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={cn(
          'mx-auto flex w-fit items-center gap-2 sm:gap-2.5 rounded-full bg-[#141518]/95 border border-white/10 shadow-2xl px-2.5 sm:px-3 backdrop-blur-xl',
          className
        )}
        style={{ height: panelHeight }}
        role='toolbar'
        aria-label='Application dock'
      >
        <DockProvider value={{ mouseX, spring, distance, magnification }}>
          {children}
        </DockProvider>
      </motion.div>
    </motion.div>
  );
}

function DockItem({
  children,
  className,
  onClick,
  id,
  role = 'button',
  tabIndex = 0,
  'aria-label': ariaLabel,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { distance, magnification, mouseX, spring } = useDock();

  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val: number) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return Number(val) - domRect.x - domRect.width / 2;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [38, magnification, 38]
  );

  const width = useSpring(widthTransform, spring);

  return (
    <motion.div
      ref={ref}
      id={id}
      style={{ width }}
      onClick={onClick}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cn(
        'relative inline-flex items-center justify-center cursor-pointer select-none',
        className
      )}
      tabIndex={tabIndex}
      role={role}
      aria-label={ariaLabel}
      aria-haspopup='true'
    >
      <DockItemContext.Provider value={{ width, isHovered }}>
        {children}
      </DockItemContext.Provider>
    </motion.div>
  );
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const dockItem = useDockItem();
  const isHovered = (restProps['isHovered'] as MotionValue<number> | undefined) ?? dockItem?.isHovered;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    if (isHovered.get() === 1) {
      setIsVisible(true);
    }
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.9 }}
          animate={{ opacity: 1, y: -16, scale: 1 }}
          exit={{ opacity: 0, y: 0, scale: 0.9 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={cn(
            'absolute -top-7 left-1/2 -translate-x-1/2 w-fit whitespace-pre rounded-md border border-neutral-700/80 bg-[#1c1d22]/98 px-2.5 py-0.5 text-[11px] font-medium text-slate-100 shadow-xl backdrop-blur-md pointer-events-none z-50',
            className
          )}
          role='tooltip'
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const dockItem = useDockItem();
  const widthProp = (restProps['width'] as MotionValue<number> | undefined) ?? dockItem?.width;
  const defaultWidth = useMotionValue(38);
  const activeWidth = widthProp ?? defaultWidth;

  const widthTransform = useTransform(activeWidth, (val: number) => (val ? Number(val) / 2 : 19));

  return (
    <motion.div
      style={{ width: widthTransform }}
      className={cn('flex items-center justify-center pointer-events-none', className)}
    >
      {children}
    </motion.div>
  );
}

export { Dock, DockIcon, DockItem, DockLabel };
