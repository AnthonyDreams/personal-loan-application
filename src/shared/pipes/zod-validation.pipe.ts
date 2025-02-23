/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      throw new BadRequestException({
        message: 'Validation failed',
        errors: fieldErrors,
      });
    }
    return result.data;
  }
}
