import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DefaultMessages } from '../common/types/DefaultMessages';
import { User } from 'src/models/users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<Partial<User>> {
    const user = await this.authService.validateUser({
      email,
      password,
    });

    if (!user) {
      throw new HttpException(
        DefaultMessages.EMAIL_OR_PASS_INVALID,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
