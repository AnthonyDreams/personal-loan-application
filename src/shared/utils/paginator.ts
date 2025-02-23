export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prevPage: number | null;
    nextPage: number | null;
  };
}

export type PaginateOptions = {
  page?: number | string;
  perPage?: number | string;
};

export type PaginateFunction = <T, Args extends { where?: any }>(
  model: {
    count: (args: any) => Promise<number>;
    findMany: (args: any) => Promise<T[]>;
  },
  args?: Args,
  options?: PaginateOptions,
) => Promise<PaginatedResult<T>>;

export const paginate: PaginateFunction = async <
  T,
  Args extends { where?: any },
>(
  model: {
    count: (args: { where?: any }) => Promise<number>;
    findMany: (
      args: { where?: any; skip: number; take: number } & Args,
    ) => Promise<T[]>;
  },
  args: Args = {} as Args,
  options?: PaginateOptions,
): Promise<PaginatedResult<T>> => {
  const page = Number(options?.page ?? 1);
  const perPage = Number(options?.perPage ?? 10);

  const skip = page > 0 ? perPage * (page - 1) : 0;
  const take = perPage;

  const [total, data] = await Promise.all([
    model.count({ where: args.where }),
    model.findMany({ ...args, skip, take }),
  ]);

  const lastPage = Math.ceil(total / perPage);

  return {
    data,
    meta: {
      total,
      lastPage,
      currentPage: page,
      perPage,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < lastPage ? page + 1 : null,
    },
  };
};
