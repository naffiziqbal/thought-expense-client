'use client';

const AVATARS = ['👤', '👩', '👨', '👩‍💻', '👨‍💼'];
const RATING = 4.9;

export function SocialTrust() {
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <div className="flex -space-x-3">
        {AVATARS.map((avatar, i) => (
          <div
            key={i}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xl shadow-sm"
          >
            {avatar}
          </div>
        ))}
      </div>
      <div className="text-center sm:text-left">
        <p className="text-2xl font-semibold text-gray-900">
          Used by <span className="text-teal-500">10,000+</span> people
        </p>
        <p className="mt-1 flex items-center justify-center gap-1 text-sm text-gray-500 sm:justify-start">
          <span className="text-amber-500">★★★★★</span> {RATING} from 2,000+ reviews
        </p>
      </div>
    </div>
  );
}
