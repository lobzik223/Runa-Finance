import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Определение базового URL API в зависимости от платформы
const getApiBaseUrl = (): string => {
  if (!__DEV__) {
    // Production URL
    return 'https://your-production-api.com/api';
  }

  // Можно переопределить через переменную окружения
  const customApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (customApiUrl) {
    return customApiUrl;
  }

  // Development URLs в зависимости от платформы
  if (Platform.OS === 'android') {
    // Android эмулятор использует 10.0.2.2 для доступа к localhost хоста
    // Для физического устройства замените на IP вашего компьютера
    return 'http://10.0.2.2:3000/api';
  } else if (Platform.OS === 'ios') {
    // iOS симулятор на Windows не может использовать localhost для Docker контейнеров
    // Используем IP адрес хоста (замените на ваш IP если отличается)
    // Для автоматического определения можно использовать: ipconfig (Windows) или ifconfig (Mac/Linux)
    return 'http://192.168.0.171:3000/api';
  } else {
    // Web или другие платформы
    return 'http://localhost:3000/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

// Ключ для хранения токена
const TOKEN_KEY = '@runa_finance:token';
const REFRESH_TOKEN_KEY = '@runa_finance:refresh_token';
const USER_KEY = '@runa_finance:user';

// Интерфейсы
export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
  deviceId?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export type BackendTransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: number;
  type: BackendTransactionType;
  name: string;
  iconKey?: string | null;
  parentId?: number | null;
  sortOrder?: number;
  isSystem?: boolean;
}

export type BackendPaymentMethodType = 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_ACCOUNT' | 'OTHER';

export interface PaymentMethod {
  id: number;
  type: BackendPaymentMethodType;
  name: string;
  iconKey?: string | null;
  sortOrder?: number;
  isSystem?: boolean;
  creditAccountId?: number | null;
}

export interface CreditAccount {
  id: number;
  kind: 'CREDIT_CARD' | 'LOAN';
  name: string;
  currency: string;
  principal?: number | null;
  currentBalance: number;
  creditLimit?: number | null;
  billingDay?: number | null;
  interestRate?: number | null;
  paymentDay?: number | null;
  nextPaymentAt?: string | null;
  minimumPayment?: number | null;
}

export interface DepositAccount {
  id: number;
  name: string;
  currency: string;
  principal: number;
  interestRate: number;
  payoutSchedule: 'MONTHLY' | 'QUARTERLY' | 'AT_MATURITY' | 'CUSTOM';
  nextPayoutAt?: string | null;
  maturityAt?: string | null;
}

export interface GoalContribution {
  id: string;
  amount: number;
  currency: string;
  occurredAt?: string | null;
  note?: string | null;
  createdAt?: string | null;
}

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currency: string;
  targetDate?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELED';
  createdAt?: string | null;
  updatedAt?: string | null;
  currentAmount: number;
  remainingAmount: number;
  progressPercent: number;
  contributions: GoalContribution[];
}

export type InvestmentAssetType = 'STOCK' | 'BOND' | 'ETF' | 'CRYPTO' | 'OTHER';

export interface InvestmentPortfolioAsset {
  assetId: number;
  symbol: string;
  name: string;
  assetType: string;
  currency: string;
  exchange?: string | null;
  totalQuantity: number;
  averageBuyPrice: number;
  totalCost: number;
  currentValue: number | null;
  pnlValue: number | null;
  pnlPercent?: number | null;
}

export interface InvestmentsPortfolioResponse {
  assets: InvestmentPortfolioAsset[];
  totalCost: number;
  totalCurrentValue: number | null;
  totalPnlValue: number | null;
  totalPnlPercent: number | null;
}

export interface MarketNewsItem {
  id: string;
  title: string;
  content: string;
  source?: string | null;
  sourceUrl?: string | null;
  publishedAt: string; // ISO in app
}

