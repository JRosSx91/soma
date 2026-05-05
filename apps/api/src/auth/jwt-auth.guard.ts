import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Marker guard that activates the 'jwt' Passport strategy.
 * Apply via @UseGuards(JwtAuthGuard) on any controller method that
 * requires authentication.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}