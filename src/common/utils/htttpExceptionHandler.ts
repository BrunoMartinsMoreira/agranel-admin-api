import { HttpException, HttpStatus } from '@nestjs/common';

export const httpExceptionHandler = (message: string) => {
  throw new HttpException(
    {
      error: true,
      message: [message],
      data: null,
    },
    HttpStatus.BAD_REQUEST,
  );
};
