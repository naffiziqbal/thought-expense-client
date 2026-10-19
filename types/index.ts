// User Types
export interface UserSubscription {
  plan: 'monthly' | 'yearly' | 'lifetime' | null;
  planLabel: string | null;
  status: 'active' | 'cancelled' | 'grace' | 'expired' | null;
  premiumSince: string | null;
  premiumUntil: string | null;
  productId: string | null;
  store: string | null;
  summaryLine: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  currency: string;
  profilePicture?: string | null;
  profilePictureUrl?: string | null; // Full CDN URL for display
  isPremium: boolean;
  subscription?: UserSubscription | null;
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
  date?: string;
}

export interface ParseExpenseResponse {
  success: boolean;
  message: string;
  data: {
    expenses: Expense[];
    needsReview: string[];
  };
}

export interface ExpenseImportRow {
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
}

export interface ExpenseImportPreview {
  format: 'csv' | 'pdf';
  rows: ExpenseImportRow[];
  warnings: string[];
  skippedRows: number;
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

// Budget Types
export interface BudgetSummary {
  id?: string;
  month: number;
  year: number;
  total_limit: number;
  total_spent: number;
  remaining: number;
  percentage: number;
}

export interface CategoryBudgetProgress {
  month: number;
  year: number;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
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

// AI Advisor (Assistant) Types
export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantAnswer {
  answer: string;
  followUps: string[];
  remainingFreeQuestions: number | null;
}

export interface SavingsPlanStep {
  category: string;
  action: string;
  estimatedMonthlySaving: number;
}

export interface SavingsPlan {
  feasible: boolean;
  targetAmount: number;
  currency: string;
  estimatedTotalSaving: number;
  summary: string;
  steps: SavingsPlanStep[];
}

export interface AssistantSearchExpense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  matchType: 'semantic' | 'keyword' | 'both';
}

export interface AssistantSearchResult {
  query: string;
  parsed: Record<string, unknown> | null;
  expenses: AssistantSearchExpense[];
  total: number;
  totalAmount: number;
  currency: string;
}

// Savings Goal Types
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  currency: string;
  deadline: string | null;
  status: 'active' | 'completed' | 'archived';
  progress: number; // 0-1
  remaining: number;
  createdAt: string;
  updatedAt: string;
}

// Spending Intelligence Types
export interface IntelligenceMonthlyPoint {
  month: string; // 'YYYY-MM'
  total: number;
  byCategory: Record<string, number>;
}

export interface IntelligenceAnomaly {
  type: 'category_spike' | 'large_transaction';
  message: string;
  [key: string]: unknown;
}

export interface IntelligenceTrend {
  category: string;
  monthlyAmounts: number[];
  changePercent: number;
  currency: string;
  message: string;
}

export interface IntelligenceWaste {
  type: 'price_creep' | 'overlapping_subscriptions' | 'small_leak';
  category: string;
  amount: number;
  currency: string;
  message: string;
  items?: string[];
}

export interface RecurringExpenseItem {
  description: string;
  category: string;
  averageAmount: number;
  currency: string;
  occurrences: number;
  monthsSeen: number;
  lastDate: string;
}

export type RecurringFrequency = 'weekly' | 'monthly';

/** A user-confirmed rule the server auto-logs on schedule. */
export interface RecurringRule {
  id: string;
  userId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  frequency: RecurringFrequency;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  nextRunAt: string;
  lastRunAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  budgetAlertsEnabled: boolean;
}

export interface SpendingIntelligence {
  currency: string;
  windowMonths: number;
  monthlySeries: IntelligenceMonthlyPoint[];
  anomalies: IntelligenceAnomaly[];
  trends: IntelligenceTrend[];
  waste: IntelligenceWaste[];
  recurring: RecurringExpenseItem[];
}

// Weekly Briefing Types
export interface WeeklyBriefing {
  id: string;
  type: 'briefing';
  content: string;
  metadata: {
    briefing: {
      title: string;
      summary: string;
      highlights: string[];
      recommendations: string[];
    };
    weekTotal: number;
    previousWeekTotal: number;
    currency: string;
    [key: string]: unknown;
  };
  period: string;
  createdAt: string;
}

// API Error Types
export interface ApiError {
  success: false;
  message: string;
  /** Machine-readable reason, e.g. PASSWORD_RESET_REQUIRED */
  code?: string;
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
