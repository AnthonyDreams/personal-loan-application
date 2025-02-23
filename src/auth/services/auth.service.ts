import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../../shared/prisma.service';
import * as bcrypt from 'bcrypt';
import { EmailAlreadyUsedException } from '../exception/email-already-used.exception';
import { RegisterUserRequest } from '../dto/request/register-user-request';
import { JwtSign } from '../interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createUser(data: RegisterUserRequest): Promise<User> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new EmailAlreadyUsedException();
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prismaService.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    const doesPasswordMatch = await bcrypt.compare(
      password,
      user?.password ?? '',
    );

    if (!doesPasswordMatch) {
      return null;
    }

    return user;
  }

  jwtSign(user: User): JwtSign {
    const payload = { email: user.email, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
