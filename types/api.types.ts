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
// API error shape — matches backend HttpExceptionFilter output
// ---------------------------------------------------------------------------

/**
 * Structured error payload returned by the backend's HttpExceptionFilter.
 * Shape: { success: false, error: { code, message, details } }
 */
export interface ApiError {
  /** Machine-readable error code — e.g. "MILESTONE_NOT_FUNDED", "DUPLICATE_BID" */
  code: string;
  /** Human-readable message */
  message: string;
  /** Optional field-level validation details */
  details?: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
}
