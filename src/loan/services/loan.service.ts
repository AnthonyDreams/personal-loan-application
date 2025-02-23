import { Injectable } from '@nestjs/common';
import { Loan, LoanStatus } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma.service';
import {
  paginate,
  PaginatedResult,
  PaginateOptions,
} from 'src/shared/utils/paginator';
import { AdminUpdateLoanStatusRequest } from '../dto/request/admin-update-loan-status.request';
import { RequestLoanRequest } from '../dto/request/request-loan.request';
import { CannotUpdateLoanStatusException } from '../exception/cannot-update-loan-status.exception';
import { LoanNotFoundException } from '../exception/loan-not-found.exception';

@Injectable()
export class LoanService {
  constructor(private prismaService: PrismaService) {}

  async create(userId: number, data: RequestLoanRequest) {
    return this.prismaService.loan.create({
      data: {
        amount: data.amount,
        user: {
          connect: {
            id: userId,
          },
        },
        duration: data.duration,
        purpose: data.purpose,
        remaining_balance: data.amount,
      },
    });
  }

  async findAllByUser(
    userId: number,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<Loan>> {
    return paginate(
      this.prismaService.loan,
      {
        where: { user_id: userId },
      },
      pagination,
    );
  }

  async findOneByIdAndUser(id: number, userId: number) {
    const loan = await this.prismaService.loan.findUnique({
      where: { id, user_id: userId },
    });

    if (!loan) {
      throw new LoanNotFoundException();
    }
    return loan;
  }

  async findAllPaymentsByLoanAndUser(
    loanId: number,
    userId: number,
    pagination: PaginateOptions,
  ) {
    await this.findOneByIdAndUser(loanId, userId);

    return paginate(
      this.prismaService.payment,
      {
        where: { loan_id: loanId, loan: { user_id: userId } },
      },
      pagination,
    );
  }

  async updateStatus(id: number, data: AdminUpdateLoanStatusRequest) {
    const loan = await this.prismaService.loan.findUnique({
      where: { id },
    });

    if (!loan) {
      throw new LoanNotFoundException();
    }

    if (loan.total_paid !== 0) {
      throw new CannotUpdateLoanStatusException(
        'Cannot update loan status for a loan that has payments',
      );
    }

    return await this.prismaService.loan.update({
      where: { id: id },
      data: { status: LoanStatus[data.status.toLocaleUpperCase()] },
    });
  }
}
