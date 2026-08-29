import z from 'zod';

export const updateUsernameSchema = z.object({
  username: z.string().min(5),
});

export type UpdateUsernameDto = z.infer<typeof updateUsernameSchema>;
