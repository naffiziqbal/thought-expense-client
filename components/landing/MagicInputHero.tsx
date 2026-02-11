'use client';

import { useState, useEffect } from 'react';

const TYPING_PHRASES = [
  'Groceries 500, Uber 200',
  'Coffee 15, Rent 5000',
  'Lunch 45, Netflix 15',
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
};

export function MagicInputHero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visibleText, setVisibleText] = useState('');
  const [tagsVisible, setTagsVisible] = useState(false);
  const [phase, setPhase] = useState<'typing' | 'showing' | 'clearing'>('typing');

  const fullPhrase = TYPING_PHRASES[phraseIndex];
  const tags = TAGS_BY_PHRASE[fullPhrase] || [];

  useEffect(() => {
    if (phase === 'typing') {
      if (visibleText.length < fullPhrase.length) {
        const t = setTimeout(() => {
          setVisibleText(fullPhrase.slice(0, visibleText.length + 1));
        }, 50);
        return () => clearTimeout(t);
      }
      setTagsVisible(true);
      setPhase('showing');
      const t = setTimeout(() => setPhase('clearing'), 2500);
      return () => clearTimeout(t);
    }
    if (phase === 'clearing') {
      setTagsVisible(false);
      setVisibleText('');
      const nextIndex = (phraseIndex + 1) % TYPING_PHRASES.length;
      const t = setTimeout(() => {
        setPhraseIndex(nextIndex);
        setPhase('typing');
      }, 400);
      return () => clearTimeout(t);
    }
  }, [phase, visibleText, fullPhrase, phraseIndex]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-[24px] border border-gray-200 bg-white p-2 shadow-lg">
        <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xl">
            ✏️
          </div>
          <div className="min-h-[2.5rem] flex-1 py-2 text-lg text-gray-700">
            {visibleText}
            <span className="animate-pulse">|</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {tagsVisible &&
          tags.map((tag, i) => (
            <span
              key={tag.label}
              className="animate-in flex items-center gap-1.5 rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700"
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
