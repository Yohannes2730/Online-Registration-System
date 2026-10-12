# Online Registration System — Full-Stack Development Prompt

## 1. Project Overview

Build a secure, functional, full-stack Online Registration System using **Next.js, NestJS with Fastify, Better Auth, Prisma, PostgreSQL, Redis, Docker, Docker Compose, and Nginx**.

The system must support user registration, email verification, OTP verification, authentication, password reset, session management, and role-based access control.

This is a real, integrated application, not a UI-only prototype. The frontend, backend, database, authentication, email service, Redis, and reverse proxy must work together.

**Important:** Follow the specified project structure, data models, API contracts, and technologies. Do not replace the requested stack, invent duplicate modules, or generate placeholder implementations for core features.

## 2. Required Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | NestJS with Fastify |
| Authentication | Better Auth |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache and temporary storage | Redis |
| Email delivery | SMTP using Nodemailer |
| Validation | class-validator and class-transformer |
| Containers | Docker and Docker Compose |
| Reverse proxy | Nginx |
| API testing | Postman |
| Version control | Git and GitHub |

Use TypeScript throughout the frontend and backend.

## 3. Core Functional Requirements

### A. User Registration

Implement a complete registration workflow that collects:

- `firstName`
- `lastName`
- `username`
- `birthDate`
- `phoneNumber`
- `email`
- `password`

Requirements:

- Validate all required fields.
- Validate email format, phone number, password strength, and date of birth.
- Enforce unique usernames, email addresses, and phone numbers.
- Hash passwords securely through Better Auth.
- Assign the `USER` role by default.
- Set `emailVerified` to `false` until verification succeeds.
- Send a verification email or OTP.
- Prevent duplicate accounts.
- Display clear validation and error messages on the frontend.

Do not store plaintext passwords or implement a separate, competing password-hashing system.

### B. Authentication with Better Auth

Use Better Auth as the primary authentication solution.

Implement:

- Email and password registration.
- Email and password login.
- Email verification.
- Password reset.
- Session creation, retrieval, and expiration.
- Logout and session invalidation.
- Protected backend endpoints.
- Frontend authentication state.
- Role-based authorization for `USER` and `ADMIN`.

Use Better Auth's supported APIs and configuration. Do not build a second authentication system using manually generated JWTs or duplicate login and registration endpoints unless a specific integration requirement makes them necessary.

Configure Better Auth to use the existing PostgreSQL database through the Prisma adapter and the correct custom user fields.

### C. Email Verification and OTP

Implement an email and OTP module integrated with Better Auth where appropriate.

Supported OTP types must match the Prisma enum:

- `EMAIL_VERIFICATION`
- `PASSWORD_RESET`
- `LOGOUT_VERIFICATION`

Requirements:

- Generate cryptographically secure OTPs.
- Store OTP records using the `Otp` model.
- Associate each OTP with the correct email and type.
- Set an expiration time.
- Verify the OTP and reject invalid, expired, or already-used codes.
- Track resend attempts using `resendCount`.
- Record the last resend time using `lastResendAt`.
- Implement resend cooldowns and rate limiting.
- Prevent brute-force verification attempts.
- Invalidate or consume an OTP after successful use.
- Never expose OTP values in production logs or API responses.
- Use Redis for temporary rate-limit and cooldown state when appropriate.

Ensure that verification and password-reset OTPs cannot be used interchangeably.

### D. Password Reset

Implement a secure password-reset flow:

1. The user requests a password reset using their email.
2. The backend initiates a Better Auth-supported reset flow or generates a typed reset OTP, according to the chosen integration.
3. The email service sends the verification code or reset link.
4. The user submits the required verification data and a new password.
5. The backend verifies the request and securely updates the password through Better Auth.
6. Previously issued reset codes are invalidated after successful use.
7. The system handles expired codes, repeated attempts, and invalid requests safely.

Do not directly update a user's password field using Prisma. Use Better Auth's supported password-management APIs.

### E. User Management

