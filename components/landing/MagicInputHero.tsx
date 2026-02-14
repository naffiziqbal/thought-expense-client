'use client';

import { useState, useEffect, useRef } from 'react';

const TYPING_PHRASES = [
  'Groceries 500, Uber 200',
  'Coffee 15, Rent 5000',
  'Lunch 45, Netflix 15',
  'Electricity 80, Dinner 65',
  'Petrol 50, Gym 30',
  'Books 120, Movie 25',
];

const TAGS_BY_PHRASE: Record<string, { label: string; emoji: string; category: string }[]> = {
  'Groceries 500, Uber 200': [
    { label: 'Groceries', emoji: '🛒', category: 'Food' },
    { label: 'Uber', emoji: '🚕', category: 'Transport' },
  ],
  'Coffee 15, Rent 5000': [
    { label: 'Coffee', emoji: '☕', category: 'Food' },
    { label: 'Rent', emoji: '🏠', category: 'Housing' },
  ],
  'Lunch 45, Netflix 15': [
    { label: 'Lunch', emoji: '🍔', category: 'Food' },
    { label: 'Netflix', emoji: '🎬', category: 'Entertainment' },
  ],
  'Electricity 80, Dinner 65': [
    { label: 'Electricity', emoji: '💡', category: 'Utilities' },
    { label: 'Dinner', emoji: '🍽️', category: 'Food' },
  ],
  'Petrol 50, Gym 30': [
    { label: 'Petrol', emoji: '⛽', category: 'Transport' },
    { label: 'Gym', emoji: '💪', category: 'Health' },
  ],
  'Books 120, Movie 25': [
    { label: 'Books', emoji: '📚', category: 'Education' },
    { label: 'Movie', emoji: '🎬', category: 'Entertainment' },
  ],
};

export function MagicInputHero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visibleText, setVisibleText] = useState('');
  const [tagsVisible, setTagsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charIndexRef = useRef(0);

  const fullPhrase = TYPING_PHRASES[phraseIndex];
  const tags = TAGS_BY_PHRASE[fullPhrase] || [];

  useEffect(() => {
    charIndexRef.current = 0;

    const typeNext = () => {
      const idx = charIndexRef.current;
      if (idx < fullPhrase.length) {
        setVisibleText(fullPhrase.slice(0, idx + 1));
        charIndexRef.current = idx + 1;
        timerRef.current = setTimeout(typeNext, 50);
      } else {
        setTagsVisible(true);
        timerRef.current = setTimeout(() => {
          setTagsVisible(false);
          setVisibleText('');
          setPhraseIndex((i) => (i + 1) % TYPING_PHRASES.length);
        }, 2500);
      }
    };

    timerRef.current = setTimeout(typeNext, 100);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phraseIndex, fullPhrase]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-[24px] border border-token bg-token-card p-2 shadow-lg">
        <div className="flex items-center gap-3 rounded-2xl bg-[var(--background-tag)] px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950/50 text-xl">
            ✏️
          </div>
          <div className="min-h-[2.5rem] flex-1 py-2 text-lg text-token-primary">
            {visibleText}
            <span className="animate-cursor-blink text-token-accent" aria-hidden>|</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {tagsVisible &&
          tags.map((tag, i) => (
            <span
              key={tag.label}
              className="animate-in flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/50 px-4 py-2 text-sm font-medium text-teal-700 dark:text-teal-300"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <span>{tag.emoji}</span>
              <span>{tag.label}: {tag.category}</span>
            </span>
          ))}
      </div>
    </div>
  );
}
