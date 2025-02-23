import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val) || 1),
  per_page: z
    .string()
    .optional()
    .transform((val) => parseInt(val) || 10),
});

export type Pagination = z.infer<typeof PaginationSchema>;
