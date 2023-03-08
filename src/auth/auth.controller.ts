import {
  Controller,
  Request,
  Post,
  UseGuards,
  HttpCode,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './isPublic';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { RequestUser } from '../common/types/auth/request';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DefaultErrorHandler } from 'src/common/utils/defaultErrorHandler';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req: RequestUser) {
    try {
      return this.authService.login(req.user);
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Request() req, @Body() body: RefreshTokenDto) {
    try {
      return this.authService.refresh(body);
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(200)
  async logout(@Request() req: RequestUser) {
    try {
      return this.authService.logout(req.user);
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }
}
