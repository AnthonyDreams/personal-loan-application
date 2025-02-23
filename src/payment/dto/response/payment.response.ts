import { Exclude, Expose, Type } from 'class-transformer';
import { LoanResponse } from 'src/loan/dto/response/loan.response';

@Exclude()
export class PaymentResponse {
  @Expose()
  id: number;

  @Expose()
  amount_paid: number;

  @Expose()
  @Type(() => LoanResponse)
  loan?: LoanResponse;

  @Expose()
  @Type(() => Date)
  payment_date: Date;

  @Expose()
  @Type(() => Date)
  created_at: Date;
}
