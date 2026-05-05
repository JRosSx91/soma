import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service.js';
import type { JwtPayload } from './auth.service.js';

/**
 * Extracts the JWT from the Authorization header, validates it
 * against the configured secret, and loads the user from the database.
 *
 * The validated user is attached to `request.user` and is available
 * to controllers via the @CurrentUser decorator (or via @Req() if
 * not yet defined).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    // Strip the password hash before exposing the user to the rest
    // of the application.
    const { hashedPassword: _hashedPassword, ...safeUser } = user;
    return safeUser;
  }
}