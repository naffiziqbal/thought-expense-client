'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
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

  const [rawInput, setRawInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isScanning, setIsScanning] = useState(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRawInput(value);
    updatePreview(value);
  };

  const handleScanReceipt = () => {
    setIsScanning(true);
    toast('Scan Receipt - Coming soon');
    setTimeout(() => setIsScanning(false), 2000);
  };

  const handleGallery = () => {
    toast('Gallery - Coming soon');
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    toast('Date set to today');
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
              className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl">🖼️</span>
            </button>
            <button
              onClick={handleToday}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              <span>Today</span>
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
