import { Injectable, UnauthorizedException } from '@nestjs/common';
import { comparePassword, hashPassword } from 'src/common/helpers/hahs.helper';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, SignInDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const hashedPassword = await hashPassword(registerDto.password);

    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
      },
    });

    const { password, ...result } = user;

    return result;
  }

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        email: signInDto.email,
      },
    });

    const verfifyPassword = await comparePassword(
      signInDto.password,
      user.password,
    );

    if (!verfifyPassword)
      throw new UnauthorizedException('Password is incorrect');

    const payload = { userId: user.id };

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
