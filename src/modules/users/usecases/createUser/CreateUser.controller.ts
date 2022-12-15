import { Request, Response } from 'express';
import { ICreateUserDto } from 'modules/users/dto/ICreateUser.dto';
import { container } from 'tsyringe';
import { CreateUserUseCase } from './CreateUser.useCase';

export class CreateUserController {
  async handle(req: Request, res: Response): Promise<Response> {
    const createUserUseCase = container.resolve(CreateUserUseCase);
    const { name, email, password }: ICreateUserDto = req.body;
    const user = await createUserUseCase.execute({ name, email, password });
    return res.status(201).json(user);
  }
}
