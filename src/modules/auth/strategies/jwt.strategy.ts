import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtPayload, JwtStrategyAuth } from '../interfaces/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.WILSON_JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtStrategyAuth> {
    const { id } = payload;
    const user = await this.usersRepository.findOne({ where: { id } });

    if (user) {
      const { id, authToken, role } = user;

      return { id, authToken, role };
    }

    return null;
  }
}
