import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/shared/prisma.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { v4 as uuidv4 } from 'uuid';

describe('AdminLoanController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let prisma: PrismaService;
  let loanId: number;

  const adminUser = {
    email: uuidv4() + 'admin@example.com',
    name: 'Test User',
    password: 'adminPassword',
  };

  const nonAdminUser = {
    email: uuidv4() + 'non-admin@example.com',
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

    await request(app.getHttpServer()).post('/auth/register').send(adminUser);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(nonAdminUser);

    // Log in as admin to retrieve an access token.
    process.env.ADMIN_EMAILS = adminUser.email;
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });
    expect(loginResponse.status).toBe(200);
    adminAccessToken = loginResponse.body.data.access_token;
    const validPayload = {
      amount: 10000,
      duration: 12,
      purpose: 'Home renovation',
    };

    const response = await request(app.getHttpServer())
      .post('/loans/request')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send(validPayload);
    loanId = response.body.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('PATCH /admin/loans/:id/status', () => {
    it('should update the loan status successfully with a valid payload', async () => {
      const validPayload = {
        status: 'approved',
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/loans/${loanId}/status`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(validPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          status: 'APPROVED',
        }),
      );
    });

    it('should return validation errors for an invalid payload', async () => {
      const invalidPayload = {
        status: 123,
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/loans/${loanId}/status`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should return validation errors for an invalid payload', async () => {
      const loanId = '1';
      const invalidPayload = {
        status: 123,
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/loans/${loanId}/status`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should be forbidden for no adminUser', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: nonAdminUser.email,
          password: nonAdminUser.password,
        });
      const invalidPayload = {
        status: 123,
      };

      const response = await request(app.getHttpServer())
        .patch(`/admin/loans/${loanId}/status`)
        .set('Authorization', `Bearer ${loginResponse.body.data.access_token}`)
        .send(invalidPayload);

      expect(response.status).toBe(403);
    });
  });
});
