import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useOutsideClick } from '../hooks/use-outside-click';
import { X, ArrowRight, Activity, Sparkles, ChevronRight } from 'lucide-react';

export interface BentoGridItem {
  id: string | number;
  title: string;
  subtitle: string;
  description: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  colorTheme: 'teal' | 'sky' | 'indigo' | 'rose' | 'emerald' | 'amber' | 'violet';
  actionLabel?: string;
  onAction?: () => void;
}

export interface BentoGridProps {
  items: BentoGridItem[];
  onStartAssessment?: () => void;
}

export default function ExpandableBentoGrid({ items, onStartAssessment }: BentoGridProps) {
  const [active, setActive] = useState<BentoGridItem | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  // Theme-specific CSS classes
  const themeClasses = {
    teal: {
      border: 'hover:border-teal-300 hover:shadow-teal-600/5',
      bgGradient: 'from-teal-50/50 via-white to-white',
      iconBg: 'bg-teal-50 border-teal-200 text-teal-600',
      pill: 'bg-teal-50/80 text-teal-700 border-teal-100',
      gradient: 'from-teal-500/10 via-teal-50/50 to-transparent',
      text: 'text-teal-700',
    },
    sky: {
      border: 'hover:border-sky-300 hover:shadow-sky-600/5',
      bgGradient: 'from-sky-50/50 via-white to-white',
      iconBg: 'bg-sky-50 border-sky-200 text-sky-600',
      pill: 'bg-sky-50/80 text-sky-700 border-sky-100',
      gradient: 'from-sky-500/10 via-sky-50/50 to-transparent',
      text: 'text-sky-700',
    },
    indigo: {
      border: 'hover:border-indigo-300 hover:shadow-indigo-600/5',
      bgGradient: 'from-indigo-50/50 via-white to-white',
      iconBg: 'bg-indigo-50 border-indigo-200 text-indigo-600',
      pill: 'bg-indigo-50/80 text-indigo-700 border-indigo-100',
      gradient: 'from-indigo-500/10 via-indigo-50/50 to-transparent',
      text: 'text-indigo-700',
    },
    rose: {
      border: 'hover:border-rose-300 hover:shadow-rose-600/5',
      bgGradient: 'from-rose-50/50 via-white to-white',
      iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
      pill: 'bg-rose-50/80 text-rose-700 border-rose-100',
      gradient: 'from-rose-500/10 via-rose-50/50 to-transparent',
      text: 'text-rose-700',
    },
    emerald: {
      border: 'hover:border-emerald-300 hover:shadow-emerald-600/5',
      bgGradient: 'from-emerald-50/50 via-white to-white',
      iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      pill: 'bg-emerald-50/80 text-emerald-700 border-emerald-100',
      gradient: 'from-emerald-500/10 via-emerald-50/50 to-transparent',
      text: 'text-emerald-700',
    },
    amber: {
      border: 'hover:border-amber-300 hover:shadow-amber-600/5',
      bgGradient: 'from-amber-50/50 via-white to-white',
      iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
      pill: 'bg-amber-50/80 text-amber-700 border-amber-100',
      gradient: 'from-amber-500/10 via-amber-50/50 to-transparent',
      text: 'text-amber-700',
    },
    violet: {
      border: 'hover:border-violet-300 hover:shadow-violet-600/5',
      bgGradient: 'from-violet-50/50 via-white to-white',
      iconBg: 'bg-violet-50 border-violet-200 text-violet-600',
      pill: 'bg-violet-50/80 text-violet-700 border-violet-100',
      gradient: 'from-violet-500/10 via-violet-50/50 to-transparent',
      text: 'text-violet-700',
    },
  };

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm h-full w-full z-[10000]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[10001] p-4 sm:p-6 overflow-y-auto">
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col relative my-8"
              style={{ maxHeight: 'calc(100vh - 4rem)' }}
            >
              {/* Close Button */}
              <button
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full border border-slate-200/60 shadow-sm transition-all"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Decorative Header Canvas */}
              <div className={`w-full h-32 md:h-40 bg-gradient-to-br ${themeClasses[active.colorTheme].gradient} relative flex items-end p-6 md:p-8`}>
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-md ${themeClasses[active.colorTheme].iconBg} transform translate-y-2`}>
                  <div className="scale-110">{active.icon}</div>
                </div>
              </div>

              {/* Card Main Body */}
              <div className="p-6 md:p-8 pt-10 flex-grow overflow-y-auto">
                <div className="mb-6 text-left">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${themeClasses[active.colorTheme].pill}`}>
                    {active.subtitle}
                  </span>
                  <motion.h3
                    layoutId={`title-${active.title}-${id}`}
                    className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight"
                  >
                    {active.title}
                  </motion.h3>
                  <motion.p
                    layoutId={`description-${active.title}-${id}`}
                    className="text-slate-600 font-medium mt-2.5 text-sm md:text-base leading-relaxed"
                  >
                    {active.description}
                  </motion.p>
                </div>

                {/* Sub-clinical / Scientific Content */}
                <div className="border-t border-slate-150 pt-5 text-left text-slate-600 text-sm md:text-base leading-relaxed">
                  {active.content}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <span className="text-xs text-slate-500 font-medium text-left">
                  Clinical Triage Tool • Private & Secure
                </span>
                <div className="flex gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => setActive(null)}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                  {onStartAssessment && (
                    <button
                      onClick={() => {
                        setActive(null);
                        onStartAssessment();
                      }}
                      className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10 hover:shadow-lg hover:shadow-teal-600/20 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Start Assessment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        {items.map((item) => {
          const t = themeClasses[item.colorTheme];
          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActive(item);
            }
          };
          return (
            <motion.div
              layoutId={`card-${item.title}-${id}`}
              key={item.id}
              onClick={() => setActive(item)}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="button"
              aria-expanded={active?.id === item.id}
              aria-haspopup="dialog"
              className={`bg-gradient-to-br ${t.bgGradient} p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm ${t.border} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-left cursor-pointer flex flex-col relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/50 ${item.className || ''}`}
            >
              {/* Top Accent Gradient Canvas */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.colorTheme === 'teal' ? 'from-teal-500 to-emerald-400' : item.colorTheme === 'sky' ? 'from-sky-500 to-blue-400' : item.colorTheme === 'indigo' ? 'from-indigo-500 to-violet-400' : item.colorTheme === 'rose' ? 'from-rose-500 to-pink-400' : item.colorTheme === 'emerald' ? 'from-emerald-500 to-teal-400' : item.colorTheme === 'amber' ? 'from-amber-500 to-orange-400' : 'from-violet-500 to-fuchsia-400'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Icon Container */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${t.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                {item.icon}
              </div>

              {/* Subtitle */}
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border w-fit mb-3 ${t.pill}`}>
                {item.subtitle}
              </span>

              {/* Title */}
              <motion.h3
                layoutId={`title-${item.title}-${id}`}
                className="text-lg md:text-xl font-extrabold text-slate-900 mb-2.5 group-hover:text-slate-950 transition-colors"
              >
                {item.title}
              </motion.h3>

              {/* Description */}
              <motion.p
                layoutId={`description-${item.title}-${id}`}
                className="text-slate-600 text-sm leading-relaxed font-normal mb-6 flex-grow"
              >
                {item.description}
              </motion.p>

              {/* Read More Link */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className={`text-xs font-semibold ${t.text}`}>Interactive Details</span>
                <div className={`flex items-center gap-1 text-xs font-bold ${t.text} opacity-80 group-hover:opacity-100 transition-opacity`}>
                  <span>Tap to expand</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
