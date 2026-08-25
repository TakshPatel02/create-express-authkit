# create-express-authkit

A production-ready CLI tool to scaffold modular, secure **Node.js + Express** backends with **MongoDB** and pre-built **Authentication architectures**. Choose between lightweight JWT auth, Role-Based Access Control (RBAC), or complete OTP-based email password recovery — in JavaScript or TypeScript.

[![npm version](https://img.shields.io/npm/v/create-express-authkit)](https://www.npmjs.com/package/create-express-authkit)
[![npm downloads](https://img.shields.io/npm/dm/create-express-authkit)](https://www.npmjs.com/package/create-express-authkit)
[![license](https://img.shields.io/npm/l/create-express-authkit)](./LICENSE)

---

## 📖 Table of Contents

- [Overview & Templates](#-overview--templates)
- [Quick Start](#-quick-start)
- [Template Comparison](#-template-comparison)
- [Environment Configuration](#-environment-configuration)
- [API Reference & Examples](#-api-reference--examples)
  - [1. Basic Auth Strategy](#1-basic-auth-strategy)
  - [2. Role-Based Access Control (RBAC)](#2-role-based-access-control-rbac)
  - [3. OTP Verification Strategy](#3-otp-verification-strategy)
- [Project Architecture](#-project-architecture)
- [Security Architecture](#-security-architecture)
- [Customization & Extending](#-customization--extending)
- [Scripts Reference](#-scripts-reference)
- [Tech Stack](#-tech-stack)
- [License & Author](#-license--author)

---

## 🚀 Overview & Templates

`create-express-authkit` eliminates repetitive backend boilerplate by generating clean, modular MVC authentication architectures configured out-of-the-box.

### Available Authentication Strategies

| Template | Slug | Key Features | Best For |
| :--- | :--- | :--- | :--- |
| **Basic Auth** | `basic` | Username/Password, JWT Access Tokens, Rotating Refresh Tokens in HttpOnly cookies, Zod validation, Rate limiting | MVPs, Single-tenant apps, Mobile/SPA backends |
| **Role-Based Auth** | `role-based` | Everything in Basic + Multi-role schema (`user`, `admin`), `isAdmin` guard middleware, JWT role claims, protected route examples | SaaS, Dashboard backends, Admin panels |
| **OTP Verification** | `otp-verification` | Everything in Basic + Forgot Password, 6-digit email OTPs, Nodemailer + Gmail App Passwords, Single-use JTI Reset Tokens | Consumer apps, High-security workflows |

---

## 📦 Quick Start

Scaffold a new project in seconds with `npx` (no global installation required):

```bash
npx create-express-authkit <project-name>
```

### Interactive CLI Walkthrough

```text
? Choose your language:
  ● JavaScript
  ○ TypeScript

? Choose authentication strategy:
  ● Basic Auth (Email/Password + JWT + Refresh Token)
  ○ OTP Verification (Email OTP + Password Reset)
  ○ Role-Based Auth (User & Admin RBAC)
```

All dependencies are automatically installed during scaffolding.

### Getting Started Steps

```bash
# 1. Enter project directory
cd <project-name>

# 2. Copy environment file
cp .env.example .env          # macOS / Linux
copy .env.example .env        # Windows

# 3. Configure .env with your MongoDB URL and JWT Secrets

# 4. Start local development
npm run dev
```

---

## ⚖️ Template Comparison

| Feature | Basic | Role-Based | OTP Verification |
| :--- | :---: | :---: | :---: |
| **Language Support** | JavaScript | JavaScript | JavaScript / TypeScript |
| **Express 5 + MongoDB** | ✅ | ✅ | ✅ |
| **Password Hashing (bcrypt)** | ✅ | ✅ | ✅ |
| **Access Tokens (JWT)** | ✅ | ✅ | ✅ |
| **Rotating Refresh Tokens** | ✅ | ✅ | ✅ |
| **HttpOnly Secure Cookies** | ✅ | ✅ | ✅ |
| **Zod Schema Validation** | ✅ | ✅ | ✅ |
| **Rate Limiting** | ✅ | ✅ | ✅ |
| **Multi-Role RBAC (`user`/`admin`)** | ❌ | ✅ | ❌ |
| **Role Guard Middleware (`isAdmin`)** | ❌ | ✅ | ❌ |
| **Email Delivery (Nodemailer)** | ❌ | ❌ | ✅ |
| **Email OTP Verification** | ❌ | ❌ | ✅ |
| **Single-Use Password Reset** | ❌ | ❌ | ✅ |

---

## ⚙️ Environment Configuration

Each template includes a minimal `.env.example` tailored to its requirements.

### Variable Matrix

| Variable | Description | Basic | Role-Based | OTP Verification |
| :--- | :--- | :---: | :---: | :---: |
| `PORT` | Port the Express server listens on (default: `8000`) | Required | Required | Required |
| `MONGODB_URL` | MongoDB connection URI | Required | Required | Required |
| `ACCESS_JWT_SECRET` | Secret key used to sign Access Tokens | Required | Required | Required |
| `REFRESH_JWT_SECRET` | Secret key used to sign Refresh Tokens | Required | Required | Required |
| `ACCESS_JWT_EXPIRES_IN` | Access token lifespan (default: `15m`) | Optional | Optional | Optional |
| `REFRESH_JWT_EXPIRES_IN` | Refresh token lifespan (default: `7d`) | Optional | Optional | Optional |
| `CORS_ORIGIN` | Allowed client origin (e.g. `http://localhost:5173`) | Required | Required | Required |
| `JWT_RESET_PASSWORD_TOKEN_SECRET` | Secret key for temporary password reset tokens | ❌ | ❌ | Required |
| `RESET_PASSWORD_JWT_EXPIRES_IN` | Reset token lifespan (default: `15m`) | ❌ | ❌ | Optional |
| `GOOGLE_USER` | Gmail address for sending emails | ❌ | ❌ | Required |
| `GOOGLE_APP_PASSWORD` | 16-character Gmail App Password | ❌ | ❌ | Required |

---

## 🔌 API Reference & Examples

All authentication routes are mounted under the base path: **`/api/v1/users`**.

---

### 1. Basic Auth Strategy

#### Routes

| Method | Endpoint | Auth Required | Rate Limiting | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/register` | No | 5 req / 1 hr (IP) | Register new user |
| `POST` | `/login` | No | 20 req / 15m (IP) + 5 req / 1h (Email) | Authenticate user & issue tokens |
| `DELETE` | `/logout` | No (Cookie) | None | Invalidate refresh token & clear cookie |
| `POST` | `/refresh-token` | No (Cookie) | 20 req / 15m (IP) | Rotate access and refresh tokens |
| `GET` | `/health` | No | None | System health check (`{ "status": "ok" }`) |

#### Examples

<details>
<summary><strong>POST /api/v1/users/register</strong></summary>

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "67b8f9e1234567890abcdef1"
}
```
</details>

<details>
<summary><strong>POST /api/v1/users/login</strong></summary>

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
*Note: A secure, HttpOnly `refreshToken` cookie is automatically set on the response header.*
</details>

<details>
<summary><strong>POST /api/v1/users/refresh-token</strong></summary>

**Headers:** Must include the `refreshToken` HttpOnly cookie.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Access token refreshed successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
</details>

<details>
<summary><strong>DELETE /api/v1/users/logout</strong></summary>

**Headers:** Must include the `refreshToken` HttpOnly cookie.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```
</details>

---

### 2. Role-Based Access Control (RBAC)

Includes all standard auth endpoints plus role assignment and role-guard middleware.

#### Routes

| Method | Endpoint | Auth Required | Middleware | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/register` | No | `registerLimiter` | Register user (optional `role`: `"user"` or `"admin"`) |
| `POST` | `/login` | No | `loginIpLimiter`, `loginEmailLimiter` | Login (returns JWT with `role` claim) |
| `DELETE` | `/logout` | No (Cookie) | None | Logout and clear cookie |
| `POST` | `/refresh-token` | No (Cookie) | `refreshTokenLimiter` | Refresh access token (retains `role` claim) |
| `GET` | `/admin-only` | Bearer Token | `authMiddleware`, `isAdmin` | Sample admin-protected endpoint |

#### Examples

<details>
<summary><strong>POST /api/v1/users/register (with Role)</strong></summary>

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPassword123",
  "role": "admin"
}
```
*(If `role` is omitted, it defaults to `"user"`).*

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "67b8fa98765432100fedcba2"
}
```
</details>

<details>
<summary><strong>GET /api/v1/users/admin-only</strong></summary>

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Welcome, Admin!"
}
```

**Forbidden Response (403 Forbidden - non-admin user):**
```json
{
  "success": false,
  "message": "Forbidden: Admins only"
}
```
</details>

---

### 3. OTP Verification Strategy

Includes full password reset lifecycle with 6-digit email OTPs.

#### Routes

| Method | Endpoint | Auth Required | Rate Limiting | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/forget-password` | No | 5 req / 15m (Email+IP) | Send 6-digit OTP to user's email |
| `POST` | `/verify-reset-otp` | No | 10 req / 15m (Email+IP) | Verify OTP & receive single-use reset token |
| `POST` | `/reset-password` | Reset Token | 10 req / 15m (Email+IP) | Update password using reset token |

#### Examples

<details>
<summary><strong>POST /api/v1/users/forget-password</strong></summary>

**Request Body:**
```json
{
  "email": "jane@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "If this email exists, an OTP has been sent."
}
```
*Note: Returns a timing-safe generic response to prevent email enumeration attacks.*
</details>

<details>
<summary><strong>POST /api/v1/users/verify-reset-otp</strong></summary>

**Request Body:**
```json
{
  "email": "jane@example.com",
  "otp": "839201"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password.",
  "data": {
    "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
</details>

<details>
<summary><strong>POST /api/v1/users/reset-password</strong></summary>

**Headers:**
```http
Authorization: Bearer <resetToken>
```

**Request Body:**
```json
{
  "newPassword": "NewSecurePassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully. Please log in with your new password."
}
```
</details>

---

## 📂 Project Architecture

All templates strictly adhere to clean MVC layering and separation of concerns:

```
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── index.js / index.ts         # Server bootstrap & DB connection
├── package.json                # Project dependencies & scripts
└── src/
    ├── app.js / app.ts         # Express instance, CORS, global middlewares & 404
    ├── config/
    │   └── db.js / db.ts       # Mongoose connection logic
    ├── controllers/
    │   └── user.controller.*   # Auth flow handlers (register, login, refresh, etc.)
    ├── middlewares/
    │   ├── auth.middleware.*   # JWT Bearer verification
    │   ├── isAdmin.middleware.*# Role guard (role-based template)
    │   └── rateLimiter.*       # express-rate-limit definitions
    ├── models/
    │   ├── user.model.*        # Mongoose User schema
    │   ├── otp.model.*         # OTP schema with TTL (OTP template)
    │   └── resetToken.model.*  # Single-use reset tokens with JTI (OTP template)
    ├── routes/
    │   └── user.routes.*       # Express router definitions
    ├── services/
    │   └── email.service.*     # Nodemailer transport (OTP template)
    ├── utils/
    │   ├── token.util.*        # Access & Refresh token signing
    │   └── otp.util.*          # Crypto random OTP & HTML email templates
    └── validations/
        └── user.validation.*   # Zod request validation schemas
```

---

## 🔒 Security Architecture

`create-express-authkit` implements modern web security standards:

1. **Password Hashing**: Passwords are salted and hashed using **bcrypt** with 10 salt rounds.
2. **HttpOnly Secure Cookies**:
   - `httpOnly: true` (prevents JavaScript/XSS access)
   - `sameSite: 'Strict'` (CSRF protection)
   - `secure: process.env.NODE_ENV === 'production'` (enforces HTTPS in production while allowing local HTTP development)
   - `maxAge: 7 * 24 * 60 * 60 * 1000` (7-day cookie expiration matching token lifetime)
3. **Refresh Token Rotation**:
   - Every refresh request generates a new access token AND a new refresh token.
   - The user document in MongoDB is updated with the new refresh token, immediately invalidating the prior one.
4. **Compound Rate Limiting**:
   - **IP Limiter**: Limits requests based on client IP.
   - **Compound Limiter (`email:IP`)**: Derives rate limits based on both the targeted email and client IP, preventing distributed brute force on specific user accounts.
5. **Anti-Enumeration Protections**: Password recovery endpoints return ambiguous success responses to prevent attackers from determining whether an email exists in the database.
6. **Single-Use JTI Claims**: Password reset tokens carry unique UUID `jti` identifiers and are flagged as `used: true` upon first submission.

---

## 🛠️ Customization & Extending

### Protecting New Routes with Authentication

```javascript
import express from 'express';
import { authMiddleware } from './middlewares/auth.middleware.js';

const router = express.Router();

// Any authenticated user
router.get('/profile', authMiddleware, (req, res) => {
    res.json({ success: true, user: req.user });
});

export default router;
```

### Adding Role-Based Guards (RBAC)

In [`middlewares/isAdmin.middleware.js`](file:///c:/Users/Taksh%20Patel/Desktop/Backend%20Development/Auth-npm-package/templates/js/role-based/src/middlewares/isAdmin.middleware.js), chain `authMiddleware` before `isAdmin`:

```javascript
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/isAdmin.middleware.js';

// Admins only
router.delete('/users/:id', authMiddleware, isAdmin, deleteUserController);
```

### Custom Role Factory (`authorizeRoles`)

To support arbitrary roles (`moderator`, `editor`, `admin`), create a reusable role checker:

```javascript
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Requires one of [${roles.join(', ')}]`
            });
        }
        next();
    };
};
```

---

## 📜 Scripts Reference

### JavaScript Projects

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `node --watch index.js` | Starts server with native Node watch mode |
| `npm start` | `node index.js` | Starts production server |

### TypeScript Projects

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `tsx watch src/index.ts` | Development server with instant TypeScript reloading |
| `npm run build`| `tsc` | Transpiles TypeScript into `/dist` |
| `npm start` | `node dist/index.js` | Runs the compiled production build |

---

## 🧰 Tech Stack

- **Runtime**: Node.js (ESM)
- **Framework**: Express v5
- **Database**: MongoDB with Mongoose ODM
- **Tokens**: `jsonwebtoken` (JWT)
- **Hashing**: `bcrypt`
- **Validation**: `zod`
- **Rate Limiter**: `express-rate-limit`
- **Email**: `nodemailer` (in OTP template)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/TakshPatel02/create-express-authkit/issues).

## 📄 License

This project is [MIT](./LICENSE) licensed.

## 👤 Author

**Taksh Patel**
- GitHub: [@TakshPatel02](https://github.com/TakshPatel02)

---

<p align="center">
  <sub>Built with ❤️ to save developers hundreds of hours of backend boilerplate. Give it a ⭐ if it helped you!</sub>
</p>