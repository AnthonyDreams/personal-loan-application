import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../shared/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailAlreadyUsedException } from '../exception/email-already-used.exception';
import { RegisterUserRequest } from '../dto/request/register-user-request';
import { mock } from 'jest-mock-extended';
import { User } from '@prisma/client';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = mock<JwtService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should throw EmailAlreadyUsedException if a user with the given email already exists', async () => {
      const data: RegisterUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: data.email,
        name: data.name,
        password: 'hashedPassword',
      });

      await expect(service.createUser(data)).rejects.toThrow(
        EmailAlreadyUsedException,
      );
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: data.email },
      });
    });

    it('should hash the password and create a new user if the email is not used', async () => {
      const data: RegisterUserRequest = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'plainPassword',
      };
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const hashedPassword = 'hashedPassword';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      const createdUser = {
        id: 'user-2',
        email: data.email,
        name: data.name,
        password: hashedPassword,
      };
      mockPrisma.user.create.mockResolvedValue(createdUser);

      const result = await service.createUser(data);

      expect(bcrypt.hash).toHaveBeenCalledWith(data.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
        },
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('validateUser', () => {
    it('should return null if no user is found for the given email', async () => {
      const email = 'nonexistent@example.com';

      mockPrisma.user.findUnique.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await service.validateUser(email, 'anyPassword');

      expect(result).toBeNull();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('anyPassword', '');	
    });

    it('should return null if the password does not match', async () => {
      const email = 'test@example.com';
      const user = {
        id: 'user-1',
        email,
        name: 'Test User',
        password: 'storedHashedPassword',
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await service.validateUser(email, 'wrongPassword');

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        user.password,
      );
    });

    it('should return the user if the password matches', async () => {
      const email = 'test@example.com';
      const user = {
        id: 'user-1',
        email,
        name: 'Test User',
        password: 'storedHashedPassword',
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.validateUser(email, 'correctPassword');

      expect(result).toEqual(user);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correctPassword',
        user.password,
      );
    });
  });

  describe('login', () => {
    it('should return an object containing an access_token', async () => {
      const user = mock<User>({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'storedHashedPassword',
      });
      const token = 'jwtToken';
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.jwtSign(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        id: user.id,
      });
      expect(result).toEqual({ access_token: token });
    });
  });
});
