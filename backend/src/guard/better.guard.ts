import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { auth } from '../auth/auth';

@Injectable()
export class BetterAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session || !session.user) {
        throw new UnauthorizedException('Unauthorized');
      }
      req.user = session.user;
      req.session = session;

      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