export interface AiChatResponse {
  message: string;
  threadId: string;
  messageId: string;
  chartData?: {
    chartType: 'donut';
    incomeTotal: number;
    expenseTotal: number;
    incomeByCategory: Array<{ name: string; value: number }>;
    expenseByCategory: Array<{ name: string; value: number }>;
    dateRange: { start: string; end: string };
  };
}

export interface Transaction {
  id: string; // bigint serialized as string
  type: BackendTransactionType;
  amount: number;
  currency: string;
  occurredAt: string;
  note?: string | null;
  categoryId?: number | null;
  paymentMethodId?: number | null;
  category?: { id: number; name: string } | null;
  paymentMethod?: { id: number; name: string } | null;
}

export interface ListTransactionsResponse {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransactionsAnalyticsResponse {
  period: { from: string; to: string; timezone: string };
  totals: { income: number; expense: number; total: number };
  donutChart: { incomePercent: number; expensePercent: number };
  breakdown: {
    income: Array<{ categoryId: number; categoryName: string; amount: number; percent: number }>;
    expense: Array<{ categoryId: number; categoryName: string; amount: number; percent: number }>;
  };
}

export interface PinStatusResponse {
  pinSet: boolean;
  pinLength: 4 | 6;
  biometricEnabled: boolean;
  failedAttempts: number;
  lockedUntil: string | null;
  lastVerifiedAt: string | null;
}

// Класс для работы с API
class ApiService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Получение токена из хранилища
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Ошибка получения токена:', error);
      return null;
    }
  }

  // Сохранение токена
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Ошибка сохранения токена:', error);
      throw error;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Ошибка получения refresh токена:', error);
      return null;
    }
  }

  async saveRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Ошибка сохранения refresh токена:', error);
      throw error;
    }
  }

  // Сохранение данных пользователя
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Ошибка сохранения пользователя:', error);
      throw error;
    }
  }

  // Получение данных пользователя
  async getUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      return null;
    }
  }

  // Удаление токена и пользователя (выход)
  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    } catch (error) {
      console.error('Ошибка очистки данных:', error);
      throw error;
    }
  }

  private buildHeaders(base: RequestInit['headers'] | undefined, token?: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(base as Record<string, string> | undefined),
    };

    // Keep in sync with backend default (docker-compose APP_KEY)
    const appKey = process.env.EXPO_PUBLIC_APP_KEY || 'runa_dev_app_key_change_me';
    if (appKey) headers['X-Runa-App-Key'] = appKey;

    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async rawRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    tokenOverride?: string | null,
    meta?: { silent?: boolean },
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(options.headers, tokenOverride);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let data: any;
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      let errorMessage = data.message || data.error || 'Ошибка запроса';
      if (Array.isArray(data.message)) {
        errorMessage = data.message
          .map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.constraints) return Object.values(err.constraints).join(', ');
            return err.property ? `${err.property}: ${Object.values(err.constraints || {}).join(', ')}` : JSON.stringify(err);
          })
          .join('\n');
      }
      if (!meta?.silent) console.error(`[API Error] ${response.status}:`, data);
      throw new Error(errorMessage);
    }

    return data as T;
  }

  private async refreshAccessToken(): Promise<void> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) throw new Error('Unauthorized');

    const res = await this.rawRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
    }, refreshToken);

    await this.saveToken(res.token);
    if (res.refreshToken) {
      await this.saveRefreshToken(res.refreshToken);
    }
  }

  // Базовый метод для запросов
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Логируем только метод и endpoint (без тела запроса с паролем)
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    
    try {
      const token = await this.getToken();
      try {
        const data = await this.rawRequest<T>(endpoint, options, token);
        console.log(`[API Success] ${options.method || 'GET'} ${endpoint}`);
        return data;
      } catch (e: any) {
        // If unauthorized and we have refresh token, refresh once and retry
        if (e?.message?.toLowerCase?.().includes('unauthorized')) {
          try {
            await this.refreshAccessToken();
            const newToken = await this.getToken();
            const data = await this.rawRequest<T>(endpoint, options, newToken);
            console.log(`[API Success] retry ${options.method || 'GET'} ${endpoint}`);
            return data;
          } catch {
            // fallthrough to original error handling
          }
        }
        throw e;
      }
    } catch (error: any) {
      console.error(`[API Error] ${endpoint}:`, error);
      
      // Более понятные сообщения об ошибках
      if (error.message === 'Network request failed' || error.message?.includes('Network')) {
        throw new Error(
          `Не удалось подключиться к серверу. Убедитесь, что:\n` +
          `1. Бэкенд запущен (npm run dev в папке backend-runa)\n` +
          `2. URL правильный: ${url}\n` +
          `3. Для физического устройства используйте IP адрес компьютера`
        );
      }
      
      throw error;
    }
  }

  private buildQuery(params: Record<string, string | number | undefined | null>): string {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && `${v}`.length > 0);
    if (entries.length === 0) return '';
    const qs = entries
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    return `?${qs}`;
  }

  // Регистрация
  async register(data: RegisterData): Promise<AuthResponse> {
    // Подготовка данных: удаляем пустые опциональные поля
    const requestData: any = {
      name: data.name,
      email: data.email,
      password: data.password,
    };

    // Добавляем опциональные поля только если они не пустые
    if (data.referralCode?.trim()) {
      requestData.referralCode = data.referralCode.trim();
    }
    if (data.deviceId?.trim()) {
      requestData.deviceId = data.deviceId.trim();
    }

    // Логируем только безопасные данные (без пароля)
    const safeLogData: any = { 
      name: requestData.name, 
      email: requestData.email,
    };
    if (requestData.referralCode) {
      safeLogData.referralCode = requestData.referralCode;
    }
    if (requestData.deviceId) {
      safeLogData.deviceId = requestData.deviceId;
    }
    console.log('[API] Регистрация пользователя:', safeLogData);
    
    // JSON.stringify не включает undefined поля — достаточно этого
    const requestBody = JSON.stringify(requestData);

    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: requestBody,
    });

    // Сохраняем токен и пользователя
    await this.saveToken(response.token);
    if (response.refreshToken) await this.saveRefreshToken(response.refreshToken);
    await this.saveUser(response.user);

    return response;
  }

  // Вход
  async login(data: LoginData): Promise<AuthResponse> {
    // Логируем только email (без пароля)
    console.log('[API] Вход пользователя:', { 
      email: data.email
    });

    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Сохраняем токен и пользователя
    await this.saveToken(response.token);
    if (response.refreshToken) await this.saveRefreshToken(response.refreshToken);
    await this.saveUser(response.user);

    return response;
  }

  // Получение информации о текущем пользователе
  async getMe(): Promise<{ user: User; referralCode?: string }> {
    return await this.request<{ user: User; referralCode?: string }>('/auth/me');
  }

  async updateProfile(params: { name?: string }): Promise<{ user: User; referralCode?: string }> {
    const body = JSON.stringify(params);

    const attempt = async (token: string | null) => {
      return await this.rawRequest<{ user: User; referralCode?: string }>(
        '/auth/me',
        { method: 'PATCH', body },
        token,
        { silent: true },
      );
    };

    try {
      const token = await this.getToken();
      return await attempt(token);
    } catch (e: any) {
      const msg = String(e?.message || '');

      // Backend not rebuilt yet (older container). Don't spam logs; show a clear message.
      if (msg.includes('Cannot PATCH') || msg.includes('404')) {
        throw new Error('Сервер ещё не обновлён. Перезапусти backend (docker-compose up --build), и смена ника заработает.');
      }

      // If unauthorized, try refresh once and retry
      if (msg.toLowerCase().includes('unauthorized')) {
        try {
          await this.refreshAccessToken();
          const newToken = await this.getToken();
          return await attempt(newToken);
        } catch {
          // fallthrough
        }
      }

      throw e;
    }
  }

  async listCategories(params: { type?: BackendTransactionType } = {}): Promise<Category[]> {
    const query = this.buildQuery(params as any);
    return await this.request<Category[]>(`/categories${query}`);
  }

  async listPaymentMethods(params: { type?: BackendPaymentMethodType } = {}): Promise<PaymentMethod[]> {
    const query = this.buildQuery(params as any);
    return await this.request<PaymentMethod[]>(`/payment-methods${query}`);
  }

  async listCreditAccounts(): Promise<CreditAccount[]> {
    return await this.request<CreditAccount[]>('/credit-accounts');
  }

  async createCreditAccount(params: {
    kind: 'CREDIT_CARD' | 'LOAN';
    name: string;
    currency?: string;
    principal?: number;
    currentBalance?: number;
    creditLimit?: number;
    billingDay?: number;
    interestRate?: number;
    paymentDay?: number;
    nextPaymentAt?: string;
    minimumPayment?: number;
    openedAt?: string;
  }): Promise<CreditAccount> {
    return await this.request<CreditAccount>('/credit-accounts', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async listDepositAccounts(): Promise<DepositAccount[]> {
    return await this.request<DepositAccount[]>('/deposit-accounts');
  }

  async createDepositAccount(params: {
    name: string;
    currency?: string;
    principal: number;
    interestRate: number;
    payoutSchedule?: 'MONTHLY' | 'QUARTERLY' | 'AT_MATURITY' | 'CUSTOM';
    nextPayoutAt?: string;
    maturityAt?: string;
  }): Promise<DepositAccount> {
    return await this.request<DepositAccount>('/deposit-accounts', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async listGoals(): Promise<Goal[]> {
    return await this.request<Goal[]>('/goals');
  }

  async createGoal(params: {
    name: string;
    targetAmount: number;
    currency?: string;
    targetDate?: string;
  }): Promise<Goal> {
    return await this.request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async updateGoal(id: number, params: { name?: string; targetAmount?: number; currency?: string; targetDate?: string | null }): Promise<Goal> {
    return await this.request<Goal>(`/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(params),
    });
  }

  async deleteGoal(id: number): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/goals/${id}`, { method: 'DELETE' });
  }

  async addGoalContribution(id: number, params: { amount: number; currency?: string; occurredAt?: string; note?: string }): Promise<Goal> {
    return await this.request<Goal>(`/goals/${id}/contributions`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getInvestmentsPortfolio(): Promise<InvestmentsPortfolioResponse> {
    return await this.request<InvestmentsPortfolioResponse>('/investments/portfolio');
  }

  async addInvestmentAsset(params: { tickerOrName: string; assetType?: InvestmentAssetType; exchange?: string }) {
    return await this.request('/investments/assets', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async addInvestmentLot(params: { assetId: number; quantity: number; pricePerUnit: number; fees?: number; boughtAt: string }) {
    return await this.request('/investments/lots', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getInvestmentAsset(assetId: number): Promise<any> {
    return await this.request(`/investments/assets/${assetId}`);
  }

  async deleteInvestmentAsset(assetId: number): Promise<void> {
    return await this.request<void>(`/investments/assets/${assetId}`, {
      method: 'DELETE',
    });
  }

  async getTinkoffPrice(figi: string): Promise<{ success: boolean; price?: number; currency?: string; error?: string }> {
    const queryParams = this.buildQuery({ figi });
    return await this.request(`/tinkoff-invest/price${queryParams}`);
  }

  async getMarketNews(limit: number = 10): Promise<MarketNewsItem[]> {
    const query = this.buildQuery({ limit });
    const res = await this.request<any[]>(`/market-news${query}`, { method: 'GET' });
    return res.map((n) => ({
      ...n,
      publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString() : new Date().toISOString(),
    }));
  }

  async sendAiMessage(params: { message: string; threadId?: string }): Promise<AiChatResponse> {
    return await this.request<AiChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Transactions analytics (totals + donut + breakdown)
  async getTransactionsAnalytics(params: { from?: string; to?: string; timezone?: string } = {}): Promise<TransactionsAnalyticsResponse> {
    const query = this.buildQuery(params);
    return await this.request<TransactionsAnalyticsResponse>(`/transactions/analytics${query}`);
  }

  // List transactions (paged)
  async listTransactions(params: {
    page?: number;
    limit?: number;
    type?: BackendTransactionType;
    from?: string;
    to?: string;
    timezone?: string;
  } = {}): Promise<ListTransactionsResponse> {
    const query = this.buildQuery(params as any);
    return await this.request<ListTransactionsResponse>(`/transactions${query}`);
  }

  // Create transaction
  async createTransaction(params: {
    type: BackendTransactionType;
    amount: number;
    currency?: string;
    occurredAt: string;
    note?: string;
    categoryId?: number;
    paymentMethodId?: number;
  }): Promise<Transaction> {
    return await this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Delete transaction
  async deleteTransaction(id: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Проверка подключения к API
  async healthCheck(): Promise<{ status: string; message: string }> {
    return await this.request<{ status: string; message: string }>('/health');
  }

  // PIN status
  async getPinStatus(): Promise<PinStatusResponse> {
    return await this.request<PinStatusResponse>('/pin/status');
  }

  // Tinkoff Invest integration
  async setTinkoffToken(params: { token: string; useSandbox?: boolean }): Promise<{ message: string }> {
    return await this.request<{ message: string }>('/tinkoff-invest/token', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async removeTinkoffToken(): Promise<void> {
    return await this.request<void>('/tinkoff-invest/token', {
      method: 'DELETE',
    });
  }

  async getTinkoffPortfolio(): Promise<{
    success: boolean;
    account_id?: string;
    portfolio: Array<{
      figi: string;
      ticker: string;
      name: string;
      type: string;
      quantity: number;
      average_price: number;
      current_price: number;
      total_cost: number;
      current_value: number;
      pnl: number;
      pnl_percent: number;
    }>;
    total_value: number;
    total_cost: number;
    total_pnl: number;
    total_pnl_percent: number;
    error?: string;
  }> {
    return await this.request('/tinkoff-invest/portfolio');
  }

  async getTinkoffAccounts(): Promise<{
    success: boolean;
    accounts: Array<{
      id: string;
      type: string;
      name: string;
      status: string;
      opened_date?: string;
    }>;
    error?: string;
  }> {
    return await this.request('/tinkoff-invest/accounts');
  }

  async searchTinkoffInstruments(query: string): Promise<{
    success: boolean;
    instruments: Array<{
      figi: string;
      ticker: string;
      name: string;
      type: string;
      currency: string;
    }>;
    error?: string;
  }> {
    const queryParams = this.buildQuery({ query });
    try {
      return await this.request(`/tinkoff-invest/search${queryParams}`);
    } catch (e: any) {
      // Не падаем UI, если backend ещё не обновлён (404) или временно недоступен
      const msg = String(e?.message || 'Не удалось выполнить поиск');
      return { success: false, instruments: [], error: msg };
    }
  }

  async syncTinkoffPortfolio(): Promise<{ synced: number; errors: number }> {
    return await this.request<{ synced: number; errors: number }>(`/tinkoff-invest/sync`, {
      method: 'POST',
    });
  }

  // Set PIN (4 or 6 digits)
  async setPin(params: { pin: string; biometricEnabled?: boolean; pinLength?: 4 | 6 }): Promise<{ message: string }> {
    return await this.request<{ message: string }>('/pin/set', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Verify PIN
  async verifyPin(params: { pin: string }): Promise<{ message: string; pinLength: 4 | 6; biometricEnabled: boolean }> {
    return await this.request<{ message: string; pinLength: 4 | 6; biometricEnabled: boolean }>('/pin/verify', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

// Экспортируем единственный экземпляр
export const apiService = new ApiService();
export default apiService;

