import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import * as moment from 'moment';
import { ForgotPasswordTemplate } from 'src/common/templates/ForgotPassword.template';
import { DefaultMessages } from 'src/common/types/DefaultMessages';
import { IDefaultResponse } from 'src/common/types/DefaultResponse';
import { httpExceptionHandler } from 'src/common/utils/htttpExceptionHandler';
import { ServiceBase } from 'src/common/utils/service.base';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/resetPasswordDto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends ServiceBase<User> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly mailerService: MailerService,
  ) {
    super(usersRepository);
  }

  public async create(
    createUserDto: CreateUserDto,
  ): Promise<IDefaultResponse<User>> {
    createUserDto.password = await argon2.hash(createUserDto.password);

    const { data } = await super.store(createUserDto, true, [
      {
        columnName: 'email',
        value: { email: createUserDto.email },
      },
    ]);

    delete data.password;

    return {
      error: false,
      message: DefaultMessages.CREATED,
      data: data,
    };
  }

  public async findByEmail(email: string): Promise<User> {
    const user = await this.repository.findOne({
      where: { email },
      select: ['id', 'password', 'name', 'email'],
    });

    if (!user) {
      return httpExceptionHandler('Email ou senha incorretos');
    }

    return user;
  }

  async updateRefreshToken(refreshToken: string, id: string): Promise<User> {
    const result = await this.repository.update({ id }, { refreshToken });

    if (result.affected > 0) {
      return this.repository.findOne({ where: { id } });
    }

    return httpExceptionHandler(DefaultMessages.DATA_NOT_FOUND);
  }

  public async sendForgotpasswordEmail(
    email: string,
  ): Promise<IDefaultResponse<User>> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new HttpException(
        {
          error: true,
          message: 'E-mail não cadastrado',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const validationCode = this.generateRandomString(6);
    const expirationDate = moment().add(3, 'hours').toDate();

    await this.update({
      condition: { id: user.id },
      body: {
        resetPasswordToken: validationCode,
        resetPasswordTokenExpiration: expirationDate,
      },
    });

    await this.mailerService.sendMail({
      to: email,
      from: process.env.FORGOT_PASSWORD_SENDER,
      subject: 'Recuperação de senha',
      html: ForgotPasswordTemplate(validationCode, user.name),
    });

    return {
      error: false,
      message: 'Token enviado para o email informado',
      data: null,
    };
  }

  async resetPassword({
    token,
    newPassword,
    confirmNewPassword,
  }: ResetPasswordDto): Promise<IDefaultResponse<User>> {
    if (newPassword !== confirmNewPassword) {
      throw new HttpException(
        {
          error: true,
          message: 'As senhas não conferem',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const userData = await this.repository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!userData) {
      throw new HttpException(
        {
          error: true,
          message: ['Token inválido'],
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const { id, resetPasswordTokenExpiration } = userData;

    const dateNow = moment();
    const tokenExpirationTime = moment(resetPasswordTokenExpiration).diff(
      dateNow,
      'minutes',
    );

    if (tokenExpirationTime <= 0) {
      throw new HttpException(
        {
          error: true,
          message: ['Token expirado'],
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newPasswordHash = await argon2.hash(newPassword);
    await this.repository.update(id, {
      password: newPasswordHash,
    });

    return {
      error: false,
      message: 'Senha atualizada com sucesso',
      data: null,
    };
  }

  private generateRandomString(size: number): string {
    let randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < size; i++) {
      randomString += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return randomString;
  }
}
