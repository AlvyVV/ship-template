import { getCookieValue } from './cookie';

/**
 * Extended RequestInit interface with includeAuth option
 */
interface ExtendedRequestInit extends RequestInit {
  includeAuth?: boolean;
}

class ApiClient {
  /**
   * Lazily-resolved base URL. It is determined on the first real API call (or when the env changes
   * during HMR) instead of being fixed at class construction. This avoids the "baseUrl = ''" issue
   * when the module is instantiated before NEXT_PUBLIC_API_BASE_URL is actually defined.
   */
  private cachedBaseUrl: string | null = null;

  constructor() {
    // No eager resolution here; defer to resolveBaseUrl when actually needed.
    if (!process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NODE_ENV === 'development') {
      console.warn('[api-client] NEXT_PUBLIC_API_BASE_URL is not defined at construct time; will fall back to http://localhost:8080 when requests are made.');
    }
  }

  /**
   * Resolve (or re-resolve) the effective base URL.
   * – Reads `process.env.NEXT_PUBLIC_API_BASE_URL` each time (important for HMR in dev mode)
   * – Falls back to `http://localhost:8080` when absent
   * – Removes trailing slash for predictable concatenation
   */
  private resolveBaseUrl(): string {
    const envBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
    const resolved = (envBaseUrl || 'http://localhost:8080').replace(/\/$/, '');

    // Update cache if changed or first time.
    if (this.cachedBaseUrl !== resolved) {
      this.cachedBaseUrl = resolved;

      if (process.env.NODE_ENV === 'development') {
        console.info('[api-client] Using API base URL:', this.cachedBaseUrl);
      }
    }

    return this.cachedBaseUrl;
  }

  /**
   * Get token from cookies
   * @returns token string or null
   */
  private getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;

    const directToken = getCookieValue('auth_token');
    console.log('directToken', directToken);
    if (directToken) {
      return directToken;
    }

    try {
      const userInfoCookie = getCookieValue('user_info');
      if (userInfoCookie) {
        const userInfo = JSON.parse(decodeURIComponent(userInfoCookie));
        if (userInfo.token) {
          return userInfo.token;
        }
      }
    } catch (e) {
      return null;
    }

    return null;
  }

  /**
   * Build headers with automatic token injection
   * @param additionalHeaders Additional headers to merge
   * @param includeAuth Whether to include authentication token
   * @returns Headers object
   */
  private buildHeaders(additionalHeaders: HeadersInit = {}, includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };

    console.log('includeAuth', includeAuth);
    // Get token from cookies and add Authorization header if available and requested
    if (includeAuth) {
      const token = this.getTokenFromCookie();
      console.log('token', token);
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Determine if endpoint is internal API route or external API
   * @param endpoint API endpoint
   * @returns true if internal API route
   */
  private isInternalApiRoute(endpoint: string): boolean {
    return endpoint.startsWith('/api/') || endpoint.startsWith('api/');
  }

  /**
   * Build full URL for the request
   * @param endpoint API endpoint
   * @returns Full URL
   */
  private buildUrl(endpoint: string): string {
    // If it's already a full URL, return as is
    if (endpoint.startsWith('http')) {
      return endpoint;
    }

    // If it's an internal API route, use relative path
    if (this.isInternalApiRoute(endpoint)) {
      return endpoint;
    }

    // For external API calls, use lazily-resolved base URL
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.resolveBaseUrl()}${cleanEndpoint}`;
  }

  /**
   * Generic request method
   * @param endpoint API endpoint (relative to base URL or internal API route)
   * @param options Fetch options
   * @returns Promise<Response>
   */
  private async request(endpoint: string, options: ExtendedRequestInit = {}): Promise<Response> {
    const url = this.buildUrl(endpoint);

    // Check if user explicitly set includeAuth in options
    const explicitIncludeAuth = options.includeAuth;

    // Default to true for all requests unless explicitly set to false
    const includeAuth = explicitIncludeAuth !== undefined ? explicitIncludeAuth : true;

    const config: RequestInit = {
      ...options,
      headers: this.buildHeaders(options.headers, includeAuth),
    };

    // Remove includeAuth from options as it's not a standard fetch option
    delete (config as any).includeAuth;

    try {
      const response = await fetch(url, config);
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   * @param endpoint API endpoint
   * @param options Additional fetch options (includeAuth?: boolean can be used to control token injection)
   * @returns Promise<T>
   */
  async get<T = any>(endpoint: string, options: Omit<ExtendedRequestInit, 'method'> = {}): Promise<T> {
    const response = await this.request(endpoint, { ...options, method: 'GET' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * POST request
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional fetch options (includeAuth?: boolean can be used to control token injection)
   * @returns Promise<T>
   */
  async post<T = any>(endpoint: string, data?: any, options: Omit<ExtendedRequestInit, 'method' | 'body'> = {}): Promise<T> {
    const response = await this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * PUT request
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional fetch options (includeAuth?: boolean can be used to control token injection)
   * @returns Promise<T>
   */
  async put<T = any>(endpoint: string, data?: any, options: Omit<ExtendedRequestInit, 'method' | 'body'> = {}): Promise<T> {
    const response = await this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * PATCH request
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional fetch options (includeAuth?: boolean can be used to control token injection)
   * @returns Promise<T>
   */
  async patch<T = any>(endpoint: string, data?: any, options: Omit<ExtendedRequestInit, 'method' | 'body'> = {}): Promise<T> {
    const response = await this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * DELETE request
   * @param endpoint API endpoint
   * @param options Additional fetch options (includeAuth?: boolean can be used to control token injection)
   * @returns Promise<T>
   */
  async delete<T = any>(endpoint: string, options: Omit<ExtendedRequestInit, 'method'> = {}): Promise<T> {
    const response = await this.request(endpoint, { ...options, method: 'DELETE' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Raw request for special cases (returns Response object)
   * @param endpoint API endpoint
   * @param options Fetch options (includeAuth?: boolean can be used to control token injection)
   * @returns Promise<Response>
   */
  async raw(endpoint: string, options: ExtendedRequestInit = {}): Promise<Response> {
    return this.request(endpoint, options);
  }

  /**
   * Request with explicit auth token injection (useful for internal routes that need auth)
   * @param endpoint API endpoint
   * @param options Fetch options
   * @returns Promise<Response>
   */
  async requestWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, { ...options, includeAuth: true });
  }

  /**
   * Request without auth token (useful when you explicitly don't want auth)
   * @param endpoint API endpoint
   * @param options Fetch options
   * @returns Promise<Response>
   */
  async requestWithoutAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, { ...options, includeAuth: true });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };

// Helper function for quick access
export const api = apiClient;
