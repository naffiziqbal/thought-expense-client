'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import type { User } from '@/types';
import toast from 'react-hot-toast';

const BackIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const CameraIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
  </svg>
);

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function EditProfilePage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up blob URL on unmount or when pending file changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const nameChanged = name !== (user?.name || '');
  const hasChanges = nameChanged || pendingFile !== null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || !user) return;

    setError(null);
    setIsSaving(true);

    try {
      let updatedUser: User = { ...user };

      // Only upload if user selected a new image
      if (pendingFile) {
        const compressed = await imageCompression(pendingFile, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });

        const res = await api.uploadProfilePicture(compressed);
        if (res.success && res.data?.user) {
          updatedUser = res.data.user;
          setPendingFile(null);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
        } else {
          setError('Failed to upload image. Please try again.');
          setIsSaving(false);
          return;
        }
      }

      // Only update name if it changed
      if (nameChanged) {
        const res = await api.updateProfile({ name: name || null });
        if (res.success && res.data?.user) {
          updatedUser = { ...updatedUser, ...res.data.user };
        } else {
          setError('Failed to save name. Please try again.');
          setIsSaving(false);
          return;
        }
      }

      setUser(updatedUser);
      toast.success('Profile updated');
      router.push('/dashboard/profile');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      setError(msg || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Please use JPEG, PNG, or WebP images');
      return;
    }

    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
    e.target.value = '';
  };

  // Show: pending preview > current profile picture > initial
  const displayImageUrl = previewUrl ?? getImageUrl(user?.profilePicture || user?.profilePictureUrl);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pb-8">
        {/* Back Button */}
        <div className="px-4 pt-4">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <BackIcon />
            <span className="text-base font-medium">Back</span>
          </Link>
        </div>

        {/* Island Header - Avatar Section */}
        <div className="relative z-10 mx-4 mt-4 rounded-3xl bg-white px-6 py-8 shadow-sm">
          <div className="flex flex-col items-center">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              className="hidden"
              onChange={handleFileChange}
              disabled={isSaving}
            />

            {/* Avatar with Edit Overlay */}
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isSaving}
              className="relative group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-full disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="h-24 w-24 rounded-full bg-teal-600 flex items-center justify-center shadow-md overflow-hidden relative">
                {displayImageUrl ? (
                  previewUrl ? (
                    // Blob URL - use img for local preview
                    <img
                      src={displayImageUrl}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={displayImageUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  )
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {(name || user?.email)?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              {/* Camera overlay */}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                <div className="rounded-full bg-white/90 p-3">
                  <CameraIcon />
                </div>
              </div>
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Tap to change photo
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="mx-4 mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <form onSubmit={handleSave} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={error || undefined}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSaving}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
