// ============================================================
// Central Zod Schemas for API Validation
// ============================================================

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string('Email and password are required.')
    .trim()
    .min(1, 'Email and password are required.')
    .email('Please enter a valid email address.'),
  password: z.string('Email and password are required.')
    .min(1, 'Email and password are required.'),
}).passthrough();

export const refreshSchema = z.object({
  refreshToken: z.string('Refresh token is required.')
    .min(1, 'Refresh token is required.'),
}).passthrough();

export const eventCreateSchema = z.object({
  name: z.string('Event name is required.')
    .trim()
    .min(1, 'Event name is required.')
    .max(120, 'Event name cannot exceed 120 characters.'),
  clientName: z.string().trim().max(160).optional(),
  location: z.string().trim().max(160).optional(),
  startDate: z.any().optional(),
  endDate: z.any().optional(),
  templateIds: z.array(z.string()).optional(),
  deviceIds: z.array(z.string()).optional(),
  filters: z.array(z.string()).optional(),
  digitalCopy: z.boolean().optional(),
  gatewayPriority: z.enum(['razorpay', 'cashfree']).optional(),
  razorpayKeyId: z.string().optional(),
  razorpayKeySecret: z.string().optional(),
  cashfreeAppId: z.string().optional(),
  cashfreeSecretKey: z.string().optional(),
  cashfreeEnv: z.enum(['production', 'sandbox']).optional(),
  qrTimeoutMinutes: z.number().int().min(1).max(30).optional(),
  boothTimeout: z.number().optional(),
}).passthrough();

export const eventUpdateSchema = eventCreateSchema.partial();

export const couponCreateSchema = z.object({
  code: z.string('Coupon code is required.')
    .trim()
    .min(2, 'Coupon code must be at least 2 characters.')
    .max(30),
  type: z.enum(['percent', 'fixed', 'percentage']).optional(),
  value: z.number().positive('Discount value must be greater than 0.').optional(),
  discount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.any().optional(),
}).passthrough();
