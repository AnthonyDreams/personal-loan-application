import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { CreatePaymentRequest } from './dto/request/create-payment.request';
import { LoanNotFoundException } from 'src/loan/exception/loan-not-found.exception';
import { PaymentAmountExceedsLoanRemainingBalanceException } from './exception/payment-amount-exceeds-loan-remaining-balance.exception';
import { PaymentNotFoundException } from './exception/payment-not-found.exception';
import { LoanStatus } from '@prisma/client';
import { CannotRegisterPaymentException } from './exception/cannot-register-payment.exception';

@Injectable()
export class PaymentService {
  constructor(private readonly prismaService: PrismaService) {}

  async payment(id: number, userId: number) {
    const payment = await this.prismaService.payment.findUnique({
      where: { id, loan: { user_id: userId } },
      include: { loan: true },
    });

    if (!payment) {
      throw new PaymentNotFoundException();
    }

    return payment;
  }

  async createPayment(userId: number, data: CreatePaymentRequest) {
    const loan = await this.prismaService.loan.findUnique({
      where: { id: data.loan_id, user_id: userId },
    });

    if (!loan) {
      throw new LoanNotFoundException();
    }

    if (loan.remaining_balance < data.amount_paid) {
      throw new PaymentAmountExceedsLoanRemainingBalanceException();
    }

    if (loan.status !== LoanStatus.APPROVED) {
      throw new CannotRegisterPaymentException(
        'Cannot register payment for a loan that is not approved',
      );
    }

    const [payment] = await this.prismaService.$transaction([
      this.prismaService.payment.create({
        data: {
          amount_paid: data.amount_paid,
          loan: { connect: { id: data.loan_id, user_id: userId } },
        },
        include: { loan: true },
      }),
      this.prismaService.loan.update({
        where: { id: data.loan_id },
        data: {
          remaining_balance: { decrement: data.amount_paid },
          total_paid: { increment: data.amount_paid },
        },
      }),
    ]);
    return this.prismaService.payment.findUnique({
      where: { id: payment.id },
      include: { loan: true },
    });
  }
}
