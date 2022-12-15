import { ICreateUserDto } from '../dto/ICreateUser.dto';
import { User } from '../infra/database/entities/User.entity';

export interface IUserRepository {
  create: (data: ICreateUserDto) => Promise<User>;
}