Implement user management with the following capabilities:

**Regular users**
- View their own profile.
- Update permitted personal information.
- View their account and email-verification status.
- Log out and manage their active session as supported.

**Administrators**
- View and search registered users.
- View individual user details.
- Update permitted user information.
- Activate or deactivate accounts.
- Manage roles with proper authorization.
- Delete users when permitted by the business rules.

Only `ADMIN` users may access administrative operations.

Never allow regular users to assign themselves the `ADMIN` role or modify protected fields through mass assignment.

### F. Email Service

Create a reusable email module using Nodemailer and SMTP.

Responsibilities:

- Send registration verification emails.
- Send OTP emails.
- Send password-reset emails.
- Handle SMTP errors.
- Record email delivery attempts in the `Email` model.
- Track `PENDING`, `SENT`, and `FAILED` statuses.
- Record failure details and retry counts.
- Record `sentAt` after a successful send.

Never return SMTP credentials or sensitive email-provider errors to clients.

## 4. Prisma Database Schema

Use the following schema as the database design baseline. Preserve the model names, field names, enum values, uniqueness constraints, and relationships unless a concrete compatibility issue requires a documented change.


```

### Prisma and Better Auth compatibility requirements

- Verify the schema against the installed Prisma version before generating the client.
- If using Prisma 6, the datasource URL can be configured in the schema as shown above.
- If using Prisma 7, follow the installed version's configuration requirements; do not blindly copy Prisma 6 configuration into Prisma 7.
- Configure the correct Better Auth Prisma adapter and map its expected fields to the existing models.
- Confirm the `User`, `Session`, `Account`, and `Verification` models satisfy the installed Better Auth version.
- If Better Auth requires additional fields or different model names, make only the necessary documented compatibility changes.
- Preserve the application-specific `Email` and `Otp` models.
- Generate and use the actual Prisma client. Do not use `any` as a substitute for Prisma typing.
- Keep database access inside a reusable `PrismaService` and module.
- Use migrations to apply schema changes; do not silently recreate or delete existing database data.

## 5. Backend Architecture

Use NestJS with Fastify. Keep the backend modular and maintainable without creating unnecessary abstractions.

Recommended structure:

```text
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── dto/
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   ├── email/
│   │   ├── email.module.ts
│   │   ├── email.service.ts
│   │   └── email.controller.ts
│   ├── otp/
│   │   ├── otp.module.ts
│   │   ├── otp.service.ts
│   │   └── dto/
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── redis/
│   │   ├── redis.module.ts
│   │   └── redis.service.ts
│   └── common/
│       ├── guards/
│       ├── decorators/
│       ├── filters/
│       └── interceptors/
├── test/
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

Treat this as the intended logical structure, not permission to duplicate existing files. Inspect the existing repository first and adapt the structure to the files already present.

### Backend implementation rules

- Use `FastifyAdapter` in `main.ts`.
- Configure the application to listen on `0.0.0.0` inside Docker.
- Configure a global validation pipe with `whitelist`, `transform`, and `forbidNonWhitelisted`.
- Use DTO classes and `class-validator`.
- Use dependency injection properly.
- Implement actual services, controllers, guards, and exception handling.
- Use typed Prisma queries and proper error handling.
- Protect sensitive routes and validate ownership and roles.
- Configure CORS according to the intended frontend origin.
- Add a health-check endpoint.
- Keep configuration in environment variables.
- Do not implement duplicate registration or login logic outside Better Auth.

## 6. API Design

Use a consistent `/api` prefix for application endpoints, with Better Auth mounted at its configured authentication base path.

Provide and document the following operations:

