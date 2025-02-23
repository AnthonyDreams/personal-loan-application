## Table of Contents

- [Technology Stack & Dependencies](#technology-stack--dependencies)
- [Architectural Approach & Folder Structure](#architectural-approach--folder-structure)
- [Setup & Usage](#setup--usage)
- [Testing](#testing)

## Technology Stack & Dependencies

- **NODE:22-ts**

- **NestJS:**  
  Provides a highly modular and opinionated framework for building scalable APIs with dependency injection and a clear separation of concerns.

  Opting for vanilla Express while trying for a modular, clean architecture with separation of concerns can ultimately force you to reinvent the wheel, essentially creating your own framework. This approach might be justified if you have valid reasons and a plan. However, for most projects, leveraging an established, opinionated framework like NestJS is the best choice. It abstracts much of the architectural complexity on your behalf while still providing the flexibility needed to implement your design decisions.

  Sometimes you have special requirements such as choosing a serverless infrastructure from the start, in that case, nestjs should no be your framework of choice as the overhead will make it painful to work on serverless, in that case a framework suited for serveless or simply opting for vanillar should be the go to.

- **Prisma & @prisma/client:**  
  Prisma serves as the ORM layer for interacting with PostgreSQL.

  It was chosen over sequelize because is more suiatable to use with typescript and the PRISMA CLIENT IS JUST REALLY COOL.

- **Validation (zod):**  
  Offers runtime schema validation for the api requests.

---

## Architectural Approach & Folder Structure

The project follows a **feature-based modular architecture**, which promotes separation of concerns, easier testing, and scalability.

```
├── Dockerfile
├── README.md
├── docker-compose.yml
├── nest-cli.json
├── package.json
├── prisma
│   ├── migrations
│   └── schema.prisma
├── src
│   ├── app.module.ts
│   ├── auth
│   │   ├── auth.module.ts
│   │   ├── controllers
│   │   │   ├── auth.controller.spec.ts
│   │   │   └── auth.controller.ts
│   │   ├── dto
│   │   │   └── request
│   │   │       ├── login.request.ts
│   │   │       └── register-user-request.ts
│   │   ├── exception
│   │   │   ├── email-already-used.exception.ts
│   │   │   └── user-no-admin-exception.ts
│   │   ├── guards
│   │   │   ├── admin.guard.ts
│   │   │   └── jwt-auth.guard.ts
│   │   ├── services
│   │   │   ├── auth.service.spec.ts
│   │   │   └── auth.service.ts
│   │   └── strategies
│   │       ├── jwt.strategy.ts
│   │       └── local.strategy.ts
│   ├── loan
│   │   ├── controllers
│   │   │   ├── admin.loan.controller.ts
│   │   │   ├── loan.controller.spec.ts
│   │   │   └── loan.controller.ts
│   │   ├── dto
│   │   │   ├── request
│   │   │   │   ├── admin-update-loan-status.request.ts
│   │   │   │   └── request-loan.request.ts
│   │   │   └── response
│   │   │       ├── loan.response.ts
│   │   │       ├── loans.response.ts
│   │   │       └── request-loan.response.ts
│   │   ├── exception
│   │   │   ├── cannot-update-loan-status.exception.ts
│   │   │   └── loan-not-found.exception.ts
│   │   ├── loan.module.ts
│   │   └── services
│   │       ├── loan.service.spec.ts
│   │       └── loan.service.ts
│   ├── main.ts
│   ├── payment
│   │   ├── dto
│   │   │   ├── request
│   │   │   │   └── create-payment.request.ts
│   │   │   └── response
│   │   │       ├── payment.response.ts
│   │   │       └── payments.response.ts
│   │   ├── exception
│   │   │   ├── cannot-register-payment.exception.ts
│   │   │   ├── payment-amount-exceeds-loan-remaining-balance.exception.ts
│   │   │   └── payment-not-found.exception.ts
│   │   ├── payment.controller.spec.ts
│   │   ├── payment.controller.ts
│   │   ├── payment.module.ts
│   │   ├── payment.service.spec.ts
│   │   └── payment.service.ts
│   └── shared
│       ├── decorators
│       │   └── public.decorator.ts
│       ├── dto
│       │   ├── api-response.dto.ts
│       │   └── query
│       │       └── pagination.ts
│       ├── pipes
│       │   └── zod-validation.pipe.ts
│       ├── prisma.service.ts
│       └── utils
│           └── paginator.ts
├── test
│   ├── admin.loan.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   ├── jest-e2e.json
│   ├── loan.e2e-spec.ts
│   ├── payment.e2e-spec.ts
│   └── setup.ts
├── tsconfig.build.json
└── tsconfig.json
```

### Key Architectural Decisions

1. **Modular Feature-Based Structure:**  
   Each domain (Auth, Loan, Payment) is encapsulated into its own module with dedicated controllers, services, DTOs, and exceptions. This isolation promotes easier maintenance, better scalability, and targeted testing.

2. **Separation of Shared Resources:**  
   The `shared` folder centralizes common code such as decorators, pipes, DTOs, and utilities. This reduces duplication and ensures consistent behavior across the application.

3. **Database & Infrastructure Separation:**  
   The `prisma` folder manages the database schema and migrations separately from application logic. Dockerfile and Docker Compose configurations ensure that the application can be easily containerized and deployed.

## About Authentication

### JWT

- **Stateless Authentication:**  
  The application employs stateless authentication using JSON Web Tokens (JWT). When a user logs in, they receive an access token whose expiration limit is defined by an environment variable.

- **Token Signing:**  
  For simplicity, token signing is performed using a basic secret key along with the default algorithm provided by the JWT library. This setup is sufficient but should be re-consider for real world scenarios.

- **Payload Structure:**  
  The JWT payload includes essential user information, which should be nested within a `user` property.

- **REFRESH TOKEN:**  
   Nice to have

**Example JWT Payload:**

```json
{
  "email": "asdas@ghmdail.com",
  "id": 15,
  "iat": 1740331625,
  "exp": 1740418025
}
```

## About Authorization

For admin needed endpoints we validate if the user exists in the config as admin, for more robust permission management the door is open to RBAC or ABAC.

```
ADMIN_EMAILS=test@example.com,asdas@ghmdail.com
```

## Setup & Usage

**Clone the repository:**

```bash
git clone <repository-url>
cd personal-loan-application
```

**Configure environment variables:**  

   Create a `.env` file at the root with necessary configurations by copying `.env.example` and renaming it

**USING Docker Setup:**  
 To run the application in Docker:

```bash
terminal(a)> docker-compose up --build
terminal(b)> docker compose exec api sh
terminal(b-docker-container)> npx prisma migrate dev
```

**ON host machine**

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run Database Migrations:**

   ```bash
   npx prisma migrate dev
   ```

3. **Build and start the application:**
   ```bash
   npm run build
   npm run start:dev
   ```

---

## Testing

- **Unit Tests:**  
  Run unit tests with:

  ```bash
  npm run test
  ```

- **End-to-End Tests:**  
  Execute e2e tests using:
  ```bash
  npm run test:e2e
  ```

---
