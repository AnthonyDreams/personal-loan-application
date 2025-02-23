import { z } from 'zod';

export const CreatePaymentSchema = z
  .object({
    loan_id: z.number().gt(0),
    amount_paid: z.number().gt(0),
  })
  .required();

export type CreatePaymentRequest = z.infer<typeof CreatePaymentSchema>;
