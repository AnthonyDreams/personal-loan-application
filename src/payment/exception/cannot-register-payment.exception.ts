import { BadRequestException } from '@nestjs/common';

export class CannotRegisterPaymentException extends BadRequestException {
  constructor(message: string = 'Cannot register payment') {
    super(message);
  }
}
