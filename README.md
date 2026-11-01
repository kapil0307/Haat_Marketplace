# Haat Marketplace

Haat is a full-stack marketplace built with the MERN stack. Sellers can list and manage items, buyers can browse, search and buy them, and every account is protected with JWT authentication and role-based access control.


## Features

**For everyone**
- Browse, search and filter listings by category without logging in
- Product detail page with price, stock and seller name

**For buyers**
- Sign up and log in as a buyer
- Cart that is saved in the browser and survives a page refresh
- Checkout that creates an order and reduces stock
- Order history page

**For sellers**
- Sign up and log in as a seller
- List a new item with price, stock, category, photo link and description
- Edit or delete your own listings (and only your own)
- Sales page showing what was bought and the total earned

**Security and reliability**
- Passwords hashed with bcrypt, never stored in plain text
- JWT authentication (7-day tokens) sent in the `Authorization` header
- Role-based access control: buyers and sellers can only reach their own routes
- Stock is reduced atomically at checkout, so two buyers cannot buy the last item
- If one item in an order fails, stock already taken is put back
- Sellers cannot buy their own products
- `helmet` security headers, `express-mongo-sanitize` against NoSQL injection, and rate limiting on login and register

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React 18, React Router, Tailwind CSS v4, axios, Vite |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens, bcryptjs |

## Project structure

```
Haat_Marketplace/
├── client/                 React frontend
│   └── src/
│       ├── api.js          axios instance that attaches the JWT
│       ├── context/        AuthContext, CartContext
│       ├── components/     Navbar, ProductCard, ProtectedRoute
│       └── pages/          Home, ProductDetail, Cart, Login, Register,
│                           Orders, Dashboard
└── server/                 Express backend
    ├── models/             User, Product, Order
    ├── routes/             auth, products, orders
    ├── middleware/auth.js  protect (verify JWT) and allow (role check)
    └── server.js
```

## Getting started

**Requirements:** Node.js 18 or newer and a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Open `server/.env` and fill in:

```
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/haat
JWT_SECRET=a-long-random-string
CLIENT_URL=http://localhost:5173
PORT=5000
```

You should see `MongoDB connected` in the terminal.

### 2. Frontend

In a second terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Then open http://localhost:5173.

### 3. Try it

1. Register one **seller** account and list two or three items.
2. Log out, then register a **buyer** account.
3. Add items to the cart and place an order.
4. Log back in as the seller to see the sale on the dashboard.

## API overview

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Logged in |
| GET | `/api/products?search=&category=` | Public |
| GET | `/api/products/:id` | Public |
| GET | `/api/products/mine` | Seller |
| POST | `/api/products` | Seller |
| PUT, DELETE | `/api/products/:id` | Seller, own products only |
| POST | `/api/orders` | Buyer |
| GET | `/api/orders/mine` | Buyer |
| GET | `/api/orders/sales` | Seller |
| GET | `/health` | Public |

## How authentication works

1. On register, the password is hashed with bcrypt and the user is saved.
2. On login, the password is compared with the stored hash and the server returns a signed JWT.
3. The frontend stores the token and the axios instance adds it to every request.
4. The `protect` middleware verifies the token and loads the user. The `allow` middleware then checks the user's role.

## Roadmap

- [ ] Image upload instead of photo links
- [ ] Order status (placed, shipped, delivered)
- [ ] Product reviews and ratings
- [ ] Pagination and sorting
- [ ] Automated API tests
- [ ] Deployment (Vercel, Render, MongoDB Atlas)

## Author

**Kapil Virulkar**
[GitHub](https://github.com/kapil0307) | [LinkedIn](https://linkedin.com/in/kapil-virulkar-39a980280)