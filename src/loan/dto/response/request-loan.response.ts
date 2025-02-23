import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class RequestLoanResponse {
  @Expose()
  id: number;

  @Expose()
  amount: number;

  @Expose()
  duration: number;

  @Expose()
  status: string;

  @Expose()
  remaining_balance: number;

  @Expose()
  @Type(() => Date)
  created_at: Date;
}
