'use client';

import { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useCategories } from '@/hooks/useCategories';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
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
  getConfidenceBadgeColor,
} from '@/lib/utils';

export default function ExpensesPage() {
  const { isAuthenticated, isLoading: authLoading } = useProtectedRoute();
  const { categories } = useCategories();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await api.getExpenses({
        ...(filters.category && { category: filters.category }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        limit: 100,
      });

      if (response.success) {
        setExpenses(response.data.expenses);
      }
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    fetchExpenses();
  }, [isAuthenticated, authLoading, filters]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="mt-2 text-gray-600">View and manage your expenses</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              </div>

              <Input
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />

              <Input
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />

              <div className="flex items-end">
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Expenses ({expenses.length})</CardTitle>
            <CardDescription>Click on an expense to edit or delete</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="text-gray-600">Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">📝</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">No expenses found</h3>
                <p className="text-gray-600">Try adjusting your filters or add new expenses</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600">
                        Confidence
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="font-medium text-gray-900">
                            {expense.description}
                          </div>
                          <div className="text-xs text-gray-500">{expense.rawInput}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(expense.category)}`}
                          >
                            {expense.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(expense.amount, expense.currency)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-center text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getConfidenceBadgeColor(expense.confidence)}`}
                          >
                            {Math.round(expense.confidence * 100)}%
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="mr-2 text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(expense)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Expense"
        footer={
          <div className="flex gap-3">
            <Button onClick={() => setIsEditModalOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="flex-1">
              Save Changes
            </Button>
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
