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
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import * as os from 'os';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const logger = new Logger('HTTP');

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const { ip, method, originalUrl: url, body, params, query, headers } = req;

    const { statusCode } = res;
    const sourceHost = headers ? headers.host : '';

    const hostname = os.hostname();
    const userAgent = req.get('user-agent') || '';
    const referer = req.get('referer') || '';

    console.log(
      '\n-----------------------------------------------REQUEST-----------------------------------------------',
      '\n',
    );
    logger.log(
      `\n[${sourceHost}] "${method} ${url}" \nRefer: "${referer}"\nUser agent: "${userAgent}"\nSource IP: "${ip}"\n`,
    );

    console.log('Request Headers:', headers, '\n');
    console.log('Request Body:', body, '\n');
    console.log('Request Params:', params, '\n');
    console.log('Request Query', query, '\n');
    console.log(
      '\n------------------------------------------------------------------------------------------------------',
      '\n',
    );

    return next
      .handle()
      .pipe(
        tap(() => {
          console.log(
            '\n-----------------------------------------------RESPONSE-----------------------------------------------',
            '\n',
          );
          logger.log(
            `\nDestination: [${hostname}]\nStatus Code: "${statusCode}"\nTime elapsed: ${Date.now() - start}ms\n`,
          );
        }),
      )
      .pipe(
        map((data) => {
          console.log('Response Body:', JSON.stringify(data));
          console.log(
            '\n------------------------------------------------------------------------------------------------------',
            '\n',
          );
          return data;
        }),
      )
      .pipe(
        catchError((err) => {
          console.log(
            '\n-----------------------------------------------RESPONSE-----------------------------------------------',
            '\n',
          );
          logger.log(
            `\nDestination: [${hostname}]\nStatus: "${err.status} ${err.message}"\nTime elapsed: ${
              Date.now() - start
            }ms\n`,
          );

          console.error('Error:', err, '\n');
          console.log(
            '\n------------------------------------------------------------------------------------------------------',
            '\n',
          );

          if (err.response) {
            switch (err.response.statusCode) {
              case 400:
                throw new BadRequestException(err.message);
              case 401:
                throw new UnauthorizedException(err.message);
              case 403:
                throw new ForbiddenException(err.message);
              case 404:
                throw new NotFoundException(err.message);
              case 415:
                throw new UnsupportedMediaTypeException(err.message);
              case 422:
                throw new UnprocessableEntityException(err.message);
              default:
                throw new Error('Error: Internal Server Error');
            }
          } else throw new Error(err.message);
        }),
      );
  }
}
