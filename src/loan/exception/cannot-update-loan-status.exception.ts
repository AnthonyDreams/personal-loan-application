import { BadRequestException } from '@nestjs/common';

export class CannotUpdateLoanStatusException extends BadRequestException {
  constructor(message: string = 'Cannot update loan status') {
    super(message);
  }
}
