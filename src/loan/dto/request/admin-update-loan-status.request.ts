import { z } from 'zod';

export const AdminUpdateLoanStatusSchema = z
  .object({
    status: z.enum(['pending', 'approved', 'rejected']),
  })
  .required();

export type AdminUpdateLoanStatusRequest = z.infer<
  typeof AdminUpdateLoanStatusSchema
>;
