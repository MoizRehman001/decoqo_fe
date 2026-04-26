/**
 * Auth API — real apiClient calls replacing all mockAuthApi functions.
 * Endpoints verified against Decoqo_be/apps/api/src/modules/auth/auth.controller.ts
 */

'use client';

import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { AuthUser } from '@/types/api.types';

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface RegisterResponse {
  userId: string;
  role: string;
  requiresOtpVerification: boolean;
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    role: string;
    displayName: string;
  };
}

export interface OtpResponse {
  message: string;
  expiresAt: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    role: string;
    displayName: string;
  };
}

export interface AdminLoginResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: string;
    displayName: string;
  };
}

// ---------------------------------------------------------------------------
// Request payload types
// ---------------------------------------------------------------------------

export interface RegisterCustomerPayload {
  email?: string;
  phone?: string;
  password: string;
  displayName: string;
  city?: string;
}

export interface RegisterVendorPayload {
  email?: string;
  phone?: string;
  password: string;
  displayName: string;
  businessName: string;
  city: string;
  serviceAreas?: string[];
  categories?: string[];
  verifiedEmailToken?: string;
  verifiedPhoneToken?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  /** Required for ADMIN / SUPER_ADMIN accounts */
  totpCode?: string;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
  totpCode: string;
}

// ---------------------------------------------------------------------------
// Auth API functions
// ---------------------------------------------------------------------------

export const authApi = {
  /**
   * Register a new customer account.
   * POST /api/v1/auth/register/customer
   */
  registerCustomer: (data: RegisterCustomerPayload): Promise<RegisterResponse> =>
    apiClient.post('/auth/register/customer', data),

  /**
   * Register a new vendor account.
   * POST /api/v1/auth/register/vendor
   */
  registerVendor: (data: RegisterVendorPayload): Promise<RegisterResponse> =>
    apiClient.post('/auth/register/vendor', data),

  /**
   * Send OTP to phone or email.
   * POST /api/v1/auth/otp/send
   */
  sendOtp: (identifier: string): Promise<OtpResponse> =>
    apiClient.post('/auth/otp/send', { identifier }),

  /**
   * Send OTP for passwordless login (only for verified accounts).
   * POST /api/v1/auth/otp/send-login
   */
  sendLoginOtp: (identifier: string): Promise<OtpResponse> =>
    apiClient.post('/auth/otp/send-login', { identifier }),

  /**
   * Verify OTP and login (passwordless).
   * POST /api/v1/auth/otp/verify-login
   */
  verifyLoginOtp: (identifier: string, otp: string): Promise<LoginResponse> =>
    apiClient.post('/auth/otp/verify-login', { identifier, otp }),

  /**
   * Verify OTP for a standalone identifier (pre-registration).
   * No user account required. Returns a verifiedToken.
   * POST /api/v1/auth/otp/verify-identifier
   */
  verifyIdentifier: (identifier: string, otp: string): Promise<{ verifiedToken: string }> =>
    apiClient.post('/auth/otp/verify-identifier', { identifier, otp }),

  /**
   * Verify OTP code (post-registration account activation).
   * POST /api/v1/auth/otp/verify
   */
  verifyOtp: (identifier: string, otp: string): Promise<VerifyOtpResponse> =>
    apiClient.post('/auth/otp/verify', { identifier, otp }),

  /**
   * Login with email/phone + password.
   * Admin accounts additionally require totpCode.
   * POST /api/v1/auth/login
   */
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const response: LoginResponse = await apiClient.post('/auth/login', data);
    const store = useAuthStore.getState();
    store.setAccessToken(response.accessToken);
    store.setUser({
      id: response.user.id,
      name: response.user.displayName,
      role: response.user.role as AuthUser['role'],
      email: '',
      isVerified: true,
    });
    return response;
  },

  /**
   * Admin-only login — email + password + TOTP in a single atomic request.
   * POST /api/v1/auth/admin/login
   * Sets refresh_token httpOnly cookie (4h TTL for admin).
   */
  adminLogin: async (data: AdminLoginPayload): Promise<AdminLoginResponse> => {
    const response: AdminLoginResponse = await apiClient.post('/auth/admin/login', data);
    const store = useAuthStore.getState();
    store.setAccessToken(response.accessToken);
    store.setUser({
      id: response.user.id,
      name: response.user.displayName,
      role: response.user.role as AuthUser['role'],
      email: response.user.email ?? '',
      isVerified: true,
    });
    return response;
  },

  /**
   * Get the current authenticated user's profile.
   * GET /api/v1/auth/me
   */
  getMe: (): Promise<AuthUser> => apiClient.get('/auth/me'),

  /**
   * Logout — revokes refresh token and clears cookie.
   * POST /api/v1/auth/logout
   */
  logout: (): Promise<{ loggedOut: boolean }> => apiClient.post('/auth/logout'),
};
