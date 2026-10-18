import { createElement } from 'react';
import { getCategoryBgColor, getCategoryChartColor } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/categoryIcons';

const SIZE_PX = { sm: 36, md: 40, lg: 44 } as const;

type Size = keyof typeof SIZE_PX | number;

/** Category icon well — always `rounded-icon` (13px), never mixed circles/squircles. */
export function CategoryIconBubble({
  category,
  size = 'md',
  className = '',
}: {
  category: string;
  size?: Size;
  className?: string;
}) {
  const px = typeof size === 'number' ? size : SIZE_PX[size];
  const iconPx = px <= 36 ? 16 : 20;

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-icon ${className}`}
      style={{ width: px, height: px, backgroundColor: getCategoryBgColor(category) }}
    >
      {/* createElement: the icon is a static component picked from a lookup table. */}
      {createElement(getCategoryIcon(category), {
        width: iconPx,
        height: iconPx,
        className: 'shrink-0',
        style: { color: getCategoryChartColor(category) },
        'aria-hidden': true,
      })}
    </div>
  );
}
