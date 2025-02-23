import { z } from 'zod';

export const LoginRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .required();

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
