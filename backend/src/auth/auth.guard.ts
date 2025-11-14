import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    //for future purpose
    // const cookieName =
    //   this.reflector.getAllAndOverride<string>(COOKIE_NAME_KEY, [
    //     context.getHandler(),
    //     context.getClass(),
    //   ]) || 'default_cookie'; // fallback name

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const token = request.cookies['world_snap_user'];

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token.access_token, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
      });

      request['user'] = payload;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
