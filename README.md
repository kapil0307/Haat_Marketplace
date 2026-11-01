# Haat: a MERN marketplace

Sellers list items, buyers browse and buy them. Built with MongoDB, Express, React and Node.

**Features**
- Register and log in as a **buyer** or a **seller**
- Passwords hashed with **bcrypt**, sessions with **JWT** (7 days)
- Role-based access: only sellers can create, edit or delete listings, and only on their own products
- Browse, search and filter by category (public)
- Cart saved in localStorage, checkout creates an order
- Stock is reduced atomically at checkout, so two buyers can't buy the last item
- Seller dashboard with listings and sales; buyer order history

**Tech:** React 18, React Router, Tailwind CSS v4, axios, Express, Mongoose, bcryptjs, jsonwebtoken

## Run it

1. Create a free MongoDB Atlas cluster and copy the connection string.
2. Backend:
   ```bash
   cd server
   cp .env     
   npm install
   npm run dev
   ```
3. Frontend (new terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```
4. Open http://localhost:5173. Register one seller account and one buyer account (use two browsers or log out between them).

## API

| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me | logged in |
| GET | /api/products?search=&category= | public |
| GET | /api/products/:id | public |
| GET | /api/products/mine | seller |
| POST / PUT / DELETE | /api/products, /api/products/:id | seller (own products) |
| POST | /api/orders | buyer |
| GET | /api/orders/mine | buyer |
| GET | /api/orders/sales | seller |

## Folder structure
```
server/  models/ (User, Product, Order)  routes/  middleware/auth.js  server.js
client/  src/ context/ (Auth, Cart)  components/  pages/  api.js
```
