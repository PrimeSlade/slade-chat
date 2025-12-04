// import { Injectable } from '@nestjs/common';
// import { CreateUserDto, UpdateCategoriesDto } from './dto/user.dto';
// import { PrismaService } from 'src/prisma.service';
// import { User } from './entities/user.entity';

// @Injectable()
// export class UsersService {
//   constructor(private prismaService: PrismaService) {}

//   async findOne(id: number): Promise<User> {
//     const user = await this.prismaService.user.findUniqueOrThrow({
//       where: {
//         id,
//         deletedAt: null,
//       },
//     });

//     const { password, ...result } = user;

//     return result;
//   }

//   async softDeleteUser(id: number): Promise<undefined> {
//     await this.prismaService.user.update({
//       where: {
//         id,
//       },
//       data: {
//         deletedAt: new Date(),
//       },
//     });
//   }
// }
