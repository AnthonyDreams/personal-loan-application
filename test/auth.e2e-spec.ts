import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/shared/prisma.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { v4 as uuidv4 } from 'uuid';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Valid payload matching your RegisterUserRequest Zod schema
  const validRegisterPayload = {
    email: uuidv4() + 'auth-test@example.com',
    name: 'Test User',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ThrottlerModule.forRoot([
          {
            ttl: 20000,
            limit: 1000,
          },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterPayload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'User registered successfully',
      });
    });

    it('should not allow duplicate registration', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterPayload);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Email already used');
    });

    it('should return validation errors for an invalid payload', async () => {
      const invalidPayload = {
        email: 'not-an-email',
        password: '123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterPayload);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: validRegisterPayload.email,
          password: validRegisterPayload.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'User logged in successfully',
          data: expect.objectContaining({
            access_token: expect.any(String),
          }),
        }),
      );
    });

    it('should return unauthorized for invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: validRegisterPayload.email,
          password: 'wrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return validation errors for an invalid login payload', async () => {
      const invalidPayload = {
        email: 'not-an-email',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidPayload);

      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });
  });
});
