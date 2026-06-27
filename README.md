# create-taksh-backend

Scaffold a production-ready Node.js + Express + MongoDB backend with JWT auth in seconds.

## Usage

npx create-taksh-backend my-app

## What you get

- Express + MongoDB (Mongoose) setup
- JWT auth (access + refresh token with rotation)
- Cookie-based refresh token
- Middleware: CORS, cookie-parser
- Auth routes: register, login, logout, refresh-token
- Global error handler + 404 handler
- .env.example included

## Stack

- express, mongoose, bcrypt, jsonwebtoken, cookie-parser, cors, dotenv