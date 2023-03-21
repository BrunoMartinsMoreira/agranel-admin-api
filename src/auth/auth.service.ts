import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthLoginDto } from './dto/auth.login.dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/models/users/users.service';
import { JwtTokenInterface } from '../common/types/auth/jwt.token.interface';
import { JwtPayloadInterface } from '../common/types/auth/jwt.payload.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from 'src/models/users/entities/user.entity';
import { IDefaultResponse } from 'src/common/types/DefaultResponse';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(params: AuthLoginDto): Promise<Partial<User>> {
    const user = await this.usersService.findByEmail(params.email);

    if (user && (await argon.verify(user.password, params.password))) {
      delete user.password;
      return user;
    }
    return null;
  }

  async logout(user: User): Promise<IDefaultResponse<null>> {
    await this.usersService.updateRefreshToken(null, user.id);
    return {
      error: false,
      message: 'Logout realizado com sucesso',
      data: null,
    };
  }

  async login(user: User): Promise<JwtTokenInterface> {
    const payload: JwtPayloadInterface = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    });

    const tokenEncoded = await argon.hash(refresh_token);
    await this.usersService.updateRefreshToken(tokenEncoded, user.id);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token,
      name: user.name,
      email: user.email,
      id: user.id,
    };
  }

  async refresh(body: RefreshTokenDto): Promise<JwtTokenInterface> {
    const user = (
      await this.usersService.show({
        where: { id: body.userId },
      })
    ).data;

    if (!user)
      throw new HttpException(
        {
          error: true,
          message: 'Usuário não encontrado',
          data: null,
        },
        HttpStatus.FORBIDDEN,
      );

    const compare = await argon.verify(user.refreshToken, body.refresh_token);

    if (!compare)
      throw new HttpException(
        {
          error: true,
          message: 'invalid_refresh_token',
          data: null,
        },
        HttpStatus.FORBIDDEN,
      );

    try {
      await this.jwtService.verifyAsync(body.refresh_token, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          message: 'invalid_refresh_token',
          data: error,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const payload: JwtPayloadInterface = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: user.refreshToken,
      name: user.name,
      email: user.email,
      id: user.id,
    };
  }
}
