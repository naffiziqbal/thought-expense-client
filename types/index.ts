// User Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  currency: string;
  profilePicture?: string | null;
  profilePictureUrl?: string | null; // Full CDN URL for display
  createdAt: string;
}

// Auth Types
export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
  currency?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Expense Types
export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  confidence: number;
  rawInput: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParseExpenseRequest {
  rawInput: string;
}

export interface ParseExpenseResponse {
  success: boolean;
  message: string;
  data: {
    expenses: Expense[];
    needsReview: string[];
  };
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface ExpensesResponse {
  success: boolean;
  data: {
    expenses: Expense[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      page?: number;
      totalPages?: number;
      hasMore: boolean;
    };
  };
  cached: boolean;
}

export interface UpdateExpenseRequest {
  description?: string;
  amount?: number;
  currency?: string;
  category?: string;
  date?: string;
}

// Category Summary Types
export interface CategorySummary {
  totalSpent: number;
  currency: string;
  byCategory: Record<string, number>;
  percentages: Record<string, string>;
  topCategories: string[];
  transactionCount: number;
}

export interface CategorySummaryResponse {
  success: boolean;
  data: CategorySummary;
  cached: boolean;
}

// Insight Types
export interface Insight {
  id: string;
  userId: string;
  type: string;
  content: string;
  metadata: {
    summary?: CategorySummary;
    expenseCount?: number;
    period?: {
      start: string;
      end: string;
    };
  };
  period: string;
  createdAt: string;
}

export interface InsightsResponse {
  success: boolean;
  data: {
    insights: Insight[];
  };
  cached?: boolean;
}

export interface GenerateInsightsResponse {
  success: boolean;
  message: string;
  data: {
    insights: Insight[];
    summary: CategorySummary;
  };
}

// API Error Types
export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Expense Categories
export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Rent',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Personal Care',
  'Fees',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
