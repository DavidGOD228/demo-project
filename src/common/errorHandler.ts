import {
  InternalServerErrorException,
  PayloadTooLargeException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';

type ExceptionResponse = {
  statusCode: number;
  message: string;
  error: string;
};

export const errorHandle = (err: ExceptionResponse | Error, fnName: string): void => {
  let error: any = err;
  console.log(`ERROR (${fnName}): `, err.message);

  if (!error) {
    error = { message: 'Error body was empty' };
  }

  if (!error.status) {
    throw new Error(error.message);
  } else {
    switch (error.response.statusCode) {
      case 400:
        throw new BadRequestException(error.response);
      case 401:
        throw new UnauthorizedException(error.response);
      case 403:
        throw new ForbiddenException(error.response);
      case 404:
        throw new NotFoundException(error.response);
      case 413:
        throw new PayloadTooLargeException(error.response);
      case 415:
        throw new UnsupportedMediaTypeException(error.response);
      case 422:
        throw new UnprocessableEntityException(error.response);
      case 500:
        throw new InternalServerErrorException(error.response);
      default:
        throw new Error('Error: Internal Server Error');
    }
  }
};
