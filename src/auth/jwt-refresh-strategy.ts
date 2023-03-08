import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JwtPayloadInterface } from '../common/types/auth/jwt.payload.interface';
import { UsersService } from 'src/models/users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayloadInterface) {
    const { email } = payload;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new HttpException(
        {
          error: true,
          message: `Não foi encontrado cadastro com o email ${email}`,
          data: null,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
