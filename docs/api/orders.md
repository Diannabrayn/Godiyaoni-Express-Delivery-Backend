# 🛒 Orders API

The Orders API manages customer orders, payment initialization, and payment confirmation through Paystack.

**Base URL**

```text
/api/order
```

---

# 📋 Get My Orders

Returns all orders belonging to the authenticated customer.

### Endpoint

```http
GET /api/order
```

### Authentication

- ✅ Firebase Authentication required

### Request Headers

```http
Authorization: Bearer <Firebase_ID_Token>
```

### Success Response

```json
[
  {
    "id": "order_123",
    "status": "placed",
    "totalAmount": 8500,
    "restaurantId": "restaurant_001",
    "createdAt": "2026-07-10T12:00:00Z"
  }
]
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Orders retrieved successfully|
|401|Unauthorized|
|500|Internal server error|

---

# 💳 Create Checkout Session

Creates a Paystack checkout session for an order.

### Endpoint

```http
POST /api/order/checkout/create-checkout-session
```

### Authentication

- ✅ Firebase Authentication required

### Request Headers

```http
Authorization: Bearer <Firebase_ID_Token>
Content-Type: application/json
```

### Example Request

```json
{
  "restaurantId": "restaurant_001",
  "cartItems": [
    {
      "menuItemId": "menu_001",
      "quantity": 2
    }
  ],
  "deliveryAddress": "12 Main Street, Abuja"
}
```

### Success Response

```json
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "PSK_xxxxxxxxx"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Checkout session created|
|400|Invalid request|
|401|Unauthorized|
|500|Internal server error|

---

# 🔔 Paystack Webhook

Receives webhook events from Paystack after payment processing.

### Endpoint

```http
POST /api/order/paystack/webhook
```

### Authentication

No Firebase authentication is required.

The endpoint validates requests using Paystack's webhook signature.

### Content-Type

```http
application/json
```

### Purpose

Processes payment events such as:

- Payment successful
- Payment failed
- Transaction updates

The backend updates the corresponding order in Cloud Firestore after verifying the webhook event.

### Success Response

```json
{
  "received": true
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Webhook processed successfully|
|400|Invalid webhook payload|
|500|Internal server error|

---

# 🔒 Security

- Customer endpoints are protected with Firebase Authentication.
- Webhook requests are verified before updating order data.
- Payment status is updated only after successful verification.

---

# 📂 Related Technologies

- Express.js
- Firebase Authentication
- Cloud Firestore
- Paystack
- TypeScript