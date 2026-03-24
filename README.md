# FTF DesignCo Backend (New)

Backend API for the FTF DesignCo platform, built with Express, TypeScript, MongoDB, and Socket.IO.

## Tech Stack

- Node.js + TypeScript
- Express 5
- MongoDB + Mongoose
- JWT authentication
- Socket.IO (real-time notifications)
- Pino logging
- Zod request validation
- Cloudinary (file/media)
- Nodemailer (email)

## Core Features

- User, auth, role, product, cart, order, contact, and analytics modules
- Role-based authorization (`owner`, `employer`, `admin`, `user`)
- Global error handling and consistent API response format
- Security middleware (CORS, Helmet, rate limiting, HPP, compression)
- File uploads via Multer
- Real-time notification delivery via Socket.IO rooms

## Project Structure

- [src/app.ts](src/app.ts): Express app setup and middleware
- [src/server.ts](src/server.ts): HTTP server, MongoDB connection, Socket.IO bootstrapping
- [src/router/index.ts](src/router/index.ts): Main API router (`/api/v1`)
- [src/modules](src/modules): Domain modules (auth, user, product, etc.)
- [src/middleware](src/middleware): Auth, validation, security, error middleware
- [src/utils](src/utils): Helpers (email, templates, token utils, response helpers)

## Getting Started

### 1) Prerequisites

- Node.js 18+
- npm
- MongoDB instance

### 2) Install dependencies

```bash
npm install
```

### 3) Create `.env`

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
MONGODB_URL=mongodb://127.0.0.1:27017/ftfdesignco

BCRYPT_SALT_ROUNDS=10
ADMIN_DEFAULT_RESET_PASSWORD=your_default_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_TOKEN_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=365d

RESET_PASSWORD_TOKEN_SECRET=your_reset_secret
RESET_EXPIRES_IN=10m

EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

AES_KEY=32_byte_hex_key
AES_IV=16_byte_hex_iv

BACKEND_URL=http://localhost:5000
```

### 4) Run in development

```bash
npm run dev
```

### 5) Build and run production

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` — Start development server with hot reload
- `npm run build` — Compile TypeScript to `dist`
- `npm start` — Run compiled server from `dist/server.js`
- `npm run lint` — Run ESLint
- `npm run lint:fix` — Auto-fix ESLint issues

## Base URL

- Local: `http://localhost:<PORT>`
- API prefix: `/api/v1`

Health/root check:

- `GET /` → `Hello World!`

## API Modules (Route Prefixes)

### Auth (`/api/v1/auth`)

- `POST /login`
- `POST /refresh-token`
- `POST /forgot-password`
- `POST /resend-forgot-otp`
- `POST /verify-otp`
- `POST /reset-password`
- `POST /change-password`
- `POST /admin/reset-password`

### User (`/api/v1/user`)

- `POST /register`
- `POST /employer-register`
- `GET /all-users`
- `GET /my-profile`
- `PUT /update-profile/:userID`
- `GET /admin_id`
- `DELETE /delete/:id`
- `PUT /update-balance`

### Role (`/api/v1/role`)

- `POST /create-role`
- `GET /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `PATCH /select-role`

### Product (`/api/v1/product`)

- `POST /create`
- `GET /all`
- `GET /inventories`
- `GET /type/:type`
- `GET /user/:roleId`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `GET /rigion/products`

### Cart (`/api/v1/cart`)

- `POST /`
- `GET /:userId`
- `PUT /:id`
- `DELETE /:id`
- `DELETE /clear/:userId`

### Order (`/api/v1/order`)

- `POST /`
- `GET /get-all`
- `GET /:id`
- `GET /user/:userId`
- `PUT /:id`
- `DELETE /:id`
- `GET /user/my-history`

### Contact (`/api/v1/contact`)

- `POST /send-message`

### Analytics (`/api/v1/analytics`)

- `GET /overview`
- `GET /export-orders`

## Socket.IO

Socket server is attached to the same HTTP server.

Client flow:

1. Connect to socket server
2. Emit `joinRoom` with your `userId`
3. Listen for `newNotification`

## Response Format

Most endpoints return:

```json
{
  "success": true,
  "message": "...",
  "statusCode": 200,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPage": 10
  }
}
```

## Security and Middleware

Applied globally in [src/middleware/security.ts](src/middleware/security.ts):

- CORS (credentials enabled)
- Helmet headers
- Global rate limiting
- Login-specific rate limiting
- HPP protection
- Compression
- Payload size limit (`10kb`)

## Notes

- Static files are served from [public](public).
- This project includes notification module files under [src/modules/notification](src/modules/notification), but those routes are not currently mounted in [src/router/index.ts](src/router/index.ts).

## License

ISC
