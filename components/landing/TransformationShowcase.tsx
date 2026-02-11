'use client';

export function TransformationShowcase() {
  return (
    <div className="grid gap-8 md:grid-cols-[1fr,auto,1fr] md:items-center">
      {/* Left: Messy note */}
      <div className="rounded-3xl border border-gray-200 bg-amber-50/50 p-8 shadow-sm">
        <p className="mb-4 text-sm font-medium text-gray-500">You type:</p>
        <div className="rounded-2xl border border-dashed border-amber-300 bg-white p-6">
          <p className="text-lg text-gray-700 italic">
            &quot;Paid 1200 for internet and 300 for snacks&quot;
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
          <svg
            className="h-6 w-6 text-teal-600 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>

      {/* Right: Clean result */}
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-4 text-sm font-medium text-teal-600">Instantly sorted:</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
            <span className="text-2xl">📶</span>
            <div className="flex-1">
              <span className="font-medium text-gray-900">Internet</span>
              <span className="ml-2 text-gray-600">Utilities</span>
            </div>
            <span className="font-semibold text-red-500">-1,200</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
            <span className="text-2xl">🍿</span>
            <div className="flex-1">
              <span className="font-medium text-gray-900">Snacks</span>
              <span className="ml-2 text-gray-600">Food</span>
            </div>
            <span className="font-semibold text-red-500">-300</span>
          </div>
        </div>
      </div>
    </div>
  );
}
