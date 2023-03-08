import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { Public } from 'src/auth/isPublic';
import { DefaultErrorHandler } from 'src/common/utils/defaultErrorHandler';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetOneDto } from 'src/common/validators/get.one.dto';
import { IDefaultResponse } from 'src/common/types/DefaultResponse';
import { User } from './entities/user.entity';
import { FindAllUsersDto } from './dto/findall-users.dto';
import { ApiTags } from '@nestjs/swagger';
import { ILike } from 'typeorm';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPasswordDto';

@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async store(@Body() body: CreateUserDto): Promise<IDefaultResponse<User>> {
    try {
      return this.usersService.create(body);
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Put(':id')
  async update(
    @Param() params: GetOneDto,
    @Body() body: UpdateUserDto,
  ): Promise<IDefaultResponse<User>> {
    try {
      return this.usersService.update({
        condition: { id: params.id },
        body: body,
      });
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Get()
  async findAll(@Query() query: FindAllUsersDto) {
    try {
      return this.usersService.getAll({
        take: query?.take,
        page: query.page,
        order: { name: 'ASC' },
        where: {
          name: query.name ? ILike(`%${query.name}%`) : undefined,
        },
      });
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Get(':id')
  async findOne(@Param() params: GetOneDto): Promise<IDefaultResponse<User>> {
    try {
      return this.usersService.show({
        where: { id: params.id },
      });
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Delete(':id')
  async delete(@Param() params: GetOneDto) {
    try {
      return this.usersService.destroy(params.id);
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Public()
  @Post('/forgot-my-password')
  async sendForgotPasswordMail(@Body() body: ForgotPasswordDto) {
    try {
      return this.usersService.sendForgotpasswordEmail(body.email);
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Public()
  @Post('/reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    try {
      return this.usersService.resetPassword(body);
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }
}
