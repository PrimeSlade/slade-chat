import z from 'zod';

export const createDirectRoomSchema = z.object({
  content: z.string().max(2000),
  otherId: z.string(),
});

export type CreateDirectRoomDto = z.infer<typeof createDirectRoomSchema>;
