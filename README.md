# create-express-authkit

A powerful, production-ready CLI tool to scaffold a **Node.js + Express** backend with **MongoDB** and a complete **JWT Authentication** system — including password reset with email OTP. Get your backend up and running in seconds, not hours.

[![npm version](https://img.shields.io/npm/v/create-express-authkit)](https://www.npmjs.com/package/create-express-authkit)
[![license](https://img.shields.io/npm/l/create-express-authkit)](./LICENSE)

---

## ✨ Features

| Category | What you get |
| --- | --- |
| **Language** | Choose between **JavaScript** or **TypeScript** during setup |
| **Framework** | Express v5 with a clean MVC architecture |
| **Database** | MongoDB via Mongoose |
| **Authentication** | JWT-based auth with Access Token + Refresh Token rotation |
| **Password Reset** | Full forgot-password flow — OTP via email → verify → reset |
| **Validation** | Request validation with **Zod** schemas |
| **Email** | Nodemailer with Gmail OAuth2 for sending OTP emails |
| **Security** | bcrypt password hashing, HTTP-only secure cookies, rate limiting |
| **Rate Limiting** | `express-rate-limit` on sensitive endpoints (forgot-password, verify-OTP) |
| **Error Handling** | Global error handler + 404 catch-all pre-configured |
| **Dev Experience** | `node --watch` (JS) or `tsx watch` (TS) for hot-reload during development |
| **Modern JS** | ESM (`type: "module"`) throughout |

---

## 📦 Quick Start

Scaffold a new project instantly with `npx` — no global install needed:

```bash
npx create-express-authkit <project-name>
```

You'll be prompted to choose your language:

```
? Choose your language: › 
❯ JavaScript
  TypeScript
```

**Example:**

```bash
npx create-express-authkit my-backend
```

> All dependencies are automatically installed during scaffolding.

### Next Steps

```bash
# 1. Navigate into your project
cd my-backend

# 2. Copy the environment file
cp .env.example .env          # macOS / Linux
copy .env.example .env        # Windows

# 3. Update .env with your own values (see Environment Variables below)

# 4. Start the dev server
npm run dev
```

> **TypeScript projects** also support `npm run build` and `npm start` for production builds.

---

## ⚙️ Environment Variables

The generated `.env.example` includes all required variables:

```env
PORT=8000

# MongoDB
MONGODB_URL=mongodb://127.0.0.1:27017/authentication

# JWT Secrets — replace with strong, unique secrets
ACCESS_JWT_SECRET=your_access_jwt_secret_key
REFRESH_JWT_SECRET=your_refresh_jwt_secret_key
JWT_RESET_PASSWORD_TOKEN_SECRET=your_reset_password_jwt_secret_key

# JWT Expiry
ACCESS_JWT_EXPIRES_IN=15m
REFRESH_JWT_EXPIRES_IN=7d
RESET_PASSWORD_JWT_EXPIRES_IN=15m

# CORS
CORS_ORIGIN=http://localhost:5173

# Gmail OAuth2 (for sending OTP emails)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_USER=your_google_user@gmail.com
```

---

## 🔌 API Reference

All auth routes are mounted at **`/api/v1/users`**.

| Method | Endpoint | Auth | Rate Limited | Description |
| --- | --- | --- | --- | --- |
| `POST` | `/register` | ✗ | ✗ | Register a new user |
| `POST` | `/login` | ✗ | ✗ | Login and receive tokens |
| `DELETE` | `/logout` | ✔ | ✗ | Logout and clear refresh token |
| `POST` | `/refresh-token` | ✗ | ✗ | Rotate access & refresh tokens |
| `POST` | `/forget-password` | ✗ | ✔ | Send a password-reset OTP to email |
| `POST` | `/verify-reset-otp` | ✗ | ✔ | Verify the OTP and receive a reset token |
| `POST` | `/reset-password` | ✗ | ✗ | Reset password using the reset token |

A health-check endpoint is also available:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Returns `{ "status": "ok" }` |

### Request & Response Examples

<details>
<summary><strong>POST /api/v1/users/register</strong></summary>

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "665f..."
}
```
</details>

<details>
<summary><strong>POST /api/v1/users/login</strong></summary>

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOi..."
}
```

> The refresh token is set as an HTTP-only cookie automatically.
</details>

<details>
<summary><strong>POST /api/v1/users/forget-password</strong></summary>

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If this email exists, an OTP has been sent."
}
```
</details>

<details>
<summary><strong>POST /api/v1/users/verify-reset-otp</strong></summary>

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "482910"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password.",
  "data": {
    "resetToken": "eyJhbGciOi..."
  }
}
```
</details>

<details>
<summary><strong>POST /api/v1/users/reset-password</strong></summary>

**Headers:**
```
Authorization: Bearer <resetToken>
```

**Request Body:**
```json
{
  "newPassword": "newSecurePassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully. Please log in with your new password."
}
```
</details>

---

## 📂 Project Structure

The generated boilerplate follows a clean, maintainable architecture:

### JavaScript

```
├── .env.example
├── .gitignore
├── index.js                    # Entry point
├── package.json
└── src/
    ├── app.js                  # Express app configuration & middleware
    ├── config/                 # Database connection
    ├── controllers/            # Route handlers (user.controller.js)
    ├── middlewares/             # Auth guard & rate limiters
    ├── models/                 # Mongoose schemas (User, OTP, ResetToken)
    ├── routes/                 # Express route definitions
    ├── services/               # Email service (Nodemailer + Gmail OAuth2)
    ├── utils/                  # Token generation, OTP utilities
    └── validations/            # Zod request validation schemas
```

### TypeScript

```
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
└── src/
    ├── index.ts                # Entry point
    ├── app.ts                  # Express app configuration & middleware
    ├── config/                 # Database connection
    ├── controllers/            # Route handlers (user.controller.ts)
    ├── middlewares/             # Auth guard & rate limiters
    ├── models/                 # Mongoose schemas (User, OTP, ResetToken)
    ├── routes/                 # Express route definitions
    ├── services/               # Email service (Nodemailer + Gmail OAuth2)
    ├── types/                  # Custom TypeScript type definitions
    ├── utils/                  # Token generation, OTP utilities
    └── validations/            # Zod request validation schemas
```

---

## 🔒 Security Highlights

- **Password hashing** — All passwords are hashed with bcrypt (10 salt rounds) before storage.
- **HTTP-only cookies** — Refresh tokens are stored in `Secure`, `HttpOnly`, `SameSite: Strict` cookies to prevent XSS attacks.
- **Token rotation** — On every refresh, both access and refresh tokens are rotated and the old refresh token is invalidated.
- **OTP brute-force protection** — OTP attempts are tracked per record (max 5 attempts), and the OTP is deleted after exceeding the limit.
- **Rate limiting** — Forgot-password (5 req/15min) and verify-OTP (10 req/15min) endpoints are rate-limited per email/IP.
- **Single-use reset tokens** — Password reset tokens include a unique `jti` claim and are marked as used after a single successful reset.
- **Timing-safe responses** — The forgot-password endpoint always returns the same response regardless of whether the email exists.

---

## 🛠️ Built With

| Dependency | Purpose |
| --- | --- |
| [Express 5](https://expressjs.com/) | Web framework |
| [Mongoose](https://mongoosejs.com/) | MongoDB ODM |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT signing & verification |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Password hashing |
| [Zod](https://zod.dev/) | Schema validation |
| [Nodemailer](https://nodemailer.com/) | Email delivery |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | Rate limiting |
| [cookie-parser](https://github.com/expressjs/cookie-parser) | Cookie parsing |
| [cors](https://github.com/expressjs/cors) | Cross-origin resource sharing |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable loading |

TypeScript projects additionally include `tsx` for development and `typescript` for compilation.

---

## 📜 Scripts

### JavaScript

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `node --watch index.js` | Start dev server with auto-restart |
| `start` | `node index.js` | Start production server |

### TypeScript

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `tsx watch src/index.ts` | Start dev server with auto-restart |
| `build` | `tsc` | Compile TypeScript to JavaScript |
| `start` | `node dist/index.js` | Start compiled production server |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

## 👤 Author

**Taksh Patel**

---

<p align="center">
  <sub>If this tool saved you time, consider giving it a ⭐ on <a href="https://github.com/TakshPatel02/create-express-authkit">GitHub</a>!</sub>
</p>