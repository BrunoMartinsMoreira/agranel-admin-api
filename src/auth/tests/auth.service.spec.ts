import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/models/users/users.service';
import { AuthService } from '../auth.service';
import * as argon from 'argon2';
import { DefaultMessages } from 'src/common/types/DefaultMessages';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            updateRefreshToken: jest.fn(),
            show: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('Instancias dos services', () => {
    it('Instancia auth service', () => {
      expect(authService).toBeDefined();
    });

    it('Instancia users service', () => {
      expect(usersService).toBeDefined();
    });

    it('Instancia jwt service', () => {
      expect(jwtService).toBeDefined();
    });
  });

  describe('Validate user', () => {
    it('Deve validar o usuario com os parametros corretos', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        id: '922e8215',
        name: 'Bruno',
        email: 'mail@mail2.com',
        password: 'hashpassword',
        createdAt: new Date('2023-03-06T02:26:49.370Z'),
        updatedAt: new Date('2023-03-06T02:26:49.370Z'),
      });

      jest.spyOn(argon, 'verify').mockResolvedValue(true);

      const response = await authService.validateUser({
        email: 'mail@mail2.com',
        password: 'password',
      });

      expect(response).toEqual({
        id: '922e8215',
        name: 'Bruno',
        email: 'mail@mail2.com',
        createdAt: new Date('2023-03-06T02:26:49.370Z'),
        updatedAt: new Date('2023-03-06T02:26:49.370Z'),
      });
    });

    it('Nao deve validar o usuario com senha incorreta', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        id: '922e8215',
        name: 'Bruno',
        email: 'mail@mail2.com',
        password: 'hashpassword',
        createdAt: new Date('2023-03-06T02:26:49.370Z'),
        updatedAt: new Date('2023-03-06T02:26:49.370Z'),
      });

      jest.spyOn(argon, 'verify').mockResolvedValue(false);

      const response = await authService.validateUser({
        email: 'mail@mail2.com',
        password: 'incorrectpassword',
      });

      expect(response).toBe(null);
    });

    it('Nao deve validar o usuario com email incorreto', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(undefined);

      const response = await authService.validateUser({
        email: 'mail@mail2.com',
        password: 'incorrecthashpassword',
      });

      expect(response).toBe(null);
    });
  });

  describe('Logout', () => {
    it('Deve ser possivel fazer logout', async () => {
      const response = await authService.logout({
        id: '922e8215',
        name: 'Bruno',
        email: 'mail@mail2.com',
        password: 'hashpassword',
        createdAt: new Date('2023-03-06T02:26:49.370Z'),
        updatedAt: new Date('2023-03-06T02:26:49.370Z'),
      });

      expect(response.data).toBe(null);
      expect(response.error).toBe(false);
      expect(response.message).toEqual(['Logout realizado com sucesso']);
    });
  });

  describe('Login', () => {
    it('Deve ser possivel fazer login', async () => {
      jest.spyOn(argon, 'hash').mockResolvedValue('hashed_token');
      jest.spyOn(jwtService, 'sign').mockReturnValue('hashed_access_token');

      const response = await authService.login({
        id: '922e8215',
        name: 'Bruno',
        email: 'mail@mail2.com',
        password: 'hashpassword',
        createdAt: new Date('2023-03-06T02:26:49.370Z'),
        updatedAt: new Date('2023-03-06T02:26:49.370Z'),
      });

      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        'hashed_token',
        '922e8215',
      );
      expect(response).toEqual({
        access_token: 'hashed_access_token',
        refresh_token: 'hashed_access_token',
        name: 'Bruno',
        email: 'mail@mail2.com',
        id: '922e8215',
      });
    });
  });

  describe('Refresh', () => {
    it('Deve retornar um refresh token com parâmetros válidos', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue('hashed_access_token');
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({});
      jest.spyOn(argon, 'verify').mockResolvedValue(true);

      jest.spyOn(usersService, 'show').mockResolvedValue({
        error: false,
        message: [DefaultMessages.QUERY_SUCCESS],
        data: {
          id: '922e8215',
          name: 'Bruno',
          email: 'mail@mail2.com',
          password: 'hashpassword',
          createdAt: new Date('2023-03-06T02:26:49.370Z'),
          updatedAt: new Date('2023-03-06T02:26:49.370Z'),
        },
      });

      const response = await authService.refresh({
        refresh_token: 'my_valid_refresh_token',
        userId: '922e8215',
      });

      expect(response).toEqual({
        access_token: 'hashed_access_token',
        email: 'mail@mail2.com',
        id: '922e8215',
        name: 'Bruno',
      });
    });

    it('Deve retornar um erro para id invalido', async () => {
      jest.spyOn(usersService, 'show').mockResolvedValue({
        error: true,
        message: [DefaultMessages.DATA_NOT_FOUND],
        data: null,
      });

      await expect(
        authService.refresh({
          refresh_token: 'my_valid_refresh_token',
          userId: 'invalid_id',
        }),
      ).rejects.toThrowError(
        new HttpException(
          {
            error: true,
            message: 'Usuário não encontrado',
            data: null,
          },
          HttpStatus.FORBIDDEN,
        ),
      );
    });

    it('Deve retornar um erro para refresh token invalido', async () => {
      jest.spyOn(usersService, 'show').mockResolvedValue({
        error: false,
        message: [DefaultMessages.QUERY_SUCCESS],
        data: {
          id: '922e8215',
          name: 'Bruno',
          email: 'mail@mail2.com',
          password: 'hashpassword',
          createdAt: new Date('2023-03-06T02:26:49.370Z'),
          updatedAt: new Date('2023-03-06T02:26:49.370Z'),
        },
      });

      jest.spyOn(argon, 'verify').mockResolvedValue(false);

      await expect(
        authService.refresh({
          refresh_token: 'my_valid_refresh_token',
          userId: 'invalid_id',
        }),
      ).rejects.toThrowError(
        new HttpException(
          {
            error: true,
            message: 'Refresh token inválido',
            data: null,
          },
          HttpStatus.FORBIDDEN,
        ),
      );
    });

    it('Deve retornar um erro para refresh token gerado com secret errado', async () => {
      jest.spyOn(usersService, 'show').mockResolvedValue({
        error: false,
        message: [DefaultMessages.QUERY_SUCCESS],
        data: {
          id: '922e8215',
          name: 'Bruno',
          email: 'mail@mail2.com',
          password: 'hashpassword',
          createdAt: new Date('2023-03-06T02:26:49.370Z'),
          updatedAt: new Date('2023-03-06T02:26:49.370Z'),
        },
      });

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(undefined);

      await expect(
        authService.refresh({
          refresh_token: 'my_valid_refresh_token',
          userId: 'invalid_id',
        }),
      ).rejects.toThrowError(
        new HttpException(
          {
            error: true,
            message: 'Refresh token inválido',
            data: null,
          },
          HttpStatus.FORBIDDEN,
        ),
      );
    });
  });
});
