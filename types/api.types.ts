/**
 * Shared API types used across the application.
 *
 * AUTH-05: JWT access token stored in memory (never localStorage)
 * AUTH-07: Role-based route protection (CUSTOMER/VENDOR/ADMIN/SUPER_ADMIN)
 */

// ---------------------------------------------------------------------------
// User / Auth
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';
  isVerified: boolean;
}

// ---------------------------------------------------------------------------
// Generic API response envelope
// ---------------------------------------------------------------------------

/**
 * Standard success envelope returned by the NestJS backend.
 * The response-transform interceptor wraps all responses as:
 * { success: true, data: T, message?: string }
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ---------------------------------------------------------------------------
// API error shape
// ---------------------------------------------------------------------------

/**
 * Structured error payload returned by the backend's HttpExceptionFilter.
 */
export interface ApiError {
  statusCode: number;
  message: string;
  /** Machine-readable error code (e.g. "INVALID_CREDENTIALS") */
  code?: string;
  /** Field-level validation errors */
  errors?: Record<string, string[]>;
}
