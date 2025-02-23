import { BadRequestException } from '@nestjs/common';

export class PaymentAmountExceedsLoanRemainingBalanceException extends BadRequestException {
  constructor() {
    super('Payment amount exceeds remaining balance');
  }
}
