import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  AuthResponse,
  SignupRequest,
  LoginRequest,
  ParseExpenseRequest,
  ParseExpenseResponse,
  ExpensesResponse,
  ExpenseFilters,
  Expense,
  UpdateExpenseRequest,
  CategorySummaryResponse,
  InsightsResponse,
  GenerateInsightsResponse,
  ApiError,
  BudgetSummary,
  CategoryBudgetProgress,
  AssistantMessage,
  AssistantAnswer,
  SavingsPlan,
  AssistantSearchResult,
  SavingsGoal,
  SpendingIntelligence,
  WeeklyBriefing,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Don't redirect if it's a login or signup request failing
          const isAuthEndpoint = error.config?.url?.includes('/api/auth/login') || 
                                 error.config?.url?.includes('/api/auth/signup');
        
          if (!isAuthEndpoint) {
            // Clear token on unauthorized
            this.clearToken();
            // Redirect to login if on client side
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  public clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Auth endpoints
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/signup', data);
    if (response.data.success && response.data.data.token) {
      this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/login', data);
    if (response.data.success && response.data.data.token) {
      this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{ success: boolean; message: string }>('/api/auth/forgot-password', {
      email,
    });
    return response.data;
  }

  async verifyResetOtp(email: string, otp: string): Promise<{ success: boolean; data?: { resetToken: string } }> {
    const response = await this.client.post('/api/auth/verify-otp', { email, otp });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{ success: boolean; message: string }>('/api/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{ success: boolean; message: string }>('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  async updateProfile(data: { name?: string | null; currency?: string }) {
    const response = await this.client.patch('/api/auth/profile', data);
    return response.data;
  }

  async uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await this.client.post('/api/auth/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.delete('/api/auth/account', { data: { password } });
    if (response.data?.success) {
      this.clearToken();
    }
    return response.data;
  }

  logout(): void {
    this.clearToken();
  }

  // Expense endpoints
  async parseExpenses(data: ParseExpenseRequest & { create?: boolean }): Promise<ParseExpenseResponse> {
    const response = await this.client.post<ParseExpenseResponse>('/api/expenses/parse', data);
    return response.data;
  }

  async enqueueParseExpenses(
    data: ParseExpenseRequest & {
      create?: boolean;
      localPreview?: Array<{
        description: string;
        amount: number;
        currency?: string;
        category?: string;
        date?: string;
        rawInput?: string;
      }>;
      clientBatchId?: string;
    },
    idempotencyKey?: string
  ): Promise<{ success: boolean; message: string; data: { jobId: string } }> {
    const response = await this.client.post('/api/expenses/parse/async', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    });
    return response.data;
  }

  async getParseJobStatus(
    jobId: string
  ): Promise<{ success: boolean; data: { jobId: string; status: string; result?: unknown; error?: string } }> {
    const response = await this.client.get(`/api/expenses/parse/jobs/${jobId}`);
    return response.data;
  }

  async createExpense(data: {
    description: string;
    amount: number;
    currency?: string;
    category?: string;
    date?: string;
    rawInput?: string;
  }): Promise<{ success: boolean; message: string; data: { expense: Expense } }> {
    const response = await this.client.post('/api/expenses', data);
    return response.data;
  }

  /** Create many expenses in ONE request (avoids per-item rate-limit pressure). */
  async createExpensesBatch(
    expenses: Array<{
      description: string;
      amount: number;
      currency?: string;
      category?: string;
      date?: string;
      rawInput?: string;
    }>
  ): Promise<{ success: boolean; message: string; data: { expenses: Expense[] } }> {
    const response = await this.client.post('/api/expenses/batch', { expenses });
    return response.data;
  }

  async getExpenses(filters?: ExpenseFilters): Promise<ExpensesResponse> {
    const response = await this.client.get<ExpensesResponse>('/api/expenses', {
      params: filters,
    });
    return response.data;
  }

  async getExpenseById(id: string): Promise<{ success: boolean; data: { expense: Expense } }> {
    const response = await this.client.get(`/api/expenses/${id}`);
    return response.data;
  }

  async updateExpense(
    id: string,
    data: UpdateExpenseRequest
  ): Promise<{ success: boolean; message: string; data: { expense: Expense } }> {
    const response = await this.client.patch(`/api/expenses/${id}`, data);
    return response.data;
  }

  async deleteExpense(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.delete(`/api/expenses/${id}`);
    return response.data;
  }

  async exportExpenses(format: 'csv' | 'pdf', from?: string, to?: string): Promise<Blob> {
    const response = await this.client.get('/api/expenses/export', {
      params: { format, from, to },
      responseType: 'blob',
    });
    return response.data;
  }

  // Budget endpoints
  async setBudget(payload: { month: number; year: number; total_limit: number }): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{ success: boolean; message: string }>('/api/budgets', payload);
    return response.data;
  }

  async getCurrentBudget(params?: { month?: number; year?: number }): Promise<{ success: boolean; data: BudgetSummary | null }> {
    const response = await this.client.get<{ success: boolean; data: BudgetSummary | null }>('/api/budgets/current', { params });
    return response.data;
  }

  async getBudgetHistory(limit: number = 6): Promise<{ success: boolean; data: BudgetSummary[] }> {
    const response = await this.client.get<{ success: boolean; data: BudgetSummary[] }>('/api/budgets/history', {
      params: { limit },
    });
    return response.data;
  }

  async deleteBudget(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.delete<{ success: boolean; message: string }>(`/api/budgets/${id}`);
    return response.data;
  }

  // Category budget endpoints
  async parseCategoryBudgets(
    text: string,
    month?: number,
    year?: number
  ): Promise<{ success: boolean; data: { items: { category: string; limit: number }[] } }> {
    const response = await this.client.post('/api/budgets/categories/parse', {
      text,
      month,
      year,
    });
    return response.data;
  }

  async upsertCategoryBudgets(payload: {
    month: number;
    year: number;
    items: { category: string; limit: number }[];
  }): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post('/api/budgets/categories', payload);
    return response.data;
  }

  async getCurrentCategoryBudgets(params?: { month?: number; year?: number }): Promise<{ success: boolean; data: CategoryBudgetProgress[] }> {
    const response = await this.client.get('/api/budgets/categories/current', { params });
    return response.data;
  }

  async getCategorySummary(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<CategorySummaryResponse> {
    const response = await this.client.get<CategorySummaryResponse>('/api/expenses/summary', {
      params: filters,
    });
    return response.data;
  }

  async getSimilarExpenses(
    id: string
  ): Promise<{
    success: boolean;
    data: { similar: Array<Expense & { similarity: number }> };
  }> {
    const response = await this.client.get(`/api/expenses/${id}/similar`);
    return response.data;
  }

  async getRecurringExpenses(): Promise<{
    success: boolean;
    data: {
      recurring: Array<{
        description: string;
        category: string;
        averageAmount: number;
        currency: string;
        occurrences: number;
        monthsSeen: number;
        lastDate: string;
      }>;
      windowMonths: number;
    };
  }> {
    const response = await this.client.get('/api/expenses/recurring');
    return response.data;
  }

  // Insight endpoints
  async generateInsights(): Promise<GenerateInsightsResponse> {
    const response = await this.client.post<GenerateInsightsResponse>('/api/insights/generate');
    return response.data;
  }

  async getInsights(filters?: {
    type?: string;
    limit?: number;
  }): Promise<InsightsResponse> {
    const response = await this.client.get<InsightsResponse>('/api/insights', {
      params: filters,
    });
    return response.data;
  }

  // AI Advisor (Assistant) endpoints
  async askAssistant(
    question: string,
    history?: AssistantMessage[]
  ): Promise<{ success: boolean; data: AssistantAnswer }> {
    const response = await this.client.post('/api/assistant/ask', { question, history });
    return response.data;
  }

  async askAssistantWhy(): Promise<{ success: boolean; data: AssistantAnswer }> {
    const response = await this.client.post('/api/assistant/why');
    return response.data;
  }

  async createSavingsPlan(
    targetAmount: number
  ): Promise<{ success: boolean; data: { plan: SavingsPlan; remainingFreeQuestions: number | null } }> {
    const response = await this.client.post('/api/assistant/savings-plan', { targetAmount });
    return response.data;
  }

  async searchExpensesSmart(q: string): Promise<{ success: boolean; data: AssistantSearchResult }> {
    const response = await this.client.get('/api/assistant/search', { params: { q } });
    return response.data;
  }

  // Savings goal endpoints
  async getGoals(): Promise<{ success: boolean; data: { goals: SavingsGoal[] } }> {
    const response = await this.client.get('/api/goals');
    return response.data;
  }

  async createGoal(data: {
    name: string;
    targetAmount: number;
    currency?: string;
    deadline?: string;
  }): Promise<{ success: boolean; message?: string; data: { goal: SavingsGoal } }> {
    const response = await this.client.post('/api/goals', data);
    return response.data;
  }

  async updateGoal(
    id: string,
    data: {
      name?: string;
      targetAmount?: number;
      deadline?: string;
      status?: 'active' | 'completed' | 'archived';
    }
  ): Promise<{ success: boolean; message?: string; data: { goal: SavingsGoal } }> {
    const response = await this.client.patch(`/api/goals/${id}`, data);
    return response.data;
  }

  async contributeToGoal(
    id: string,
    amount: number
  ): Promise<{ success: boolean; message?: string; data: { goal: SavingsGoal } }> {
    const response = await this.client.post(`/api/goals/${id}/contribute`, { amount });
    return response.data;
  }

  async deleteGoal(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await this.client.delete(`/api/goals/${id}`);
    return response.data;
  }

  // Spending intelligence endpoint
  async getSpendingIntelligence(): Promise<{ success: boolean; data: SpendingIntelligence }> {
    const response = await this.client.get('/api/insights/intelligence');
    return response.data;
  }

  // Weekly briefing endpoints
  async getLatestBriefing(): Promise<{ success: boolean; data: { briefing: WeeklyBriefing | null } }> {
    const response = await this.client.get('/api/insights/briefing/latest');
    return response.data;
  }

  async generateBriefing(): Promise<{
    success: boolean;
    message?: string;
    data: { briefing: WeeklyBriefing | null };
  }> {
    const response = await this.client.post('/api/insights/briefing/generate');
    return response.data;
  }

  // Category suggestion endpoint (if backend implements)
  async suggestCategory(description: string): Promise<{
    success: boolean;
    data: {
      suggestedCategories: Array<{
        category: string;
        confidence: number;
        reason?: string;
      }>;
    };
  }> {
    try {
      const response = await this.client.get('/api/expenses/suggest-category', {
        params: { description },
      });
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist yet, return empty
      return {
        success: false,
        data: { suggestedCategories: [] },
      };
    }
  }
}

export const api = new ApiClient();
