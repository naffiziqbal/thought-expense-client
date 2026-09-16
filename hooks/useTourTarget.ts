'use client';

import { useCallback, useEffect, useRef } from 'react';
import { TOUR_STEPS } from '@/lib/tourSteps';
import { useOnboardingStore } from '@/store/onboardingStore';

/**
 * Marks a live element as spotlightable by the tour:
 *
 *   const total = useTourTarget(TOUR_TARGETS.homeTotal);
 *   <div ref={total}>…</div>
 *
 * Rects are viewport-relative, which is what the fixed-position overlay wants.
 */
export function useTourTarget<T extends HTMLElement = HTMLDivElement>(id: string) {
  const ref = useRef<T | null>(null);
  const isActive = useOnboardingStore((s) => s.isActive);
  const stepId = useOnboardingStore((s) => (s.isActive ? TOUR_STEPS[s.stepIndex]?.id : undefined));

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    if (!box.width || !box.height) return;
    useOnboardingStore
      .getState()
      .setTargetRect(id, { x: box.left, y: box.top, width: box.width, height: box.height });
  }, [id]);

  useEffect(() => {
    if (!isActive) return;

    // The element may have only just mounted (after a route change), or shifted
    // as data loaded in above it, so sample a few times rather than one frame.
    const timers = [0, 120, 350, 700].map((delay) => window.setTimeout(measure, delay));
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [isActive, stepId, measure]);

  return ref;
}
