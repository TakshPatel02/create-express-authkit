# create-express-authkit

A powerful, production-ready CLI tool to scaffold a Node.js + Express backend with MongoDB and JWT Authentication built-in. Get your backend up and running in seconds, not hours.

## 🚀 Features

- **Express.js & MongoDB**: Built on top of Express (v5) and Mongoose.
- **Authentication**: Complete JWT authentication flow (Access Token + Refresh Token).
- **Secure Cookies**: Refresh tokens are stored in secure, HTTP-only cookies.
- **Password Hashing**: Secure password storage using bcrypt.
- **Error Handling**: Global error handler and 404 route handling pre-configured.
- **Modern JS**: Uses ECMAScript Modules (`type: "module"`) and `node --watch` for development.
- **Pre-configured Middleware**: CORS, cookie-parser, and dotenv included out of the box.
- **Structured**: Clean MVC architecture ready for scaling.

## 📦 Installation & Usage

You can use `npx` to scaffold a new project without installing the package globally:

```bash
npx create-express-authkit <project-name>
```

Replace `<project-name>` with your desired folder name. 
For example:
```bash
npx create-express-authkit my-backend
```

*Note: All dependencies are automatically installed during scaffolding.*

### Next Steps

1. Navigate to your new project directory:
   ```bash
   cd my-backend
   ```
2. Configure your environment variables:
   ```bash
   cp .env.example .env (or copy .env.example .env on Windows)
   ```
   *Then update the `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, and `REFRESH_TOKEN_SECRET` inside the `.env` file with your own values.*
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

The generated boilerplate follows a clean, maintainable MVC structure:

```
├── .env.example
├── .gitignore
├── index.js              # Entry point
├── package.json
└── src/
    ├── app.js            # Express app configuration
    ├── config/           # Database and other configurations
    ├── controllers/      # Route controllers (e.g., auth.controller.js)
    ├── middlewares/      # Custom middlewares (e.g., auth middleware)
    ├── models/           # Mongoose schemas/models (e.g., user.model.js)
    ├── routes/           # Express routes
    └── utils/            # Utility functions (e.g., ErrorHandler, ApiResponse)
```

## 🛠️ Built With

- [Express 5](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [JSON Web Token (JWT)](https://github.com/auth0/node-jsonwebtoken)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [Dotenv](https://github.com/motdotla/dotenv)
- [Cookie-Parser](https://github.com/expressjs/cookie-parser)
- [CORS](https://github.com/expressjs/cors)

## 📄 License

This project is licensed under the MIT License.