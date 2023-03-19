import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';
import * as argon2 from 'argon2';
import * as moment from 'moment';
import { DefaultMessages } from 'src/common/types/DefaultMessages';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

describe('UsersService', () => {
  let usersService: UsersService;
  let mailerService: MailerService;

  const mockUsersRepo = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  } as unknown as Repository<User>;

  const mockFindOneUserReturn = {
    id: '922e8215',
    name: 'Bruno',
    email: 'mail@mail2.com',
    password: 'hashpassword',
    createdAt: new Date('2023-03-06T02:26:49.370Z'),
    updatedAt: new Date('2023-03-06T02:26:49.370Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepo,
        },

        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    mailerService = module.get<MailerService>(MailerService);

    jest.spyOn(argon2, 'hash').mockResolvedValueOnce('hashpassword');
  });

  afterEach(() => jest.clearAllMocks());

  describe('Instância do service', () => {
    it('Service deve ser instanciado', () => {
      expect(usersService).toBeDefined();
    });

    it('mailer service deve ser instanciado', () => {
      expect(mailerService).toBeDefined();
    });

    it('Mock repository deve ser instanciado', () => {
      expect(mockUsersRepo).toBeDefined();
    });
  });

  describe('Cadastrar usuario', () => {
    it('Deve ser possível cadastrar um usuario', async () => {
      jest
        .spyOn(mockUsersRepo, 'create')
        .mockReturnValue(mockFindOneUserReturn);

      const response = await usersService.create({
        name: 'Bruno',
        email: 'mail@mail2.com',
        password: 'hashpassword',
      });

      expect(mockUsersRepo.create).toHaveBeenCalledWith({
        name: 'Bruno',
        email: 'mail@mail2.com',
        password: 'hashpassword',
      });
      expect(mockUsersRepo.save).toBeCalledTimes(1);
      expect(response.error).toBe(false);
      expect(response.message).toEqual([DefaultMessages.CREATED]);
      expect(response.data).toEqual(mockFindOneUserReturn);
    });

    it('Nao deve cadastrar dois usuarios com mesmo email', async () => {
      jest
        .spyOn(mockUsersRepo, 'findOne')
        .mockResolvedValue(mockFindOneUserReturn);

      await expect(
        usersService.create({
          name: 'Bruno',
          email: 'mail@mail2.com',
          password: 'hashpassword',
        }),
      ).rejects.toThrowError(
        new HttpException(
          {
            error: true,
            message: `Email já está sendo utilizado`,
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('Update de usuarios', () => {
    it('Deve ser possivel atualizar um usuario', async () => {
      jest
        .spyOn(mockUsersRepo, 'update')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      jest.spyOn(mockUsersRepo, 'findOne').mockResolvedValue({
        ...mockFindOneUserReturn,
        name: 'UpdatedName',
        updatedAt: new Date('2023-03-06T15:04:17.699Z'),
      });

      const response = await usersService.update({
        condition: { id: '922e8215' },
        body: {
          name: 'UpdatedName',
        },
      });

      expect(response.error).toBe(false);
      expect(response.message).toEqual(['Atualizado com sucesso.']);
      expect(response.data).toEqual({
        ...mockFindOneUserReturn,
        name: 'UpdatedName',
        updatedAt: new Date('2023-03-06T15:04:17.699Z'),
      });
    });

    it('Nao deve ser possivel atualizar um usuario inexistente', async () => {
      jest
        .spyOn(mockUsersRepo, 'update')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 0 });

      await expect(
        usersService.update({
          condition: { id: '922e8215' },
          body: {
            name: 'UpdatedName',
          },
        }),
      ).rejects.toThrowError(
        new HttpException(
          {
            error: true,
            message: DefaultMessages.DATA_NOT_FOUND,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('Deve ser possivel atualizar o refresh token', async () => {
      jest
        .spyOn(mockUsersRepo, 'update')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      jest.spyOn(mockUsersRepo, 'findOne').mockResolvedValue({
        ...mockFindOneUserReturn,
        refreshToken: 'my-valid-refresh-token',
        updatedAt: new Date('2023-03-06T15:04:17.699Z'),
      });

      const response = await usersService.updateRefreshToken(
        'my-valid-refresh-token',
        'myValidId',
      );

      expect(mockUsersRepo.update).toHaveBeenCalledTimes(1);
      expect(mockUsersRepo.update).toHaveBeenCalledWith(
        { id: 'myValidId' },
        { refreshToken: 'my-valid-refresh-token' },
      );
      expect(response).toEqual({
        ...mockFindOneUserReturn,
        refreshToken: 'my-valid-refresh-token',
        updatedAt: new Date('2023-03-06T15:04:17.699Z'),
      });
    });
  });

  describe('Busca de usuarios', () => {
    it('Deve retornar um usuario pelo Id', async () => {
      jest
        .spyOn(mockUsersRepo, 'findOne')
        .mockResolvedValue(mockFindOneUserReturn);

      const response = await usersService.show({
        where: { id: '922e8215' },
      });

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith({
        where: { id: '922e8215' },
      });

      expect(response.error).toBe(false);
      expect(response.message).toEqual(['Consulta realizada com sucesso.']);
      expect(response.data).toEqual(mockFindOneUserReturn);
    });

    it('Nao deve retornar um usuario com um id inválido', async () => {
      jest.spyOn(mockUsersRepo, 'findOne').mockResolvedValue(undefined);

      await expect(
        usersService.show({
          where: { id: 'inexistentId' },
        }),
      ).rejects.toThrowError(
        new HttpException(
          {
            error: true,
            message: DefaultMessages.DATA_NOT_FOUND,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('deve retornar um usuario pelo email', async () => {
      jest
        .spyOn(mockUsersRepo, 'findOne')
        .mockResolvedValue(mockFindOneUserReturn);

      const response = await usersService.findByEmail('mail@mail2.com');

      expect(response).toEqual(mockFindOneUserReturn);
      expect(mockUsersRepo.findOne).toHaveBeenCalledWith({
        select: ['id', 'password', 'name', 'email'],
        where: { email: 'mail@mail2.com' },
      });
    });

    it('Nao deve retornar um usuario com um email inválido', async () => {
      jest.spyOn(mockUsersRepo, 'findOne').mockResolvedValue(undefined);

      await expect(
        usersService.findByEmail('invalidmail@mail2.com'),
      ).rejects.toThrowError(
        new HttpException(
          {
            error: true,
            message: DefaultMessages.DATA_NOT_FOUND,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('Deve retornar um array de usuarios no findAll', async () => {
      jest
        .spyOn(mockUsersRepo, 'findAndCount')
        .mockResolvedValue([[mockFindOneUserReturn, mockFindOneUserReturn], 2]);

      const response = await usersService.getAll();

      expect(response.error).toBe(false);
      expect(response.message).toEqual(['Consulta realizada com sucesso.']);
      expect(response.data.rows).toEqual([
        mockFindOneUserReturn,
        mockFindOneUserReturn,
      ]);
      expect(response.data.count).toEqual(2);
    });

    it('Deve retornar usuarios de acordo com os filtros', async () => {
      jest.spyOn(mockUsersRepo, 'findAndCount').mockResolvedValue([
        [
          {
            id: '922e8215',
            name: 'Bruno',
            email: 'mail@mail5.com',
            password: 'hashpassword',
            createdAt: new Date('2023-03-06T02:26:49.370Z'),
            updatedAt: new Date('2023-03-06T02:26:49.370Z'),
          },
        ],
        1,
      ]);

      const response = await usersService.getAll({
        page: 1,
        take: 1,
        order: { name: 'ASC' },
        where: { name: ILike('%myname%') },
      });

      expect(mockUsersRepo.findAndCount).toHaveBeenCalledTimes(1);
      expect(mockUsersRepo.findAndCount).toHaveBeenCalledWith({
        order: { name: 'ASC' },
        relations: [],
        skip: 0,
        take: 1,
        where: { name: ILike('%myname%') },
      });
      expect(response.error).toBe(false);
      expect(response.data.count).toEqual(1);
      expect(response.data.rows).toEqual([
        {
          id: '922e8215',
          name: 'Bruno',
          email: 'mail@mail5.com',
          password: 'hashpassword',
          createdAt: new Date('2023-03-06T02:26:49.370Z'),
          updatedAt: new Date('2023-03-06T02:26:49.370Z'),
        },
      ]);
    });
    it('Deve retornar array vazio com filtros que nao possuam registros', async () => {
      jest.spyOn(mockUsersRepo, 'findAndCount').mockResolvedValue([[], 0]);

      const response = await usersService.getAll({
        page: 1,
        take: 1,
        order: { name: 'ASC' },
        where: { name: ILike('%myinexistentname%') },
      });

      expect(mockUsersRepo.findAndCount).toHaveBeenCalledWith({
        order: { name: 'ASC' },
        relations: [],
        skip: 0,
        take: 1,
        where: { name: ILike('%myinexistentname%') },
      });
      expect(response.error).toBe(false);
      expect(response.data.count).toEqual(0);
      expect(response.data.rows).toEqual([]);
    });
  });

  describe('Resetar senha', () => {
    it('Deve retornar um erro caso o email informado não esteja cadastrado', async () => {
      const email = 'nonexistent@example.com';
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(undefined);

      await expect(
        usersService.sendForgotpasswordEmail(email),
      ).rejects.toThrowError(
        new HttpException(
          {
            error: true,
            message: 'E-mail não cadastrado',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('Deve enviar um email com o codigo com os parametros corretos', async () => {
      const email = 'mail@mail2.com';

      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValueOnce(mockFindOneUserReturn);

      jest
        .spyOn(usersService as any, 'generateRandomString')
        .mockReturnValue('123456');

      jest
        .spyOn(global.Date, 'now')
        .mockReturnValueOnce(new Date('2023-02-23T12:34:56Z').valueOf());

      const response = await usersService.sendForgotpasswordEmail(email);

      expect(response).toEqual({
        error: false,
        message: 'Token enviado para o email informado',
        data: null,
      });

      expect(mockUsersRepo.update).toHaveBeenCalledWith(
        { id: '922e8215' },
        {
          resetPasswordTokenExpiration: new Date('2023-02-23T15:34:56Z'),
          resetPasswordToken: '123456',
        },
      );

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        from: process.env.FORGOT_PASSWORD_SENDER,
        subject: 'Recuperação de senha',
        html: expect.any(String),
      });
    });

    it('Deve retornar um erro se as senhas não conferem', async () => {
      const token = 'token123';
      const newPassword = 'newpassword';
      const confirmNewPassword = 'differentpassword';

      await expect(
        usersService.resetPassword({
          token,
          newPassword,
          confirmNewPassword,
        }),
      ).rejects.toThrowError(
        new HttpException(
          {
            error: true,
            message: 'As senhas não conferem',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('Deve retornar um erro quando o token é inválido', async () => {
      const token = 'invalidtoken';
      const newPassword = 'newpassword';
      const confirmNewPassword = 'newpassword';

      jest.spyOn(mockUsersRepo, 'findOne').mockResolvedValue(undefined);

      await expect(
        usersService.resetPassword({
          token,
          newPassword,
          confirmNewPassword,
        }),
      ).rejects.toThrowError(
        new HttpException(
          {
            error: true,
            message: 'Token inválido',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('Deve retornar um erro quando o token expirou', async () => {
      const token = 'expiredtoken';
      const newPassword = 'newpassword';
      const confirmNewPassword = 'newpassword';

      const expirationDate = moment().subtract(1, 'hour').toDate();

      jest.spyOn(mockUsersRepo, 'findOne').mockResolvedValue({
        id: '922e8215',
        name: 'Bruno',
        email: 'mail@mail5.com',
        password: 'hashpassword',
        resetPasswordToken: token,
        resetPasswordTokenExpiration: expirationDate,
        createdAt: new Date('2023-03-06T02:26:49.370Z'),
        updatedAt: new Date('2023-03-06T02:26:49.370Z'),
      });

      await expect(
        usersService.resetPassword({
          token,
          newPassword,
          confirmNewPassword,
        }),
      ).rejects.toThrowError(
        new HttpException(
          {
            error: true,
            message: 'Token expirado',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('Deve ser possivel alterar a senha quando o token é válido', async () => {
      const token = 'validtoken';
      const newPassword = 'newpassword';
      const confirmNewPassword = 'newpassword';

      const expirationDate = moment().add(2, 'hour').toDate();

      jest.spyOn(mockUsersRepo, 'findOne').mockResolvedValue({
        id: '922e8215',
        name: 'Bruno',
        email: 'mail@mail5.com',
        password: 'hashpassword',
        resetPasswordToken: token,
        resetPasswordTokenExpiration: expirationDate,
        createdAt: new Date('2023-03-06T02:26:49.370Z'),
        updatedAt: new Date('2023-03-06T02:26:49.370Z'),
      });

      const response = await usersService.resetPassword({
        token,
        newPassword,
        confirmNewPassword,
      });

      expect(response).toEqual({
        error: false,
        message: 'Senha atualizada com sucesso',
        data: null,
      });

      expect(mockUsersRepo.update).toHaveBeenCalledWith('922e8215', {
        password: 'hashpassword',
      });
    });
  });
});
