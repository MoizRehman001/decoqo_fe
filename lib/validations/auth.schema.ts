/**
 * Zod validation schemas for all authentication forms.
 *
 * AUTH-01: Customer registration with email/phone + password + OTP verification
 * AUTH-02: Vendor registration with business details + OTP verification
 * AUTH-03: Login with email or phone + password
 * AUTH-04: OTP verification screen (6-digit)
 * AUTH-10: Policy acceptance on registration (Terms + Privacy Policy)
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Customer Registration Schema
// ---------------------------------------------------------------------------

export const customerRegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be at most 100 characters')
      .trim(),

    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),

    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number')
      .optional()
      .or(z.literal('')),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),

    confirmPassword: z.string().min(1, 'Please confirm your password'),

    acceptedTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must accept the Terms of Service and Privacy Policy to continue',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type CustomerRegisterFormData = z.infer<typeof customerRegisterSchema>;

// ---------------------------------------------------------------------------
// Vendor Registration Schema
// ---------------------------------------------------------------------------

export const vendorRegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be at most 100 characters')
      .trim(),

    businessName: z
      .string()
      .min(2, 'Business name must be at least 2 characters')
      .max(150, 'Business name must be at most 150 characters')
      .trim(),

    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),

    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),

    city: z
      .string()
      .min(2, 'City is required')
      .max(100, 'City name is too long')
      .trim(),

    categories: z
      .array(z.string())
      .min(1, 'Please select at least one service category'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),

    confirmPassword: z.string().min(1, 'Please confirm your password'),

    acceptedTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must accept the Terms of Service and Privacy Policy to continue',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type VendorRegisterFormData = z.infer<typeof vendorRegisterSchema>;

// ---------------------------------------------------------------------------
// Login Schema
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or phone number is required')
    .refine(
      (val) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isPhone = /^[6-9]\d{9}$/.test(val);
        return isEmail || isPhone;
      },
      { message: 'Please enter a valid email address or 10-digit mobile number' },
    ),

  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// OTP Verification Schema
// ---------------------------------------------------------------------------

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export type OtpFormData = z.infer<typeof otpSchema>;
