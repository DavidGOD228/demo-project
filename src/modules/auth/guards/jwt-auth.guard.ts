import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: Error, user: TUser): TUser {
    const userModel: any = { ...user };

    if (err || !user || !userModel.id || !userModel.authToken) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
