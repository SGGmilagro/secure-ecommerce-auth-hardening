# Secure E-commerce Backend  
### JWT Authentication with Refresh Token Rotation

---

## About This Project

This repository is based on the original open-source project:

**Node.js E-Commerce API**  
by [Dinush Chathurya](https://dinushchathurya.github.io/)

The original project provides a complete Express + MongoDB E-commerce backend with support for:

- User management  
- Categories  
- Products  
- Orders  
- Image uploads  

This fork extends the original foundation by implementing a **production-style authentication and token security architecture**, including refresh token rotation, hashing, revocation, and protected route middleware.

---

# Security Enhancements Added in This Fork

This fork introduces a modern authentication system with:

- Short-lived JWT access tokens (15 min)
- Cryptographically secure refresh tokens
- Refresh token hashing (SHA-256)
- Refresh token rotation
- Refresh token revocation
- Protected route middleware
- Proper HTTP status enforcement (401 / 403)

The goal is to demonstrate backend security best practices layered on top of a full-featured E-commerce API.

---

# Authentication Architecture

##  Access Tokens
- JWT-based
- 15-minute expiration
- Sent via:
  	Authorization: Bearer <access_token>
	- Used to access protected routes

##  Refresh Tokens
- 64-byte cryptographically secure random tokens
- Hashed before storing in database
- Valid for 7 days
- Rotated on every refresh
- Revoked after use (prevents replay attacks)

---

#  Token Lifecycle

## 1️Login
- Validate credentials (bcrypt)
- Issue access token
- Generate refresh token
- Hash and store refresh token
- Return both tokens

## 2️Access Protected Route
- Client sends access token
- Middleware verifies JWT
- If expired → 403
- If missing → 401

## 3️Refresh Token Rotation
- Client sends refresh token
- Server verifies hash
- Old token revoked
- New refresh token issued
- New access token issued

## 4️Logout
- Refresh token marked as revoked
- Session invalidated

---

#  API Endpoints

## Public Authentication Routes
POST /api/v1/users/register
POST /api/v1/users/login
POST /api/v1/users/refresh
POST /api/v1/users/logout

## Protected User Routes
GET /api/v1/users
GET /api/v1/users/:id
GET /api/v1/users/get/count
DELETE /api/v1/users/:id


---

#  Original E-Commerce API Features

The original project includes:

## Users
- Register
- Login
- List users
- Get single user
- Delete user
- User count

## Categories
- Create
- Read
- Update
- Delete

## Products
- Create
- Update
- Delete
- Upload product images
- Featured products
- Product counts

## Orders
- Create order
- Get orders
- Get total sales
- Get user orders
- Update order
- Delete order

---

#  Project Structure
config/
helpers/
models/
routes/
app.js

Security-related additions:

- `helpers/requireAuth.js`
- `models/RefreshToken.js`
- Updated `routes/users.js` authentication logic
- Environment-based configuration

---

#  Environment Variables

Create a `.env` file:
API_URL=/api/v1
MONGODB_URI=mongodb://... ... .../ecommerce
secret=your_super_secret_key

---

# Run Locally
git clone <your-fork-url>
cd nodejs-ecommerce-api
npm install
node app.js

Server runs on: https://localhost3000


---

#  Security Design Decisions

| Feature | Purpose |
|----------|----------|
| bcrypt (12 rounds) | Secure password storage |
| Short-lived access tokens | Limit exposure window |
| Refresh token hashing | Protect against DB compromise |
| Token rotation | Prevent replay attacks |
| Revocation flag | Enable forced logout |
| Environment variables | Protect secrets |

---

#  Purpose of This Fork

This fork was created to demonstrate:

- Secure authentication architecture
- JWT lifecycle management
- Token rotation strategies
- Backend middleware enforcement
- Practical security engineering in Node.js

---

# Original Author Credit

Original repository:  
**Node.js E-Commerce API**  
by [Dinush Chathurya](https://dinushchathurya.github.io/)  
Blog: https://codingtricks.io/

This fork builds upon the original work and extends it with authentication hardening features.

---

# License

This project retains the original MIT License.

Copyright (c) 2020 Dinush Chathurya

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction...

---

#  What This Demonstrates

- Production-style JWT authentication
- Refresh token rotation & revocation
- Secure backend architecture design
- REST API implementation with Express
- MongoDB integration
- Environment-based configuration

---

<p align="center">
  Built with security in mind.
</p>


