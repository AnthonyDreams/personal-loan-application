import { z } from 'zod';

export const RegisterUserRequestSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6).max(50),
  })
  .required();

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>;
