import React, { useState, useRef, useEffect, Children } from 'react';
import { cn } from '@/lib/utils';

export interface MobileSliderProps {
  children: React.ReactNode;
  /**
   * Tailwind classes used to render the grid on desktop (md and above).
   * E.g. "md:grid-cols-2 lg:grid-cols-3 gap-6"
   */
  desktopGridClassName?: string;
  className?: string;
  /**
   * Mobile item width class. Defaults to ~84vw with next card peek.
   * E.g. "w-[84vw] xs:w-[86vw] max-w-[340px]" or "w-[42vw] max-w-[190px]"
   */
  cardWidthClassName?: string;
  /**
   * Mobile container horizontal padding for snap alignment. Defaults to "px-4 -mx-4".
   */
  containerPaddingClassName?: string;
  showDots?: boolean;
  dotActiveColor?: string;
  dotInactiveColor?: string;
}

export const MobileSlider: React.FC<MobileSliderProps> = ({
  children,
  desktopGridClassName = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  className,
  cardWidthClassName = 'w-[84vw] xs:w-[86vw] max-w-[340px]',
  containerPaddingClassName = 'px-4 -mx-4',
  showDots = true,
  dotActiveColor = 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]',
  dotInactiveColor = 'bg-slate-600/50 hover:bg-slate-500',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const validChildren = Children.toArray(children).filter(Boolean);
  const totalItems = validChildren.length;

  // Track active slide on scroll using position comparison
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;

    let closestIndex = 0;
    let minDiff = Infinity;

    itemRefs.current.forEach((el, idx) => {
      if (!el) return;
      const itemOffset = el.offsetLeft - container.offsetLeft;
      const diff = Math.abs(itemOffset - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    setActiveIndex(closestIndex);
  };

  const scrollToItem = (index: number) => {
    const el = itemRefs.current[index];
    if (el && scrollRef.current) {
      const container = scrollRef.current;
      const left = el.offsetLeft - container.offsetLeft;
      container.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
      setActiveIndex(index);
    }
  };

  // Keep itemRefs array size in sync
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, totalItems);
  }, [totalItems]);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Mobile Slider (< md): CSS Scroll-Snap Horizontal Reel */}
      <div className="md:hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            'flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain no-scrollbar gap-3.5 py-4 -my-4 scroll-smooth',
            containerPaddingClassName
          )}
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {validChildren.map((child, index) => (
            <div
              key={index}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={cn(
                'shrink-0 snap-start transition-opacity duration-300',
                cardWidthClassName
              )}
            >
              {child}
            </div>
          ))}
        </div>

        {/* Tappable Pill Dot Indicators */}
        {showDots && totalItems > 1 && (
          <div
            className="flex items-center justify-center gap-1.5 pt-3.5 pb-1"
            role="tablist"
            aria-label="Carousel pagination"
          >
            {validChildren.map((_, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => scrollToItem(index)}
                  className="min-h-[36px] min-w-[28px] flex items-center justify-center py-1 cursor-pointer transition-transform active:scale-95"
                  aria-label={`Go to slide ${index + 1} of ${totalItems}`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <span
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      isActive
                        ? cn('w-7', dotActiveColor)
                        : cn('w-2', dotInactiveColor)
                    )}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Layout (md and above): Exact standard responsive grid */}
      <div className={cn('hidden md:grid', desktopGridClassName)}>
        {validChildren}
      </div>
    </div>
  );
};

export default MobileSlider;
