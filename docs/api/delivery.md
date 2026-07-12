# 🚚 Delivery Services API

The Delivery Services API manages customer delivery requests, payment initialization, delivery retrieval, and payment confirmation.

**Base URL**

```text
/api/delivery
```

---

# 🚪 Door-to-Door Delivery

Create a new door-to-door delivery request.

### Endpoint

```http
POST /api/delivery
```

### Authentication

- ✅ Firebase Authentication required

### Middleware

- Firebase Authentication
- Multer File Upload
- Form Data JSON Parser
- Request Validation

### Content-Type

```http
multipart/form-data
```

### Form Fields

| Field | Type | Required |
|--------|------|----------|
| senderName | String | ✅ |
| receiverName | String | ✅ |
| pickupAddress | String | ✅ |
| destinationAddress | String | ✅ |
| packageDescription | String | ✅ |
| image | File | Optional |

### Image Upload

Package images are uploaded using **Multer** and processed before the delivery request is created.

### Success Response

```json
{
  "message": "Delivery request created successfully",
  "deliveryId": "delivery_001"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|201|Delivery created successfully|
|400|Validation failed|
|401|Unauthorized|
|500|Internal server error|

---

# 📦 Get Delivery

Returns a delivery by its ID.

### Endpoint

```http
GET /api/delivery/:deliveryId
```

### Authentication

- ✅ Firebase Authentication required

### Request Headers

```http
Authorization: Bearer <Firebase_ID_Token>
```

### Success Response

```json
{
  "deliveryId": "delivery_001",
  "status": "Pending",
  "deliveryType": "Door-to-Door"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Delivery retrieved successfully|
|401|Unauthorized|
|404|Delivery not found|
|500|Internal server error|

---

# 💳 Create Checkout Session

Creates a Paystack checkout session for a delivery payment.

### Endpoint

```http
POST /api/delivery/checkout/create-checkout-session/:deliveryId
```

### Authentication

- ✅ Firebase Authentication required

### Success Response

```json
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "PSK_xxxxxxxx"
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

Receives webhook events from Paystack after payment completion.

### Endpoint

```http
POST /api/delivery/paystack/webhook
```

### Authentication

Firebase Authentication is **not required**.

The webhook validates incoming requests using Paystack's webhook signature.

### Purpose

Processes payment events and updates the delivery status in Cloud Firestore after successful verification.

### Status Codes

| Status | Description |
|---------|-------------|
|200|Webhook processed successfully|
|400|Invalid webhook payload|
|500|Internal server error|

---

# 🔒 Security

- Firebase Authentication protects all customer delivery endpoints.
- Request validation ensures only valid delivery data is processed.
- Paystack webhooks are verified before updating delivery records.

---

# 📂 Related Technologies

- Express.js
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Multer
- Paystack