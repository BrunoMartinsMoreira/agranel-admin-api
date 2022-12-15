import { AppDataSource } from 'infra/database/data-source';
import { ICreateUserDto } from 'modules/users/dto/ICreateUser.dto';
import { IUserRepository } from 'modules/users/models/IUserRepository';
import { Repository } from 'typeorm';
import { User } from '../entities/User.entity';

export class UsersRepository implements IUserRepository {
  private readonly usersRepository: Repository<User>;

  constructor() {
    this.usersRepository = AppDataSource.getRepository(User);
  }

  public async create(data: ICreateUserDto): Promise<User> {
    const user = this.usersRepository.create(data);
    await this.usersRepository.save(user);
    return user;
  }
}
