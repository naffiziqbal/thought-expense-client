'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { createWorker, PSM } from 'tesseract.js';
import {
  formatCurrency,
  getCategoryBgColor,
  parseExpenseInputLocally,
  getCategoryFromKeyword,
  type ParsedExpensePreview,
} from '@/lib/utils';

const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍔',
  Transport: '🚗',
  Rent: '🏠',
  Utilities: '💡',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Healthcare: '⚕️',
  Education: '📚',
  'Personal Care': '💅',
  Fees: '💳',
  Other: '📎',
};

function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
}

/** Preprocess image for better OCR: scale up, grayscale, contrast */
async function preprocessImageForOCR(source: Blob | File): Promise<HTMLCanvasElement> {
  const img = await createImageBitmap(source);
  const scale = 2;
  const w = img.width * scale;
  const h = img.height * scale;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const contrast = 1.4;
  const offset = 128 * (1 - contrast);
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const adjusted = Math.min(255, Math.max(0, gray * contrast + offset));
    data[i] = data[i + 1] = data[i + 2] = adjusted;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

interface ReceiptItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  isEditing?: boolean;
}

export default function AddExpensePage() {
  const { isAuthenticated, isLoading: authLoading } = useProtectedRoute();
  const { user } = useAuthStore();
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [rawInput, setRawInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const currency = user?.currency || 'USD';

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const updatePreview = useCallback((text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const parsed = parseExpenseInputLocally(text);
      setReceiptItems(
        parsed.map((p, i) => ({
          id: `preview-${i}-${p.rawInput}`,
          description: p.description,
          amount: p.amount,
          category: getCategoryFromKeyword(p.description),
          isEditing: false,
        }))
      );
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showCamera) return;
    setCameraError(null);
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        setCameraError(err?.message || 'Could not access camera');
      }
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [showCamera]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRawInput(value);
    updatePreview(value);
  };

  const processImage = async (file: File) => {
    setIsScanning(true);
    toast.loading('Extracting text from receipt...', { id: 'ocr' });
    try {
      const preprocessed = await preprocessImageForOCR(file);
      const worker = await createWorker('eng', 1, {
        workerPath: '/tesseract/worker.min.js',
        corePath: '/tesseract-core/',
        langPath: '/tesseract-lang/',
      });
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
        user_defined_dpi: '300',
      });
      const {
        data: { text },
      } = await worker.recognize(preprocessed);
      await worker.terminate();

      const trimmed = text?.trim();
      if (trimmed) {
        const newInput = rawInput ? `${rawInput}\n${trimmed}` : trimmed;
        setRawInput(newInput);
        updatePreview(newInput);
        toast.success('Text extracted!', { id: 'ocr' });
      } else {
        toast.error('No text found in image', { id: 'ocr' });
      }
    } catch (err) {
      console.error('OCR error:', err);
      toast.error('Failed to read receipt', { id: 'ocr' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanReceipt = () => {
    setShowCamera(true);
  };

  const handleCaptureFromCamera = () => {
    const video = videoRef.current;
    if (!video || !video.srcObject || video.readyState !== 4) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
        setShowCamera(false);
        processImage(file);
      },
      'image/jpeg',
      0.95
    );
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  const handleGallery = () => {
    galleryInputRef.current?.click();
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
    e.target.value = '';
  };

  const handleDateClick = () => {
    dateInputRef.current?.showPicker?.();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleEditItem = (id: string, field: 'description' | 'amount', value: string | number) => {
    setReceiptItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, [field]: typeof value === 'number' ? value : value }
          : item
      )
    );
  };

  const handleSave = async () => {
    const hasInput = rawInput.trim().length > 0;
    const hasItems = receiptItems.length > 0;

    if (!hasInput && !hasItems) {
      toast.error('Add some items first');
      return;
    }

    if (!hasInput && hasItems) {
      const rawFromItems = receiptItems.map((i) => `${i.description} ${i.amount}`).join('\n');
      setRawInput(rawFromItems);
    }

    const toSubmit = hasInput ? rawInput : receiptItems.map((i) => `${i.description} ${i.amount}`).join('\n');

    setIsSaving(true);
    try {
      const response = await api.parseExpenses({ rawInput: toSubmit });
      if (response.success) {
        toast.success('Saved!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const hasContent = rawInput.trim().length > 0 || receiptItems.length > 0;
  const showReceiptList = receiptItems.length > 0 || isScanning;

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full overflow-hidden px-4 md:px-6 pb-28">
        {/* 1. Top Header - Fixed */}
        <div className="shrink-0 pt-4 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Quick Log</h1>
          <p className="text-sm text-gray-500 mt-1">Type details or scan a receipt</p>
        </div>

        {/* 2. The Input Card (Smart Box) - Fixed */}
        <div className="shrink-0 rounded-2xl bg-white shadow-md overflow-hidden">
          {/* Top Half - Text Area */}
          <div className="p-4">
            <textarea
              ref={inputRef}
              value={rawInput}
              onChange={handleInputChange}
              placeholder="Lunch 500"
              disabled={isScanning}
              rows={4}
              className="w-full min-h-[120px] resize-none border-0 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 text-[20px] leading-relaxed disabled:opacity-60"
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200" />

          {/* Bottom Half - Media Bar */}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            {/* Hidden inputs */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelected}
              className="hidden"
            />
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="hidden"
            />

            <button
              onClick={handleScanReceipt}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              <span>📷</span>
              <span>Scan Receipt</span>
            </button>
            <button
              onClick={handleGallery}
              disabled={isScanning}
              className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-60"
            >
              <span className="text-xl">🖼️</span>
            </button>
            <button
              onClick={handleDateClick}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              <span className="whitespace-nowrap">
                {selectedDate === new Date().toISOString().split('T')[0]
                  ? 'Today'
                  : (() => {
                      const [y, m, d] = selectedDate.split('-');
                      return `${m}/${d}/${y.slice(-2)}`;
                    })()}
              </span>
              <span>📅</span>
            </button>
          </div>
        </div>

        {/* 3. Live Receipt List - Scrollable only */}
        <div className="flex-1 min-h-0 mt-4 overflow-y-auto">
          {showReceiptList && (
            <div className="space-y-3 pb-4">
              {isScanning ? (
                <>
                  <div className="h-14 rounded-2xl bg-gray-100 animate-pulse" />
                  <div className="h-14 rounded-2xl bg-gray-100 animate-pulse" />
                </>
              ) : (
                receiptItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm shrink-0"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: getCategoryBgColor(item.category) }}
                    >
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingId === item.id ? (
                        <input
                          value={item.description}
                          onChange={(e) => handleEditItem(item.id, 'description', e.target.value)}
                          onBlur={() => setEditingId(null)}
                          autoFocus
                          className="w-full text-base font-medium text-gray-900 border-b border-teal-500 focus:outline-none bg-transparent"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingId(item.id)}
                          className="w-full text-left font-medium text-gray-900 truncate block hover:text-teal-600 transition-colors"
                        >
                          {item.description}
                        </button>
                      )}
                    </div>
                    <span className="font-bold text-gray-900 shrink-0">-{formatCurrency(item.amount, currency)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Camera overlay - live preview */}
        {showCamera && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col">
              <div className="flex justify-between items-center p-4 pt-safe">
                <button
                  onClick={handleCloseCamera}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <span className="text-white font-medium">Scan Receipt</span>
                <div className="w-10" />
              </div>
              {cameraError ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <p className="text-white text-center">{cameraError}</p>
                </div>
              ) : (
                <div className="flex-1" />
              )}
              <div className="p-6 pb-safe flex flex-col items-center gap-4">
                <button
                  onClick={handleCaptureFromCamera}
                  disabled={!!cameraError}
                  className="w-16 h-16 rounded-full border-4 border-white bg-white/20 backdrop-blur flex items-center justify-center shadow-lg disabled:opacity-50 active:scale-95 transition-transform"
                >
                  <span className="w-12 h-12 rounded-full bg-white" />
                </button>
                <p className="text-white/90 text-sm">Tap to capture</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Floating Action Button */}
        <div className="fixed bottom-20 left-0 right-0 px-4 md:px-6 pb-safe z-40">
          <button
            onClick={handleSave}
            disabled={!hasContent || isSaving}
            className="w-full py-4 rounded-2xl bg-green-600 text-white font-semibold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 transition-colors shadow-lg"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Save All Items'
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
