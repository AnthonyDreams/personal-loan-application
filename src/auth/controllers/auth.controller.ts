import {
  Body,
  Controller,
  Request,
  Post,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import {
  RegisterUserRequestSchema,
  RegisterUserRequest,
} from '../dto/request/register-user-request';
import { ApiResponse } from 'src/shared/dto/api-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterUserRequestSchema))
    data: RegisterUserRequest,
  ) {
    await this.authService.createUser(data);

    return new ApiResponse('User registered successfully');
  }

  @Public()
  @HttpCode(200)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return new ApiResponse(
      'User logged in successfully',
      await this.authService.jwtSign(req.user),
    );
  }
}
