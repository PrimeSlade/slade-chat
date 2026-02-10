import z from 'zod';

export const createMessageSchema = z.object({
  roomId: z.string(),
  content: z.string().max(2000),
});

//for controller
export const createMessageBodySchema = createMessageSchema.omit({
  roomId: true,
});

export const updateMessageSchema = createMessageSchema.extend({
  messageId: z.string(),
});

//for controller
export const updateMessageBodySchema = updateMessageSchema.omit({
  roomId: true,
  messageId: true,
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

export type UpdateMessageDto = z.infer<typeof updateMessageSchema>;
export type UpdateMessageBodyDto = z.infer<typeof updateMessageBodySchema>;

export type GetMessagesBodyDto = z.infer<typeof getMessagesBodySchema>;
export type GetMessagesDto = z.infer<typeof getMessagesSchema>;

export const softDeleteMessageSchema = z.object({
  messageId: z.string(),
  roomId: z.string(),
});

export type SoftDeleteMessageDto = z.infer<typeof softDeleteMessageSchema>;
