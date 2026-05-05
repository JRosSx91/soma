import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '@prisma/client';

/**
 * Extracts the authenticated user from the request.
 * Use in conjunction with @UseGuards(JwtAuthGuard).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Omit<User, 'hashedPassword'> => {
    const request = ctx.switchToHttp().getRequest<{
      user: Omit<User, 'hashedPassword'>;
    }>();
    return request.user;
  },
);