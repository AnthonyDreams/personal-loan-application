import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import {
  RequestLoanRequest,
  RequestLoanSchema,
} from '../dto/request/request-loan.request';
import { RequestLoanResponse } from '../dto/response/request-loan.response';
import { plainToInstance } from 'class-transformer';
import { PaginatedLoansReponse } from '../dto/response/loans.response';
import { LoanResponse } from '../dto/response/loan.response';
import { PaginatedPaymentsResponse } from 'src/payment/dto/response/payments.response';
import { Pagination, PaginationSchema } from 'src/shared/dto/query/pagination';
import { LoanService } from '../services/loan.service';
import { AuthenticatedUser } from 'src/shared/decorators/authenticated-user.decorators';
import { Payload } from 'src/auth/interfaces/auth.interface';

@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get()
  async findAll(
    @AuthenticatedUser() user: Payload,
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: Pagination,
  ) {
    const loans = await this.loanService.findAllByUser(user.id, {
      page: pagination.page,
      perPage: pagination.per_page,
    });

    return plainToInstance(PaginatedLoansReponse, loans, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findOne(@AuthenticatedUser() user: Payload, @Param('id') id: string) {
    const loan = await this.loanService.findOneByIdAndUser(
      parseInt(id),
      user.id,
    );

    return plainToInstance(LoanResponse, loan, {
      excludeExtraneousValues: true,
    });
  }

  @Post('request')
  async requestLoan(
    @Body(new ZodValidationPipe(RequestLoanSchema))
    data: RequestLoanRequest,
    @AuthenticatedUser() user: Payload,
  ): Promise<RequestLoanResponse> {
    const loan = await this.loanService.create(user.id, data);

    return plainToInstance(RequestLoanResponse, loan, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id/payments')
  async findAllPayments(
    @AuthenticatedUser() user: Payload,
    @Param('id') id: string,
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: Pagination,
  ) {
    const payments = await this.loanService.findAllPaymentsByLoanAndUser(
      parseInt(id),
      user.id,
      {
        page: pagination.page,
        perPage: pagination.per_page,
      },
    );

    return plainToInstance(PaginatedPaymentsResponse, payments, {
      excludeExtraneousValues: true,
    });
  }
}
