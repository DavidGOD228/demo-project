import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  UnsupportedMediaTypeException,
  UnprocessableEntityException,
  PayloadTooLargeException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import * as os from 'os';
import * as fs from 'fs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const logger = new Logger('HTTP');

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const { ip, method, originalUrl: url, headers } = req;

    const { statusCode } = res;
    const sourceHost = headers ? headers.host : '';

    const hostname = os.hostname();
    const userAgent = req.get('user-agent') || '';
    const referer = req.get('referer') || '';

    logger.log(
      `\n[${sourceHost}] "${method} ${url}" \nRefer: "${referer}"\nUser agent: "${userAgent}"\nSource IP: "${ip}"\n`,
    );

    return next
      .handle()
      .pipe(
        tap(() => {
          logger.log(
            `\nDestination: [${hostname}]\nStatus Code: "${statusCode}"\nTime elapsed: ${Date.now() - start}ms\n`,
          );
        }),
      )
      .pipe(map(data => data))
      .pipe(
        catchError(error => {
          logger.log(
            `\nDestination: [${hostname}]\nStatus: "${error.status} ${error.message}"\nTime elapsed: ${
              Date.now() - start
            }ms\n`,
          );

          fs.appendFile(
            'error.log',
            `\nDestination: [${hostname}]\nStatus: "${error.status} ${error.message}"\nTime elapsed: ${
              Date.now() - start
            }ms\nDate: ${new Date()}\n`,
            err => err,
          );

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

              case 429:
                throw new HttpException(error.response, HttpStatus.TOO_MANY_REQUESTS);

              case 500:
                throw new InternalServerErrorException(error.response);

              default:
                throw new Error('Error: Internal Server Error');
            }
          }
        }),
      );
  }
}
