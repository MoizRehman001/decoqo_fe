/**
 * Auth API module — wraps mock functions in dev, real API calls in production.
 * All components import from here, never directly from mockData.
 */

import { mockAuthApi } from '@/mock/mockData';
import type {
  RegisterCustomerPayload,
  RegisterVendorPayload,
  LoginPayload,
  AuthResponse,
  OtpResponse,
} from '@/mock/mockData';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || process.env.NODE_ENV === 'development';

export const authApi = {
  registerCustomer: async (data: RegisterCustomerPayload): Promise<AuthResponse> => {
    if (USE_MOCK) return mockAuthApi.registerCustomer(data);
    // TODO: replace with real API call
    // return apiClient.post('/auth/register/customer', data);
    return mockAuthApi.registerCustomer(data);
  },

  registerVendor: async (data: RegisterVendorPayload): Promise<AuthResponse> => {
    if (USE_MOCK) return mockAuthApi.registerVendor(data);
    return mockAuthApi.registerVendor(data);
  },

  login: async (data: LoginPayload): Promise<AuthResponse> => {
    if (USE_MOCK) return mockAuthApi.login(data);
    return mockAuthApi.login(data);
  },

  sendOtp: async (email: string): Promise<OtpResponse> => {
    if (USE_MOCK) return mockAuthApi.sendOtp(email);
    return mockAuthApi.sendOtp(email);
  },

  verifyOtp: async (email: string, otp: string): Promise<AuthResponse> => {
    if (USE_MOCK) return mockAuthApi.verifyOtp(email, otp);
    return mockAuthApi.verifyOtp(email, otp);
  },

  verifyAdminTotp: async (email: string, totp: string): Promise<AuthResponse> => {
    if (USE_MOCK) return mockAuthApi.verifyAdminTotp(email, totp);
    return mockAuthApi.verifyAdminTotp(email, totp);
  },

  logout: async (): Promise<void> => {
    if (USE_MOCK) return mockAuthApi.logout();
    return mockAuthApi.logout();
  },
};

export type { RegisterCustomerPayload, RegisterVendorPayload, LoginPayload, AuthResponse, OtpResponse };
