import z from 'zod';

export const createMessageSchema = z.object({
  roomId: z.string(),
  content: z.string().max(2000),
});

export const createMessageBodySchema = createMessageSchema.omit({
  roomId: true,
});

export const getMessagesSchema = z.object({
  roomId: z.string(),
  cursor: z.string().optional().nullable(),
  limit: z.coerce.number().default(20),
});

export const getMessagesBodySchema = getMessagesSchema.omit({
  roomId: true,
});

export type CreateMessageDto = z.infer<typeof createMessageSchema>;
export type CreateMessageBodyDto = z.infer<typeof createMessageBodySchema>;

export type GetMessagesBodyDto = z.infer<typeof getMessagesBodySchema>;
export type GetMessagesDto = z.infer<typeof getMessagesSchema>;
