export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center bg-token-surface overflow-x-hidden">
      {/* Desktop side decorations - teal/mint vibe */}
      <div className="hidden md:block fixed inset-0 pointer-events-none z-0" aria-hidden>
        {/* Left panel gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-[calc((100vw-768px)/2+120px)] max-w-[50vw] bg-linear-to-r from-teal-50/90 via-teal-50/40 to-transparent dark:from-teal-950/40 dark:via-teal-950/20 dark:to-transparent" />
        {/* Right panel gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-[calc((100vw-768px)/2+120px)] max-w-[50vw] bg-linear-to-l from-teal-50/60 via-teal-50/20 to-transparent dark:from-teal-950/30 dark:via-teal-950/10 dark:to-transparent" />
        {/* Left accent orbs */}
        <div className="absolute left-[max(0px,calc((100vw-768px)/2-160px))] top-[15%] h-64 w-64 rounded-full bg-teal-400/20 dark:bg-teal-500/15 blur-3xl" />
        <div className="absolute left-[max(0px,calc((100vw-768px)/2-280px))] bottom-[25%] h-48 w-48 rounded-full bg-teal-500/15 dark:bg-teal-400/10 blur-3xl" />
        {/* Right accent orbs */}
        <div className="absolute right-[max(0px,calc((100vw-768px)/2-120px))] top-[40%] h-56 w-56 rounded-full bg-teal-400/15 dark:bg-teal-500/10 blur-3xl" />
        <div className="absolute right-[max(0px,calc((100vw-768px)/2-200px))] bottom-[15%] h-40 w-40 rounded-full bg-teal-500/10 dark:bg-teal-400/10 blur-3xl" />
        {/* Subtle grid overlay on sides */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[calc((100vw-768px)/2+80px)] max-w-[45vw] opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundSize: '32px 32px',
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-[calc((100vw-768px)/2+80px)] max-w-[45vw] opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundSize: '32px 32px',
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[768px] min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
