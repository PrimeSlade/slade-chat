// import z from 'zod';

// export const createUserSchema = z
//   .object({
//     name: z.string(),
//     email: z.email(),
//     password: z.string(),
//   })
//   .required();

// export const updateCategoriesSchema = z.object({
//   categories: z
//     .refine((arr) => new Set(arr).size === arr.length, {
//       message: 'Duplicate categories are not allowed',
//     })
//     .optional(),
// });

// export type CreateUserDto = z.infer<typeof createUserSchema>;
// export type UpdateCategoriesDto = z.infer<typeof updateCategoriesSchema>;
