import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';

import { plainToInstance } from 'class-transformer';
import {
  AdminUpdateLoanStatusRequest,
  AdminUpdateLoanStatusSchema,
} from '../dto/request/admin-update-loan-status.request';
import { LoanResponse } from '../dto/response/loan.response';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { LoanService } from '../services/loan.service';

@Controller('admin/loans')
@UseGuards(AdminGuard)
export class AdminLoanController {
  constructor(private readonly loanService: LoanService) {}

  @Patch(':id/status')
  async updateLoanStatus(
    @Body(new ZodValidationPipe(AdminUpdateLoanStatusSchema))
    data: AdminUpdateLoanStatusRequest,
    @Param('id') id: string,
  ) {
    const loan = await this.loanService.updateStatus(parseInt(id), data);

    return plainToInstance(LoanResponse, loan, {
      excludeExtraneousValues: true,
    });
  }
}
