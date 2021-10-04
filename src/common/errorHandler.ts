import {
  InternalServerErrorException,
  PayloadTooLargeException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';

interface ExceptionResponse extends Error {
  status?: number;
  error?: string;
  response?: Record<string, any>;
}

export const handleError = (error: ExceptionResponse, functionName: string): void => {
  console.log(`ERROR (${functionName}): `, error.message);
  console.log(error);

  if (!error) {
    error = { message: 'Error body was empty', name: 'Empty error' };
  }

  if (!error.status && !error.response) {
    throw new Error(error.message);
  } else {
    switch (error.status || error.response.statusCode) {
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
