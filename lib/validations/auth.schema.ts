/**
 * Zod validation schemas for all authentication forms.
 *
 * AUTH-01: Customer registration — at least one of email/phone must be verified
 * AUTH-02: Vendor registration   — at least one of email/phone must be verified
 * AUTH-03: Login with email or phone + password
 * AUTH-04: OTP verification screen (6-digit)
 * AUTH-10: Policy acceptance on registration
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared field definitions
// ---------------------------------------------------------------------------

/**
 * Indian mobile number — bare 10 digits, must start with 6-9.
 * Empty string is treated as "not provided" (optional field).
 * Returns a clear error for invalid numbers like 1111111111.
 */
const indianPhone = z
  .string()
  .transform((v) => v.trim())
  .pipe(
    z.union([
      z.literal(''),
      z
        .string()
        .length(10, 'Mobile number must be exactly 10 digits')
        .regex(/^\d{10}$/, 'Mobile number must contain only digits')
        .regex(/^[6-9]/, 'Mobile number must start with 6, 7, 8, or 9'),
    ]),
  );

const requiredIndianPhone = z
  .string()
  .transform((v) => v.trim())
  .pipe(
    z
      .string()
      .min(1, 'Mobile number is required')
      .length(10, 'Mobile number must be exactly 10 digits')
      .regex(/^\d{10}$/, 'Mobile number must contain only digits')
      .regex(/^[6-9]/, 'Mobile number must start with 6, 7, 8, or 9'),
  );

const emailField = z
  .string()
  .transform((v) => v.trim().toLowerCase())
  .pipe(
    z.union([
      z.literal(''),
      z.string().email('Please enter a valid email address'),
    ]),
  );

const requiredEmailField = z
  .string()
  .transform((v) => v.trim().toLowerCase())
  .pipe(
    z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address'),
  );

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');

// ---------------------------------------------------------------------------
// Customer Registration Schema
// ---------------------------------------------------------------------------
//
// Rules:
//   - Email: optional but if provided must be valid and verified
//   - Phone: optional but if provided must be valid and verified
//   - At least one of email or phone must be provided AND verified
//

export const customerRegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be at most 100 characters')
      .trim(),

    email: emailField,
    emailVerified: z.boolean().default(false),
    verifiedEmailToken: z.string().optional(),

    phone: indianPhone,
    phoneVerified: z.boolean().default(false),
    verifiedPhoneToken: z.string().optional(),

    password: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),

    acceptedTerms: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Terms of Service and Privacy Policy',
    }),
  })
  // Passwords must match
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  // At least one identifier must be provided
  .refine((d) => d.email !== '' || d.phone !== '', {
    message: 'Please provide at least an email address or mobile number',
    path: ['email'],
  })
  // At least one identifier must be verified
  .refine((d) => d.emailVerified || d.phoneVerified, {
    message: 'Please verify at least your email address or mobile number',
    path: ['emailVerified'],
  })
  // If email is provided, it must be verified
  .refine((d) => d.email === '' || d.emailVerified, {
    message: 'Please verify your email address',
    path: ['emailVerified'],
  })
  // If phone is provided, it must be verified
  .refine((d) => d.phone === '' || d.phoneVerified, {
    message: 'Please verify your mobile number',
    path: ['phoneVerified'],
  });

export type CustomerRegisterFormData = z.infer<typeof customerRegisterSchema>;

// ---------------------------------------------------------------------------
// Vendor Registration Schema
// ---------------------------------------------------------------------------
//
// Rules:
//   - Phone: required, must be valid and verified
//   - Email: optional but if provided must be valid and verified
//   - At least phone must be verified (phone is primary for vendors)
//

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

    // Phone is required for vendors
    phone: requiredIndianPhone,
    phoneVerified: z.boolean().default(false),
    verifiedPhoneToken: z.string().optional(),

    // Email is optional for vendors
    email: emailField,
    emailVerified: z.boolean().default(false),
    verifiedEmailToken: z.string().optional(),

    city: z
      .string()
      .min(1, 'Please select your primary city')
      .max(100, 'City name is too long')
      .trim(),

    serviceAreas: z
      .array(z.string())
      .min(1, 'Please select at least one city you operate in'),

    categories: z
      .array(z.string())
      .min(1, 'Please select at least one service category'),

    password: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),

    acceptedTerms: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Terms of Service and Privacy Policy',
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  // Phone must be verified (it's required)
  .refine((d) => d.phoneVerified, {
    message: 'Please verify your mobile number',
    path: ['phoneVerified'],
  })
  // If email is provided, it must be verified
  .refine((d) => d.email === '' || d.emailVerified, {
    message: 'Please verify your email address',
    path: ['emailVerified'],
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
        const v = val.trim();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        const isPhone = /^[6-9]\d{9}$/.test(v);
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
