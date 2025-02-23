import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  CreatePaymentRequest,
  CreatePaymentSchema,
} from './dto/request/create-payment.request';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import { plainToInstance } from 'class-transformer';
import { PaymentResponse } from './dto/response/payment.response';
import { AuthenticatedUser } from 'src/shared/decorators/authenticated-user.decorators';
import { Payload } from 'src/auth/interfaces/auth.interface';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(':id')
  async findOne(@AuthenticatedUser() user: Payload, @Param('id') id: string) {
    const payment = await this.paymentService.payment(parseInt(id), user.id);

    return plainToInstance(PaymentResponse, payment, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreatePaymentSchema))
    data: CreatePaymentRequest,
    @AuthenticatedUser() user: Payload,
  ) {
    return plainToInstance(
      PaymentResponse,
      await this.paymentService.createPayment(user.id, data),
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
