import { ImageResponse } from 'next/og';

export const alt = 'ThoughtExpense - AI-powered expense tracking. Track expenses. Just by typing.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)',
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
          ThoughtExpense
        </h1>
        <p
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.95)',
            marginTop: 16,
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Track expenses. Just by typing.
        </p>
        <p
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 12,
            textAlign: 'center',
          }}
        >
          No categories. No dates. Coffee 15, Rent 5000 — done.
        </p>
      </div>
    ),
    { ...size }
  );
}
