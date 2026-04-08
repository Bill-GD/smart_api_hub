import { z, ZodObject } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().trim().min(4),
  email: z.email(),
  password: z.string()
    .trim()
    .min(8).max(30)
    .regex(/^[a-zA-Z][a-zA-Z0-9]{7,29}$/),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().trim().min(8),
});

export const validatorCache = new Map<string, ZodObject>();
