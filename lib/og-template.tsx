import type { ReactNode } from 'react';

export const OG_SIZE = { width: 1200, height: 630 } as const;

export interface OGTemplateProps {
  title: string;
  description?: string;
  subtitle?: string;
}

/**
 * Shared layout for Next.js ImageResponse (OG/Twitter). Used by opengraph-image.tsx files.
 * Keep styles inline; next/og uses Satori which doesn't support className.
 */
export function OGTemplate({ title, description, subtitle }: OGTemplateProps): ReactNode {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0B7A70 0%, #0E9488 55%, #2DD4BF 100%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 120,
          height: 120,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 24,
          marginBottom: 40,
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <h1
        style={{
          fontSize: 56,
          fontWeight: 600,
          color: 'white',
          margin: 0,
          textAlign: 'center',
          maxWidth: 900,
        }}
      >
        {title}
      </h1>
      {description ? (
        <p
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.95)',
            marginTop: 16,
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          {description}
        </p>
      ) : null}
      {subtitle ? (
        <p
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 12,
            textAlign: 'center',
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
