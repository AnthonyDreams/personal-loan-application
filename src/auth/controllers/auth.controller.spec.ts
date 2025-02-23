import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from 'src/shared/dto/api-response.dto';
import { RegisterUserRequest } from '../dto/request/register-user-request';
import { mock } from 'jest-mock-extended';
import { User } from '@prisma/client';
import { JwtSign } from '../interfaces/auth.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = mock<AuthService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.createUser with provided data and return a success ApiResponse', async () => {
      const registerData: RegisterUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      mockAuthService.createUser.mockResolvedValueOnce(mock<User>());

      const result = await controller.register(registerData);

      expect(authService.createUser).toHaveBeenCalledWith(registerData);
      expect(result).toEqual(new ApiResponse('User registered successfully'));
    });
  });

  describe('login', () => {
    it('should call authService.login with req.user and return an ApiResponse with the token', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
      };
      const req = { user };

      const loginResponse: JwtSign = { access_token: 'jwtToken' };
      mockAuthService.jwtSign.mockReturnValueOnce(loginResponse);

      const result = await controller.login(req);

      expect(authService.jwtSign).toHaveBeenCalledWith(user);
      expect(result).toEqual(
        new ApiResponse('User logged in successfully', loginResponse),
      );
    });
  });
});
