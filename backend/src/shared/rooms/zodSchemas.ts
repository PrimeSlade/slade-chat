import z from 'zod';

export const createDirectRoomSchema = z.object({
  content: z.string().max(2000),
  otherId: z.string(),
});

export type CreateDirectRoomDto = z.infer<typeof createDirectRoomSchema>;

export const createGroupRoomSchema = z.object({
  groupName: z.string().min(1).max(100),
  friendIds: z.array(z.string()).min(1),
  image: z.string().optional(),
});

export type CreateGroupRoomDto = z.infer<typeof createGroupRoomSchema>;

export const addRoomMembersSchema = z.object({
  memberIds: z.array(z.string()).min(1),
});

export type AddRoomMembersDto = z.infer<typeof addRoomMembersSchema>;
