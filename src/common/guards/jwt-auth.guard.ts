import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../auth/isPublic';
import { Reflector } from '@nestjs/core';
import { DefaultMessages } from '../types/DefaultMessages';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw new HttpException(
        {
          error: true,
          message: DefaultMessages.TOKEN_NOT_FOUND,
          data: null,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
