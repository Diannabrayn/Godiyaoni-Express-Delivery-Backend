# 📡 Godiyaoni Express Delivery API Documentation

Welcome to the official API documentation for the **Godiyaoni Express Delivery Backend**.

This REST API powers the Godiyaoni Express Delivery platform, supporting customers, restaurants, administrators, food ordering, logistics, payments, and delivery management.

---

# 📚 Documentation Index

| Module | Description |
|---------|-------------|
| [🔐 Authentication](authentications.md) | Firebase Authentication, authorization flow, and security. |
| [👤 User Profile](userprofile.md) | Manage authenticated customer profiles. |
| [🍽 Restaurant Management](restaurants.md) | Restaurant creation, updates, menu management, and image uploads. |
| [🛒 Orders](orders.md) | Customer orders, checkout, and Paystack payment processing. |
| [🚚 Delivery Services](delivery.md) | Door-to-door delivery creation, retrieval, checkout, and payment webhooks. |
| [👨‍💼 Admin](admin.md) | Administrative management of restaurants, orders, and deliveries. |

---

# 🏗 API Architecture

```text
React Native Mobile App
            │
            ▼
Firebase Authentication
            │
            ▼
Firebase ID Token
            │
            ▼
Express REST API (Render)
      ┌────────┬────────┬─────────┬─────────┐
      ▼        ▼        ▼         ▼
Firestore Cloudinary Paystack Google Places
```

---

# 🔐 Authentication

All protected endpoints require a valid Firebase ID Token.

```http
Authorization: Bearer <Firebase_ID_Token>
```

Authentication is verified using the Firebase Admin SDK before requests are processed.

---

# 🌐 Base URLs

## Local Development

```text
http://localhost:7000/api
```

## Production

```text
https://your-render-url.onrender.com/api
```

> Replace the production URL with your actual Render deployment URL.

---

# 🛠 Technology Stack

- Node.js
- Express.js
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Cloudinary
- Paystack
- Google Places API
- Multer
- Render

---

# API Modules

## 🔐 Authentication

Responsible for:

- Firebase Authentication
- Token Verification
- Authorization
- Role-Based Access Control

Documentation:

```text
docs/api/authentications.md
```

---

## 👤 User Profile

Responsible for:

- Creating users
- Updating profiles
- Retrieving authenticated users

Documentation:

```text
docs/api/userprofile.md
```

---

## 🍽 Restaurant Management

Responsible for:

- Restaurant CRUD operations
- Image uploads
- Menu management

Documentation:

```text
docs/api/restaurants.md
```

---

## 🛒 Orders

Responsible for:

- Customer orders
- Checkout session creation
- Payment confirmation
- Paystack integration

Documentation:

```text
docs/api/orders.md
```

---

## 🚚 Delivery Services

Responsible for:

- Door-to-door delivery
- Delivery checkout
- Delivery retrieval
- Payment webhooks

Documentation:

```text
docs/api/delivery.md
```

---

## 👨‍💼 Admin

Responsible for:

- Restaurant management
- Order management
- Delivery management
- Administrative operations

Documentation:

```text
docs/api/admin.md
```

---

# 📖 Additional Documentation

| Document | Description |
|----------|-------------|
| `docs/environment.md` | Environment variables |
| `docs/project-structure.md` | Project folder structure |
| `docs/deployment.md` | Deployment guide |

---

# License

This project is licensed under the MIT License.