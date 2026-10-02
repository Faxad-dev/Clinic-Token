import React, { useEffect, useRef, ReactNode } from 'react';

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'cyan' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean; // When true, ignores size prop and uses width/height or className
  backdrop?: string;
  backupBorder?: string;
  spotlightSize?: number;
}

const glowColorMap = {
  blue: { base: 215, spread: 180 },
  cyan: { base: 190, spread: 160 },
  purple: { base: 280, spread: 260 },
  green: { base: 140, spread: 180 },
  emerald: { base: 155, spread: 170 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 }
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false,
  backdrop = 'rgba(15, 23, 42, 0.75)',
  backupBorder = 'rgba(51, 65, 85, 0.6)',
  spotlightSize = 350,
  style,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;
      
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--xp', (x / (window.innerWidth || 1)).toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
        cardRef.current.style.setProperty('--yp', (y / (window.innerHeight || 1)).toFixed(2));
      }
    };

    document.addEventListener('pointermove', syncPointer, { passive: true });
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor] || glowColorMap.blue;

  // Determine sizing
  const getSizeClasses = () => {
    if (customSize) {
      return ''; // Let className or inline styles handle sizing
    }
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    const baseStyles: React.CSSProperties & Record<string, string | number | undefined> = {
      '--base': base,
      '--spread': spread,
      '--radius': '24',
      '--border': '1.5',
      '--backdrop': backdrop,
      '--backup-border': backupBorder,
      '--size': spotlightSize,
      '--outer': '1',
      '--border-size': 'calc(var(--border, 1.5) * 1px)',
      '--spotlight-size': 'calc(var(--size, 350) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.12)), transparent
      )`,
      backgroundColor: 'var(--backdrop, transparent)',
      backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
      backgroundPosition: '50% 50%',
      backgroundAttachment: 'fixed',
      border: 'var(--border-size) solid var(--backup-border)',
      position: 'relative' as const,
      touchAction: 'pan-y' as const,
      ...style,
    };

    // Add width and height if provided
    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles;
  };

  const beforeAfterStyles = `
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size, 1.5px) * -1);
      border: var(--border-size, 1.5px) solid transparent;
      border-radius: calc(var(--radius, 24) * 1px);
      background-attachment: fixed;
      background-size: calc(100% + (2 * var(--border-size, 1.5px))) calc(100% + (2 * var(--border-size, 1.5px)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
    }
    
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size, 350px) * 0.75) calc(var(--spotlight-size, 350px) * 0.75) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 55) * 1%) / var(--border-spot-opacity, 0.9)), transparent 100%
      );
      filter: brightness(1.6);
    }
    
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size, 350px) * 0.45) calc(var(--spotlight-size, 350px) * 0.45) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 100% 100% / var(--border-light-opacity, 0.6)), transparent 100%
      );
    }
    
    [data-glow] > [data-glow-inner] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: calc(var(--radius, 24) * 1px);
      border-width: calc(var(--border-size, 1.5px) * 20);
      filter: blur(calc(var(--border-size, 1.5px) * 10));
      background: none;
      pointer-events: none;
      border: none;
    }
    
    [data-glow] > [data-glow-inner]::before {
      inset: -10px;
      border-width: 10px;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles()}
        className={`
          ${getSizeClasses()}
          ${!customSize ? 'aspect-[3/4] grid grid-rows-[1fr_auto]' : ''}
          rounded-3xl 
          relative 
          shadow-[0_8px_30px_rgb(0,0,0,0.15)]
          backdrop-blur-[12px]
          transition-all
          duration-300
          ${className}
        `}
        {...props}
      >
        <div ref={innerRef} data-glow-inner></div>
        {children}
      </div>
    </>
  );
};

export { GlowCard };
export default GlowCard;
