// src/common/dto/api-response.dto.ts
export class ApiResponse<T> {
  constructor(
    public message?: string,
    public data?: T,
  ) {}
}
