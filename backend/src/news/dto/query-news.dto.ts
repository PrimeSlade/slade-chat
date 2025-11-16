import { Category } from 'generated/prisma/enums';
import z from 'zod';

export const fetchByCursorSchema = z.object({
  cursor: z.coerce.number().optional(),
  take: z.coerce.number().default(10),
  categories: z
    .array(z.enum(Category))
    .max(5, 'Maximum 5 categories allowed')
    .optional(),
});

export type FetchByCursorDto = z.infer<typeof fetchByCursorSchema>;
