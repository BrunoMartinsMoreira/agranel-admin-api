import { ICreateUserDto } from 'modules/users/dto/ICreateUser.dto';
import { User } from 'modules/users/infra/database/entities/User.entity';
import { IUserRepository } from 'modules/users/models/IUserRepository';
import { inject, injectable } from 'tsyringe';

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUserRepository,
  ) {}

  public async execute(data: ICreateUserDto): Promise<User> {
    const user = await this.usersRepository.create(data);
    return user;
  }
}
