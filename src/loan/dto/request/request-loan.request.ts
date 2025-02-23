import { z } from 'zod';

export const RequestLoanSchema = z
  .object({
    amount: z.number().gt(0),
    purpose: z.string(),
    duration: z.number().gt(0),
  })
  .required();

export type RequestLoanRequest = z.infer<typeof RequestLoanSchema>;
