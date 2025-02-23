import { NotFoundException } from '@nestjs/common';

export class LoanNotFoundException extends NotFoundException {
  constructor() {
    super('Loan not found');
  }
}
