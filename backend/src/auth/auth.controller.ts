import { Controller, Post, Body, UsePipes, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { createUserSchema } from 'src/users/dto/create-user.dto';
import type { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { RegisterDto, SignInDto, signInSchema } from './dto/auth.dto';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from 'src/common/decorators/response.decorator';
import { User } from '../users/entities/user.entity';
import { RegisterAuth, SignInAuth } from './entities/auth.entity';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  @ApiBody({ type: RegisterAuth })
  @ApiOperation({ summary: 'Create new user' })
  @ApiSuccessResponse(User, 'User created successfully')
  @ApiErrorResponse([
    { statusCode: 401, description: 'Unauthorized' },
    { statusCode: 500, description: 'Internal Server Error' },
  ])
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ data: User; message: string }> {
    const user = await this.authService.register(registerDto);

    return {
      data: user,
      message: 'User created successfully',
    };
  }

  @Post('signin')
  @UsePipes(new ZodValidationPipe(signInSchema))
  @ApiBody({ type: SignInAuth })
  @ApiOperation({ summary: 'Sign In new user' })
  @ApiSuccessResponse(User, 'Successfully logged in')
  @ApiErrorResponse([
    { statusCode: 401, description: 'Password is incorrect' },
    { statusCode: 500, description: 'Internal Server Error' },
  ])
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const access_token = await this.authService.signIn(signInDto);

    response.cookie('world_snap_user', access_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 day
    });

    return { message: 'Successfully logged in' };
  }
}
