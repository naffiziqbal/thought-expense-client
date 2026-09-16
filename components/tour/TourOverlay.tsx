'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TOUR_STEPS } from '@/lib/tourSteps';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore, type TourRect } from '@/store/onboardingStore';
import { Mascot } from './Mascot';

const HOLE_PADDING = 10;
/** Used before the bubble has measured itself, to pick a side without a flash. */
const ESTIMATED_BLOCK_HEIGHT = 200;

function inflate(rect: TourRect, by: number): TourRect {
  return { x: rect.x - by, y: rect.y - by, width: rect.width + by * 2, height: rect.height + by * 2 };
}

/**
 * The guided tour. Mounted once in the dashboard shell so it can dim the nav
 * it points at. Clicking anywhere advances — the tour drives its own
 * navigation rather than asking the user to hit a specific element.
 */
export function TourOverlay() {
  const router = useRouter();
  const pathname = usePathname();

  const userId = useAuthStore((s) => s.user?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isActive = useOnboardingStore((s) => s.isActive);
  const stepIndex = useOnboardingStore((s) => s.stepIndex);
  const targets = useOnboardingStore((s) => s.targets);
  const needsTour = useOnboardingStore((s) => s.needsTour);
  const start = useOnboardingStore((s) => s.start);
  const next = useOnboardingStore((s) => s.next);
  const finish = useOnboardingStore((s) => s.finish);

  const blockRef = useRef<HTMLDivElement | null>(null);
  const [blockHeight, setBlockHeight] = useState(ESTIMATED_BLOCK_HEIGHT);
  const [viewport, setViewport] = useState({ width: 1024, height: 768 });

  const step = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    if (isActive || !needsTour(userId)) return;
    start();
  }, [isActive, isAuthenticated, needsTour, start, userId]);

  useEffect(() => {
    const read = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  // Each step owns its page: move there before spotlighting anything on it.
  useEffect(() => {
    if (!isActive || !step?.route) return;
    if (pathname === step.route) return;
    router.push(step.route);
  }, [isActive, pathname, router, step?.route]);

  useLayoutEffect(() => {
    const measured = blockRef.current?.offsetHeight;
    if (measured && Math.abs(measured - blockHeight) > 2) setBlockHeight(measured);
  }, [blockHeight, stepIndex, isActive]);

  const complete = useCallback(() => {
    finish(userId);
    router.push('/dashboard/add');
  }, [finish, router, userId]);

  const advance = useCallback(() => {
    if (isLast) complete();
    else next();
  }, [complete, isLast, next]);

  if (!isActive || !step) return null;

  const rect = step.target ? targets[step.target] : undefined;
  const hole = rect ? inflate(rect, HOLE_PADDING) : null;

  // Below the spotlight when there's room, otherwise above it.
  let blockTop: number;
  if (!hole) {
    blockTop = Math.max(24, (viewport.height - blockHeight) / 2);
  } else {
    const below = hole.y + hole.height + 16;
    blockTop = below + blockHeight < viewport.height - 16 ? below : Math.max(16, hole.y - blockHeight - 16);
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Click-catcher plus the dim. When a target exists the dim is painted by
          the spotlight's huge box-shadow, giving a perfect rounded cut-out. */}
      <button
        type="button"
        aria-label="Next step"
        onClick={advance}
        className={`absolute inset-0 h-full w-full cursor-pointer ${hole ? '' : 'bg-[rgba(6,18,24,0.78)]'}`}
      />

      {hole ? (
        <div
          className="pointer-events-none absolute rounded-[18px] border-2 border-[#2DD4BF] transition-all duration-300 ease-out"
          style={{
            top: hole.y,
            left: hole.x,
            width: hole.width,
            height: hole.height,
            boxShadow: '0 0 0 9999px rgba(6,18,24,0.78)',
          }}
        />
      ) : null}

      <button
        type="button"
        onClick={() => finish(userId)}
        className="absolute right-4 top-4 rounded-full px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
      >
        Skip tour
      </button>

      <div
        ref={blockRef}
        key={step.id}
        className="tour-bubble-enter pointer-events-none absolute left-4 right-4 flex items-end gap-1 sm:left-1/2 sm:right-auto sm:w-[520px] sm:-translate-x-1/2"
        style={{ top: blockTop }}
      >
        <Mascot size={74} poseKey={stepIndex} />

        <div className="pointer-events-auto relative flex-1 rounded-2xl bg-token-card p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
          {/* Little pointer from the bubble back toward Penny. */}
          <div className="absolute -left-[7px] bottom-6 h-0 w-0 border-y-8 border-r-8 border-y-transparent border-r-[var(--background-card)]" />

          <h3 className="text-lg font-bold text-token-primary">{step.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-token-secondary">{step.body}</p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex shrink items-center gap-1">
              {TOUR_STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIndex ? 'w-4 bg-[var(--accent-primary)]' : 'w-1.5 bg-[var(--border-default)]'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={advance}
              className="shrink-0 rounded-full bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {step.cta ?? (isLast ? 'Finish' : 'Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
