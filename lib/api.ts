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

  logout(): void {
    this.clearToken();
  }

  // Expense endpoints
  async parseExpenses(data: ParseExpenseRequest): Promise<ParseExpenseResponse> {
    const response = await this.client.post<ParseExpenseResponse>('/api/expenses/parse', data);
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
