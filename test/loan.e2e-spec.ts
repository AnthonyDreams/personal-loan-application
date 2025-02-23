import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { v4 as uuidv4 } from 'uuid';

describe('LoanController (e2e) with Auth', () => {
  let app: INestApplication;
  let accessToken: string;

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
    await app.init();

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /loans', () => {
    it('should return a paginated list of loans for the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/loans')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, per_page: 10 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toMatchObject({
        total: expect.any(Number),
        lastPage: expect.any(Number),
        currentPage: 1,
        perPage: 10,
        prevPage: null,
        nextPage: null,
      });
    });
  });

  describe('POST /loans/request', () => {
    it('should create a new loan request with valid payload', async () => {
      const validPayload = {
        amount: 10000,
        duration: 12,
        purpose: 'Home renovation',
      };

      const response = await request(app.getHttpServer())
        .post('/loans/request')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          amount: validPayload.amount,
          duration: validPayload.duration,
        }),
      );
    });

    it('should return validation errors for an invalid loan request payload', async () => {
      const invalidPayload = {
        term: 12,
      };

      const response = await request(app.getHttpServer())
        .post('/loans/request')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /loans/:id/payments', () => {
    it('should return a paginated list of payments for a specific loan', async () => {
      const validPayload = {
        amount: 10000,
        duration: 12,
        purpose: 'Home renovation',
      };

      const loan = await request(app.getHttpServer())
        .post('/loans/request')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validPayload);

      const response = await request(app.getHttpServer())
        .get(`/loans/${loan.body.id}/payments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, per_page: 5 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toMatchObject({
        total: expect.any(Number),
        lastPage: expect.any(Number),
        currentPage: 1,
        perPage: 5,
        prevPage: null,
        nextPage: null,
      });
    });
  });
});