| Method | Purpose | Access |
|---|---|---|
| POST | Register a user through Better Auth | Public |
| POST | Sign in through Better Auth | Public |
| POST | Sign out through Better Auth | Authenticated |
| GET | Retrieve the current authenticated user | Authenticated |
| POST | Request or resend email verification | Public or authenticated as required by the selected flow |
| POST | Verify an email or OTP | According to the verification flow |
| POST | Request password reset | Public |
| POST | Complete password reset | Public with valid reset proof |
| GET | List users | ADMIN |
| GET | Retrieve a user by ID | ADMIN or authorized owner |
| PATCH | Update permitted user information | ADMIN or authorized owner |
| PATCH | Activate or deactivate a user | ADMIN |
| PATCH | Update a user's role | ADMIN |
| DELETE | Delete a user | ADMIN, subject to business rules |

Use Better Auth's actual endpoints for registration, login, logout, sessions, and password management. Implement custom NestJS endpoints only where the application needs additional business logic.

For every custom endpoint, document its HTTP method, exact path, access requirements, request DTO, response format, and error cases.

Provide realistic Postman examples. Do not invent endpoint paths and then present them as built-in Better Auth routes.

## 7. Frontend Architecture

Build a responsive Next.js application using TypeScript and reusable components.

Recommended structure:

```text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-email/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (user)/
│   │   │   └── dashboard/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/
│   │   ├── auth-client.ts
│   │   ├── api.ts
│   │   └── validation.ts
│   └── types/
├── Dockerfile
├── package.json
└── .env.example
```

### Frontend pages

- Landing page.
- Registration form.
- Login form.
- Email verification and OTP entry.
- Resend verification code.
- Forgot-password form.
- Reset-password form.
- User dashboard.
- Profile page.
- Admin dashboard.
- User management page.

### Frontend requirements

- Create a professional, accessible, responsive design.
- Use consistent form validation and loading states.
- Show clear success and error notifications.
- Prevent duplicate submissions.
- Integrate with the actual backend.
- Use Better Auth's client library and session handling.
- Display pages and actions based on authenticated user roles.
- Handle expired sessions and unauthorized responses.
- Keep secrets on the server and never expose SMTP passwords, database URLs, or Better Auth secrets to the browser.
- Do not use mock authentication or hardcoded user data as a substitute for working backend integration.

## 8. Redis Integration

Use Redis for temporary and performance-related operations where appropriate.

Required use cases:

- OTP resend cooldowns.
- Authentication and verification rate limiting.
- Temporary verification-related state where suitable.
- Caching frequently accessed, non-sensitive data.
- Session storage only if a compatible, explicitly configured Better Auth session-storage strategy is implemented.

PostgreSQL remains the primary persistent database. The `Otp` model is the durable source for OTP records when the database-backed design is used.

Do not claim Better Auth sessions are stored in Redis unless that integration is actually configured. Do not store plaintext passwords or unnecessary sensitive personal information in the cache.

## 9. Docker and Docker Compose

Containerize the application and its supporting services.

Required services:

- `frontend`
- `backend`
- `postgres`
- `redis`
- `nginx`

Requirements:

- Use a separate Dockerfile for the frontend and backend.
- Use Docker Compose to coordinate the services.
- Configure service-to-service communication through Docker's internal network.
- Use persistent storage for PostgreSQL.
- Configure Redis persistence only if required by the selected use case.
- Add health checks and appropriate startup dependencies.
- Use multi-stage builds where appropriate.
- Avoid running application containers as root when practical.
- Do not bake secrets into Docker images.
- Use the correct internal database and Redis hostnames in container configuration.
- Run Prisma generation during the correct build or startup stage.
- Apply production migrations safely using `prisma migrate deploy`.
- Do not run development migrations automatically in a production container.
- Ensure the application starts correctly from a clean checkout using documented setup instructions.

Provide `.dockerignore` files and example environment configuration for both applications.

## 10. Nginx Reverse Proxy

Configure Nginx to route traffic to the appropriate containers.

Example intended routing:

```text
Browser
   |
   v
Nginx :80
   |
   ├── /api/auth/*  --> Backend Better Auth handler
   ├── /api/*       --> NestJS Fastify backend
   └── /*           --> Next.js frontend
```

Adjust the exact paths to the configured Better Auth base path and NestJS global prefix.

