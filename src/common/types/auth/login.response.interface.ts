import { User } from 'src/models/users/entities/user.entity';

export interface LoginResponseInterface {
  auth: boolean;
  token: string;
  user: User;
}
