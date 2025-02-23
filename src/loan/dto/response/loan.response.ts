import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class LoanResponse {
  @Expose()
  id: number;

  @Expose()
  amount: number;

  @Expose()
  purpose: string;

  @Expose()
  duration: number;

  @Expose()
  status: string;

  @Expose()
  total_paid: number;

  @Expose()
  remaining_balance: number;

  @Expose()
  @Type(() => Date)
  created_at: Date;
}
