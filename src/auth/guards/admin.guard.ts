import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserNotAdminException } from '../exception/user-no-admin-exception';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UserNotAdminException();
    }

    const admins =
      this.configService
        .get<string>('ADMIN_EMAILS')
        ?.split(',')
        .map((email) => email.trim()) ?? [];

    if (admins.includes(user.email)) {
      return true;
    }

    throw new UserNotAdminException();
  }
}
