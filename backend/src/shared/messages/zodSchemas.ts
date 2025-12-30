import z from 'zod';

export const createMessageSchema = z.object({
  roomId: z.string().optional(),
  content: z.string().max(2000),
});

export const getMessagesSchema = z.object({
  roomId: z.string().optional(),
  cursor: z.string().nullable(),
  limit: z.number().optional().default(20),
});

export type CreateMessageDto = z.infer<typeof createMessageSchema>;
export type GetMessagesDto = z.infer<typeof getMessagesSchema>;
