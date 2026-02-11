'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useCategories } from '@/hooks/useCategories';
import { useIsPremium } from '@/hooks/useIsPremium';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CategoryInput } from '@/components/ui/CategoryInput';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Expense } from '@/types';
import {
  formatCurrency,
  formatDate,
  getCategoryColor,
  getCategoryBgColor,
  cleanExpenseDescription,
} from '@/lib/utils';
import { subMonths } from 'date-fns';
import { getCategoryIcon } from '@/lib/categoryIcons';

export default function ExpensesPage() {
  const { isAuthenticated, isLoading: authLoading } = useProtectedRoute();
  const { categories } = useCategories();
  const isPremium = useIsPremium();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const isPageChangeRef = useRef(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: '',
  });

  // Filters
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: PAGE_SIZE,
    offset: 0,
    hasMore: false,
  });

  const totalPages = Math.max(1, Math.ceil(pagination.total / PAGE_SIZE));

  // Free users: limit date filter to last 3 months
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  const minDateFree = threeMonthsAgo.toISOString().slice(0, 10);
  const maxDateToday = today.toISOString().slice(0, 10);

  const fetchExpenses = async () => {
    const isPageChange = isPageChangeRef.current;
    isPageChangeRef.current = false;

    if (!isPageChange) setIsLoading(true);
    else setIsPageChanging(true);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      // Free users: clamp startDate to 3-month cutoff
      const startDate =
        filters.startDate && !isPremium && filters.startDate < minDateFree
          ? minDateFree
          : filters.startDate;
      const response = await api.getExpenses({
        ...(filters.category && { category: filters.category }),
        ...(startDate && { startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        limit: PAGE_SIZE,
        offset,
      });

      if (response.success) {
        setExpenses(response.data.expenses);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      if (!isPageChange) setIsLoading(false);
      else setIsPageChanging(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    fetchExpenses();
  }, [isAuthenticated, authLoading, filters, page]);

  // Free users: clamp filters when panel opens with out-of-range dates
  const prevShowFilters = useRef(false);
  useEffect(() => {
    if (!showFilters || isPremium) {
      prevShowFilters.current = showFilters;
      return;
    }
    if (prevShowFilters.current === showFilters) return;
    prevShowFilters.current = showFilters;
    setFilters((prev) => {
      let updated = false;
      const next = { ...prev };
      if (prev.startDate && prev.startDate < minDateFree) {
        next.startDate = minDateFree;
        updated = true;
      }
      if (prev.endDate && prev.endDate > maxDateToday) {
        next.endDate = maxDateToday;
        updated = true;
      }
      return updated ? next : prev;
    });
  }, [showFilters, isPremium, minDateFree, maxDateToday]);

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date.split('T')[0],
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedExpense) return;

    try {
      const response = await api.updateExpense(selectedExpense.id, {
        description: editForm.description,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        date: new Date(editForm.date).toISOString(),
      });

      if (response.success) {
        toast.success('Expense updated successfully');
        setIsEditModalOpen(false);
        fetchExpenses();
      }
    } catch (error) {
      toast.error('Failed to update expense');
    }
  };

  const handleDelete = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedExpense) return;

    try {
      const response = await api.deleteExpense(selectedExpense.id);
      if (response.success) {
        toast.success('Expense deleted successfully');
        setIsDeleteModalOpen(false);
        fetchExpenses();
      }
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const clearFilters = () => {
    setFilters({ category: '', startDate: '', endDate: '' });
    setPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const from = exportFrom || undefined;
      const to = exportTo || undefined;
      const blob = await api.exportExpenses(exportFormat, from, to);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${new Date().toISOString().slice(0, 10)}.${exportFormat === 'csv' ? 'csv' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
      setExportModalOpen(false);
      toast.success('Export downloaded');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const activeFiltersCount = [filters.category, filters.startDate, filters.endDate].filter(Boolean).length;
  const transactionCount = pagination.total;

  /** Generate page numbers to display: 1 2 3 [4] 5 6 or 1 ... 4 [5] 6 ... 10 */
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | 'ellipsis')[] = [];
    if (page <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('ellipsis', totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1, 'ellipsis');
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages);
    }
    return pages;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-gray-100 px-4 overflow-hidden">
        {/* A. Header & Filter Bar - Fixed */}
        {!isPremium && (
          <div className="mb-4 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-teal-800">
              Viewing past 3 months. <Link href="/dashboard/premium" className="font-semibold underline">Upgrade to Premium</Link> for full history.
            </p>
          </div>
        )}
        <div className="shrink-0 pt-4 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Expenses</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            {isPremium ? (
              <button
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            ) : (
              <div title="Export available on Premium" className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Export
              </div>
            )}
            <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold bg-gray-200 text-gray-700 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          </div>
        </div>

        {/* Collapsible Filters Panel */}
        {showFilters && (
          <div className="shrink-0 mb-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">From</label>
                  <input
                    type="date"
                    value={
                      !isPremium && filters.startDate && filters.startDate < minDateFree
                        ? minDateFree
                        : filters.startDate
                    }
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    min={!isPremium ? minDateFree : undefined}
                    max={maxDateToday}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  {!isPremium && (
                    <p className="mt-1 text-xs text-gray-500">Free: last 3 months only</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">To</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    min={!isPremium ? minDateFree : undefined}
                    max={maxDateToday}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowFilters(false);
                    setPage(1);
                  }}
                  className="flex-1 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-500"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* B. Transaction List Container - Scrollable */}
        <div className="flex-1 min-h-0 flex flex-col rounded-[24px] bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-r-transparent"></div>
                <p className="text-gray-500 text-sm">Loading expenses...</p>
              </div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 text-5xl">📝</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No expenses found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters or add new expenses</p>
              </div>
            </div>
          ) : (
            <div className={`relative flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100 transition-opacity ${isPageChanging ? 'opacity-60 pointer-events-none' : ''}`}>
              {expenses.map((expense) => {
                const CategoryIcon = getCategoryIcon(expense.category);
                return (
                <button
                  key={expense.id}
                  type="button"
                  onClick={() => handleEdit(expense)}
                  className="w-full flex items-center gap-4 px-4 py-4 min-h-[72px] text-left bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  {/* Left: Category Icon (48x48 squircle) */}
                  <div
                    className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-2xl"
                    style={{ backgroundColor: getCategoryBgColor(expense.category) }}
                  >
                    <CategoryIcon className="w-6 h-6" />
                  </div>

                  {/* Middle: Title & Subtitle */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {cleanExpenseDescription(expense.description)}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatDate(expense.date)}
                    </p>
                  </div>

                  {/* Right: Amount & Category Tag */}
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-gray-900">
                      - {formatCurrency(expense.amount, expense.currency)}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {expense.category}
                    </span>
                  </div>
                </button>
              );
              })}
            </div>
          )}
        </div>

        {/* C. Pagination Footer */}
        {!isLoading && pagination.total > 0 && (
          <div className="shrink-0 pt-4 pb-2 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                isPageChangeRef.current = true;
                setPage((p) => Math.max(1, p - 1));
              }}
              disabled={page <= 1 || isPageChanging}
              className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-1">
              {getPageNumbers().map((p, i) =>
                p === 'ellipsis' ? (
                  <span key={`e-${i}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => {
                      isPageChangeRef.current = true;
                      setPage(p as number);
                    }}
                    className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-teal-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={isPageChanging}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => {
                isPageChangeRef.current = true;
                setPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={page >= totalPages || isPageChanging}
              className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Expense"
        footer={
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Button onClick={() => setIsEditModalOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
            </div>
            {selectedExpense && (
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  handleDelete(selectedExpense);
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Delete expense
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={editForm.amount}
            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
          />
          <CategoryInput
            label="Category"
            value={editForm.category}
            onChange={(value) => setEditForm({ ...editForm, category: value })}
            suggestions={categories}
            placeholder="Type or select category"
          />
          <Input
            label="Date"
            type="date"
            value={editForm.date}
            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
          />
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Expenses"
        footer={
          <div className="flex gap-3">
            <Button onClick={() => setExportModalOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExport} className="flex-1" disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">From (optional)</label>
              <input
                type="date"
                value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">To (optional)</label>
              <input
                type="date"
                value={exportTo}
                onChange={(e) => setExportTo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">Leave dates empty to export all expenses.</p>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Expense"
        footer={
          <div className="flex gap-3">
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={confirmDelete} variant="danger" className="flex-1">
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete this expense? This action cannot be undone.
        </p>
        {selectedExpense && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="font-medium text-gray-900">{selectedExpense.description}</p>
            <p className="text-sm text-gray-600">
              {formatCurrency(selectedExpense.amount, selectedExpense.currency)} •{' '}
              {selectedExpense.category}
            </p>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
