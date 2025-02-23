import { Exclude, Expose, Type } from 'class-transformer';
import { PaymentResponse } from './payment.response';

@Exclude()
export class PaginatedPaymentsResponse {
  @Expose()
  @Type(() => PaymentResponse)
  data: PaymentResponse[];

  @Expose()
  meta: object;
}