Requirements:

- Preserve the intended API route paths.
- Forward appropriate headers.
- Support authentication cookies and credentials.
- Configure CORS consistently with the chosen deployment architecture.
- Configure request-size limits and reasonable timeouts.
- Provide a clear path for adding HTTPS in production.
- Ensure Next.js page routes are not accidentally sent to the backend.

## 11. Environment Variables

Create `.env.example` files with placeholders and explanations.

```

Adapt these examples to the actual ports, environment-loading strategy, and Nginx routing. When Nginx is the public entry point, distinguish the public application URL from internal container URLs.

Do not assume the same environment file is automatically loaded by every container. Explicitly configure environment variables in Docker Compose and document any application-specific environment files.

Generate strong production secrets separately. Never commit real credentials.

## 12. Security Requirements

- Hash passwords through Better Auth.
- Enforce role-based access control on the server.
- Validate and sanitize incoming data.
- Rate-limit authentication and OTP endpoints.
- Expire and invalidate verification codes appropriately.
- Protect against brute-force attacks.
- Use secure cookie settings appropriate to the environment.
- Configure trusted origins correctly.
- Prevent unauthorized role changes.
- Avoid leaking stack traces, credentials, passwords, or OTP values.
- Protect sensitive endpoints against inappropriate cross-origin requests.
- Use HTTPS in production.
- Apply least-privilege principles to database access and container configuration.

## 13. Testing and Verification

Provide a practical test plan covering:

- Registration with valid and invalid data.
- Duplicate username, email, and phone number.
- Login with valid and invalid credentials.
- Email verification success, failure, and expiration.
- OTP resend cooldowns and rate limiting.
- Password reset success and failure.
- Session retrieval and logout.
- Unauthorized access to protected routes.
- USER versus ADMIN permissions.
- Account activation and deactivation.
- Database connectivity.
- Redis connectivity.
- SMTP failure handling.
- Docker container health.
- Nginx routing.
- Frontend-to-backend integration.

Include Postman request examples and expected responses for the main flows.

## 14. Implementation and Delivery Instructions

Follow this implementation order:

1. Inspect the existing repository and identify the current framework versions and file structure.
2. Verify the Prisma schema and Better Auth compatibility.
3. Configure PostgreSQL and generate the Prisma client.
4. Implement PrismaService and the database module.
5. Configure Better Auth and integrate it with NestJS/Fastify.
6. Implement user management, email delivery, OTP logic, and authorization.
7. Implement the Next.js authentication pages and dashboards.
8. Integrate the frontend with the backend.
9. Configure Redis and Nginx.
10. Create Dockerfiles and Docker Compose configuration.
11. Test the complete application and fix integration issues.
12. Document installation, configuration, API endpoints, and deployment.

For every implementation stage:

- Provide the exact file paths and complete code for new or modified files.
- Explain the required installation commands.
- Keep the implementation consistent with the existing repository.
- Avoid duplicate modules, services, controllers, and configuration files.
- Do not use fake service implementations or `any` in place of proper types.
- Do not claim a feature works until its implementation and integration have been verified.
- If a version-specific issue arises, explain the cause and provide code for the installed version rather than mixing incompatible APIs.

## 15. Expected Deliverables

Deliver a complete, maintainable project containing:

- Functional Next.js frontend.
- NestJS/Fastify backend.
- Better Auth integration.
- Prisma schema and database migrations.
- PostgreSQL integration.
- Redis integration.
- OTP and email verification.
- Password-reset workflow.
- User and administrator authorization.
- SMTP email service.
- Dockerfiles and Docker Compose.
- Nginx configuration.
- Environment example files.
- Postman collection or equivalent API documentation.
- Setup and troubleshooting instructions.
- A README with working commands.

**Final objective:** A fully integrated Online Registration System that can be cloned, configured, started with Docker Compose, and tested end to end. Prioritize correctness, security, compatibility, and a clean project structure over unnecessary complexity.
