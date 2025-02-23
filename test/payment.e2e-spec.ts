import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaService } from 'src/shared/prisma.service';
import { PaymentResponse } from 'src/payment/dto/response/payment.response';
import { LoanResponse } from 'src/loan/dto/response/loan.response';

describe('PaymentController (e2e) with Auth', () => {
  let app: INestApplication;
  let accessToken: string;
  let adminAccessToken: string;
  let prisma: PrismaService;
  let payment: PaymentResponse;
  let approvedLoan: LoanResponse;

  const adminUser = {
    email: 'admin@example.com',
    name: 'Test User',
    password: 'adminPassword',
  };

  const nonAdminUser = {
    email: 'non-admin@example.com',
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

    // Log in to obtain the access token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: nonAdminUser.email,
        password: nonAdminUser.password,
      });
    expect(loginResponse.status).toBe(200);
    accessToken = loginResponse.body.data.access_token;

    process.env.ADMIN_EMAILS = adminUser.email;
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });
    expect(adminLoginResponse.status).toBe(200);
    adminAccessToken = adminLoginResponse.body.data.access_token;

    // Create a payment
    const validLoan = {
      amount: 10000,
      duration: 12,
      purpose: 'Home renovation',
    };

    const loanResponse = await request(app.getHttpServer())
      .post('/loans/request')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validLoan);

    approvedLoan = loanResponse.body;

    await request(app.getHttpServer())
      .patch(`/admin/loans/${approvedLoan.id}/status`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        status: 'approved',
      });

    const validPayload = {
      amount_paid: 200,
      loan_id: approvedLoan.id,
    };

    const response = await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validPayload)
      .expect(201);

    payment = response.body;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /payments/:id', () => {
    it('should return a payment for the authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/payments/${payment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
        }),
      );
    });
  });

  describe('POST /payments', () => {
    it('should create a payment with a valid payload', async () => {
      const validPayload = {
        amount_paid: 200,
        loan_id: approvedLoan.id,
      };

      const loan = await request(app.getHttpServer())
        .get(`/loans/${approvedLoan.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validPayload)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          amount_paid: validPayload.amount_paid,
          loan: expect.objectContaining({
            id: approvedLoan.id,
            total_paid: loan.body.total_paid + validPayload.amount_paid,
            remaining_balance: loan.body.remaining_balance - validPayload.amount_paid,
          }),
        }),
      );
    });

    it('should throw bad request if amount_paid exceeds loan remaining balance', async () => {
      const validPayload = {
        amount_paid: 500000000000,
        loan_id: approvedLoan.id,
      };

      const response = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validPayload)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should throw bad request if payment is not approved', async () => {
      const validLoan = {
        amount: 10000,
        duration: 12,
        purpose: 'Home renovation',
      };

      const loanResponse = await request(app.getHttpServer())
        .post('/loans/request')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validLoan);

      const loanId = loanResponse.body.id;

      const validPayload = {
        amount_paid: 200,
        loan_id: loanId,
      };

      const response = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validPayload)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
    it('should return validation errors for an invalid payload', async () => {
      const invalidPayload = {
        amount: 'invalid',
      };

      const response = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });
});
