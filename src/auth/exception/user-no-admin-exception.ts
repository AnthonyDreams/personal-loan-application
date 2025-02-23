import { ForbiddenException } from '@nestjs/common';

export class UserNotAdminException extends ForbiddenException {
  constructor() {
    super('Admin privileges are required to access this resource.');
  }
}
