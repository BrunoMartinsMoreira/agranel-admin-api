import { UsersRepository } from 'modules/users/infra/database/repositories/User.repository';
import { IUserRepository } from 'modules/users/models/IUserRepository';
import { container } from 'tsyringe';

container.registerSingleton<IUserRepository>(
  'UsersRepository',
  UsersRepository,
);
