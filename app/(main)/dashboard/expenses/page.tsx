'use client';

import { useCallback, useEffect, useState, useRef, type ElementType } from 'react';
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
import type { Expense, AssistantSearchResult } from '@/types';
import {
  formatCurrency,
  formatDate,
  getCategoryColor,
  getCategoryBgColor,
  getCategoryChartColor,
  cleanExpenseDescription,
} from '@/lib/utils';
import { subMonths } from 'date-fns';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { DASHBOARD_REFRESH_EVENT } from '@/lib/events';
function ExpenseRow({
  expense,
  selectionMode,
  selected,
  onActivate,
  onLongPress,
  CategoryIcon,
}: {
  expense: Expense;
  selectionMode: boolean;
  selected: boolean;
  onActivate: () => void;
  onLongPress: () => void;
  CategoryIcon: ElementType;
}) {
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);

  const clearTimer = () => {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startLongPress = () => {
    longPressFired.current = false;
    clearTimer();
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      onLongPress();
    }, 450);
  };

  const handleClick = () => {
    clearTimer();
    if (longPressFired.current) return;
    onActivate();
  };

  return (
    <button
      type="button"
      onMouseDown={startLongPress}
      onMouseUp={clearTimer}
      onMouseLeave={clearTimer}
      onTouchStart={startLongPress}
      onTouchEnd={clearTimer}
      onClick={handleClick}
      className={`w-full flex items-center gap-2 sm:gap-4 px-2.5 sm:px-4 py-3 min-h-[64px] sm:min-h-[72px] text-left transition-colors ${
        selected ? 'bg-teal-50/80 dark:bg-teal-950/30' : 'bg-token-card hover:bg-[var(--surface-hover)] active:bg-[var(--surface-hover)]'
      }`}
    >
      {selectionMode ? (
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white' : 'border-token'
          }`}
        >
          {selected ? '✓' : null}
        </span>
      ) : null}
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center"
        style={{ backgroundColor: getCategoryBgColor(expense.category) }}
      >
        <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" style={{ color: getCategoryChartColor(expense.category) }} aria-hidden />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="font-bold text-token-primary truncate">{cleanExpenseDescription(expense.description)}</p>
        <p className="text-sm text-token-secondary mt-0.5">{formatDate(expense.date)}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-bold text-token-primary text-sm sm:text-base">
          -{formatCurrency(expense.amount, expense.currency)}
        </p>
        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--background-tag)] text-[var(--text-tag)]">
          {expense.category}
        </span>
      </div>
    </button>
  );
}

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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: '',
  });

  // Smart search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<AssistantSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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
        if (searchResult) handleSearch();
        window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT));
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
        if (searchResult) handleSearch();
        window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT));
      }
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const beginSelection = useCallback(
    (expense: Expense) => {
      setSelectionMode(true);
      setSelectedIds((prev) => new Set(prev).add(expense.id));
    },
    []
  );

  const handleRowActivate = useCallback(
    (expense: Expense) => {
      if (selectionMode) {
        toggleSelected(expense.id);
        return;
      }
      handleEdit(expense);
    },
    [handleEdit, selectionMode, toggleSelected]
  );

  useEffect(() => {
    if (selectionMode && selectedIds.size === 0) setSelectionMode(false);
  }, [selectionMode, selectedIds.size]);

  const confirmBulkDelete = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    setIsBulkDeleting(true);
    try {
      const response = await api.deleteExpensesBatch(ids);
      if (response.success) {
        toast.success(response.message || `Deleted ${response.data.deleted} expenses`);
        setIsBulkDeleteOpen(false);
        exitSelection();
        fetchExpenses();
        if (searchResult) handleSearch();
        window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT));
      }
    } catch {
      toast.error('Failed to delete expenses');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      setSearchResult(null);
      return;
    }
    setIsSearching(true);
    try {
      const response = await api.searchExpensesSmart(q);
      if (response.success) {
        setSearchResult(response.data);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
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
      <div className="flex min-h-screen items-center justify-center bg-token-surface">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent"></div>
          <p className="text-token-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const activeFiltersCount = [filters.category, filters.startDate, filters.endDate].filter(Boolean).length;
  const transactionCount = pagination.total;

  // Smart search results mapped onto the Expense shape so rows render identically
  const isSearchActive = searchResult !== null;
  const displayedExpenses: Expense[] = isSearchActive
    ? searchResult.expenses.map((r) => ({
        id: r.id,
        userId: '',
        description: r.description,
        amount: r.amount,
        currency: r.currency,
        category: r.category,
        confidence: 1,
        rawInput: '',
        date: r.date,
        createdAt: r.date,
        updatedAt: r.date,
      }))
    : expenses;
  const listLoading = isSearchActive ? isSearching : isLoading;

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
      <div className="flex flex-col h-full bg-token-surface overflow-hidden">
        {/* A. Header & Filter Bar - Fixed */}
        {!isPremium && (
          <div className="mb-4 rounded-2xl bg-teal-50 border border-teal-200 px-3 sm:px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-teal-800">
              Viewing past 3 months. <Link href="/dashboard/premium" className="font-semibold underline">Upgrade to Premium</Link> for full history.
            </p>
          </div>
        )}
        <div className="shrink-0 pt-2 pb-3 sm:pt-0 sm:pb-4 flex justify-between items-end gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-token-primary">All Expenses</h1>
            <p className="text-sm text-token-secondary mt-0.5">
              {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {isPremium ? (
              <button
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-token bg-token-card text-token-primary text-sm font-medium hover:border-[var(--accent-primary)]/50 transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            ) : (
              <div title="Export available on Premium" className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-token bg-token-card/50 text-token-muted text-sm cursor-not-allowed">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Export
              </div>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-token bg-token-card text-token-primary text-sm font-medium hover:border-[var(--accent-primary)]/50 transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold bg-token-accent/20 text-token-accent rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Smart Search */}
        <form onSubmit={handleSearch} className="shrink-0 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 h-11 rounded-full border border-token bg-token-card px-3 sm:px-4 focus-within:border-[var(--accent-primary)] focus-within:ring-2 focus-within:ring-[var(--accent-primary)]/20 transition-all">
              <svg className="h-5 w-5 shrink-0 text-token-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search descriptions, categories…"
                className="flex-1 min-w-0 bg-transparent text-sm text-token-primary placeholder:text-token-muted focus:outline-none"
              />
              {isSearchActive && (
                <button
                  type="button"
                  onClick={clearSearch}
                  title="Clear search"
                  className="shrink-0 rounded-full p-1 text-token-muted hover:text-token-primary hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <Button
              type="submit"
              size="md"
              isLoading={isSearching}
              disabled={!searchQuery.trim()}
              className="shrink-0 h-11 rounded-full px-5"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Collapsible Filters Panel */}
        {showFilters && (
          <div className="shrink-0 mb-4 rounded-2xl bg-token-card p-3 sm:p-4 shadow-sm border border-token">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-token-primary">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full rounded-lg border border-token px-3 py-2 text-sm text-token-primary bg-token-card focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-token-primary">From</label>
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
                    className="w-full rounded-lg border border-token px-3 py-2 text-sm text-token-primary bg-token-card focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                  />
                  {!isPremium && (
                    <p className="mt-1 text-xs text-token-muted">Free: last 3 months only</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-token-primary">To</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    min={!isPremium ? minDateFree : undefined}
                    max={maxDateToday}
                    className="w-full rounded-lg border border-token px-3 py-2 text-sm text-token-primary bg-token-card focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-2 text-sm font-medium text-token-secondary border border-token rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowFilters(false);
                    setPage(1);
                  }}
                  className="flex-1 py-2 text-sm font-medium bg-token-accent text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {selectionMode ? (
          <div className="shrink-0 mb-3 flex items-center justify-between rounded-xl border border-token bg-token-card px-4 py-2.5">
            <button type="button" onClick={exitSelection} className="text-sm font-semibold text-token-primary">
              Cancel
            </button>
            <span className="text-sm font-semibold text-token-primary">{selectedIds.size} selected</span>
            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={() => setIsBulkDeleteOpen(true)}
              className="text-sm font-semibold text-red-600 disabled:opacity-40"
            >
              Delete
            </button>
          </div>
        ) : null}

        {/* B. Transaction List Container - Scrollable */}
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-token-card border border-token shadow-sm overflow-hidden">
          {/* Search results summary */}
          {isSearchActive && !isSearching && (
            <div className="shrink-0 flex items-center justify-between gap-3 border-b border-token bg-teal-50/50 dark:bg-teal-950/20 px-3 sm:px-4 py-2.5">
              <p className="text-sm text-token-primary min-w-0 truncate">
                <span className="font-semibold">
                  {searchResult.total} expense{searchResult.total !== 1 ? 's' : ''}
                </span>{' '}
                &middot; {formatCurrency(searchResult.totalAmount, searchResult.currency)}
                <span className="text-token-muted"> for &quot;{searchResult.query}&quot;</span>
              </p>
              <button
                type="button"
                onClick={clearSearch}
                className="shrink-0 text-sm font-semibold text-token-accent hover:opacity-80"
              >
                Clear search
              </button>
            </div>
          )}
          {listLoading ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-r-transparent"></div>
                <p className="text-token-secondary text-sm">
                  {isSearchActive ? 'Searching...' : 'Loading expenses...'}
                </p>
              </div>
            </div>
          ) : displayedExpenses.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 text-5xl">{isSearchActive ? '🔍' : '📝'}</div>
                <h3 className="mb-2 text-lg font-semibold text-token-primary">No expenses found</h3>
                <p className="text-token-secondary text-sm">
                  {isSearchActive
                    ? 'Try a different search or clear the search'
                    : 'Try adjusting your filters or add new expenses'}
                </p>
              </div>
            </div>
          ) : (
            <div className={`relative flex-1 min-h-0 overflow-y-auto divide-y divide-[var(--border-default)] transition-opacity ${isPageChanging ? 'opacity-60 pointer-events-none' : ''}`}>
              {displayedExpenses.map((expense) => {
                const CategoryIcon = getCategoryIcon(expense.category);
                const selected = selectedIds.has(expense.id);
                return (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  selected={selected}
                  selectionMode={selectionMode}
                  onActivate={() => handleRowActivate(expense)}
                  onLongPress={() => beginSelection(expense)}
                  CategoryIcon={CategoryIcon}
                />
              );
              })}
            </div>
          )}
        </div>

        {/* C. Pagination Footer */}
        {!isSearchActive && !isLoading && pagination.total > 0 && (
          <div className="shrink-0 pt-3 pb-2 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                isPageChangeRef.current = true;
                setPage((p) => Math.max(1, p - 1));
              }}
              disabled={page <= 1 || isPageChanging}
              className="p-2 rounded-lg border border-token bg-token-card text-token-primary hover:border-[var(--accent-primary)]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-1">
              {getPageNumbers().map((p, i) =>
                p === 'ellipsis' ? (
                  <span key={`e-${i}`} className="px-2 text-token-muted">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => {
                      isPageChangeRef.current = true;
                      setPage(p as number);
                    }}
                    className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-token-accent text-white'
                        : 'bg-token-card border border-token text-token-primary hover:border-[var(--accent-primary)]/50'
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
              className="p-2 rounded-lg border border-token bg-token-card text-token-primary hover:border-[var(--accent-primary)]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
            <label className="mb-1.5 block text-sm font-medium text-token-primary">Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
              className="w-full rounded-lg border border-token px-3 py-2 text-sm text-token-primary bg-token-card focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-token-primary">From (optional)</label>
              <input
                type="date"
                value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
                className="w-full rounded-lg border border-token px-3 py-2 text-sm text-token-primary bg-token-card focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-token-primary">To (optional)</label>
              <input
                type="date"
                value={exportTo}
                onChange={(e) => setExportTo(e.target.value)}
                className="w-full rounded-lg border border-token px-3 py-2 text-sm text-token-primary bg-token-card focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
          </div>
          <p className="text-sm text-token-secondary">Leave dates empty to export all expenses.</p>
        </div>
      </Modal>

      <Modal
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        title="Delete expenses"
        footer={
          <div className="flex gap-3">
            <Button onClick={() => setIsBulkDeleteOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={confirmBulkDelete} variant="danger" className="flex-1" disabled={isBulkDeleting}>
              {isBulkDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-token-primary">
          Delete {selectedIds.size} expense{selectedIds.size === 1 ? '' : 's'}? This cannot be undone.
        </p>
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
        <p className="text-token-primary">
          Are you sure you want to delete this expense? This action cannot be undone.
        </p>
        {selectedExpense && (
          <div className="mt-4 rounded-lg bg-[var(--background-tag)] p-4">
            <p className="font-medium text-token-primary">{selectedExpense.description}</p>
            <p className="text-sm text-token-secondary">
              {formatCurrency(selectedExpense.amount, selectedExpense.currency)} •{' '}
              {selectedExpense.category}
            </p>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
