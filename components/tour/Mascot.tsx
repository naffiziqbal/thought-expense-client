'use client';

/**
 * Penny — the guide for the in-app tour. Drawn in SVG rather than shipped as
 * an asset so she inherits the brand teal and stays crisp at any size.
 */
export function Mascot({ size = 74, poseKey = 0 }: { size?: number; poseKey?: number }) {
  return (
    <div
      key={poseKey}
      className="tour-mascot shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="pennyBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2DD4BF" />
            <stop offset="1" stopColor="#0E9488" />
          </linearGradient>
        </defs>

        {/* Ground shadow anchors her to the screen */}
        <ellipse cx="50" cy="93" rx="25" ry="4.5" fill="#000000" opacity={0.12} />

        {/* Waving arm, behind the body so it reads as an arm not a blob */}
        <path d="M74 46 Q88 40 90 24" stroke="#0E9488" strokeWidth={7} strokeLinecap="round" fill="none" />
        <circle cx="90" cy="22" r="5" fill="#2DD4BF" />

        <circle cx="50" cy="50" r="34" fill="url(#pennyBody)" />
        {/* Coin rim — she's a coin, subtly */}
        <circle cx="50" cy="50" r="27" fill="none" stroke="#FFFFFF" strokeOpacity={0.3} strokeWidth={2.5} />

        <ellipse cx="39" cy="45" rx="6.5" ry="7.5" fill="#FFFFFF" />
        <ellipse cx="61" cy="45" rx="6.5" ry="7.5" fill="#FFFFFF" />
        <circle cx="40" cy="46.5" r="3.3" fill="#0B3B37" />
        <circle cx="62" cy="46.5" r="3.3" fill="#0B3B37" />
        <circle cx="41.3" cy="45" r="1.1" fill="#FFFFFF" />
        <circle cx="63.3" cy="45" r="1.1" fill="#FFFFFF" />

        <path d="M42 60 Q50 67 58 60" stroke="#0B3B37" strokeWidth={3} strokeLinecap="round" fill="none" />

        <ellipse cx="31" cy="56" rx="4" ry="2.6" fill="#FFFFFF" opacity={0.22} />
        <ellipse cx="69" cy="56" rx="4" ry="2.6" fill="#FFFFFF" opacity={0.22} />
      </svg>
    </div>
  );
}
