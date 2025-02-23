import { Module } from '@nestjs/common';
import { LoanController } from './controllers/loan.controller';
import { PrismaService } from 'src/shared/prisma.service';
import { AdminLoanController } from './controllers/admin.loan.controller';
import { LoanService } from './services/loan.service';

@Module({
  providers: [LoanService, PrismaService],
  controllers: [LoanController, AdminLoanController],
})
export class LoanModule {}
