# 🔐 Authentication

The Godiyaoni Express Delivery Backend uses **Firebase Authentication** to authenticate users.

Unlike traditional REST APIs, this backend **does not handle user login or password management directly**. Authentication is performed by Firebase Authentication, and the backend verifies the Firebase ID Token for every protected request.

---

# Authentication Flow

```text
React Native App
       │
       ▼
Firebase Authentication
       │
       ▼
Firebase ID Token
       │
       ▼
Authorization: Bearer <Firebase_ID_Token>
       │
       ▼
Express Backend
       │
       ▼
Firebase Admin SDK verifies token
       │
       ▼
Request Authorized
```

---

# Authentication Process

1. User signs in using Firebase Authentication.
2. Firebase returns a secure ID Token.
3. The mobile application stores the token securely.
4. Every protected API request includes:

```http
Authorization: Bearer <Firebase_ID_Token>
```

5. The backend verifies the token using the Firebase Admin SDK.
6. If the token is valid, the request is processed.
7. If the token is invalid or expired, the request is rejected.

---

# Protected Endpoints

The following API modules require Firebase Authentication:

| Module | Authentication Required |
|---------|-------------------------|
| User Profile | ✅ Yes |
| Restaurant Management | ✅ Yes |
| Orders | ✅ Yes |
| Delivery Services | ✅ Yes |
| Admin | ✅ Yes |

---

# Public Endpoints

The following endpoints do **not** require Firebase Authentication because they receive callbacks from Paystack.

| Endpoint | Purpose |
|----------|---------|
| POST `/api/order/paystack/webhook` | Payment webhook |
| POST `/api/delivery/paystack/webhook` | Delivery payment webhook |

These endpoints should validate incoming webhook requests using Paystack's webhook signature before processing them.

---

# Middleware

All protected routes use the `firebaseAuth` middleware.

Example:

```typescript
router.get("/", firebaseAuth, MyUserController.getCurrentUser);
```

The middleware:

- Extracts the Firebase ID Token from the `Authorization` header.
- Verifies the token using the Firebase Admin SDK.
- Attaches the authenticated user to the request.
- Rejects unauthorized requests.

---

# Authorization

After authentication, the backend applies role-based authorization where required.

Supported roles include:

- 👤 Customer
- 🍽 Restaurant
- 👨‍💼 Administrator

Each role has access only to the resources and operations it is authorized to perform.

---

# Security

The backend follows these security practices:

- Firebase Authentication for user identity
- Firebase Admin SDK token verification
- Role-based access control (RBAC)
- Protected API routes
- Request validation middleware
- Secure Paystack webhook verification

---

# Related Technologies

- Firebase Authentication
- Firebase Admin SDK
- Express.js
- TypeScript