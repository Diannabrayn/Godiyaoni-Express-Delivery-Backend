# 👨‍💼 Admin API

The Admin API provides endpoints for managing restaurants, orders, and deliveries across the Godiyaoni Express Delivery platform.

**Base URL**

```text
/api/admin
```

---

# 🔐 Authentication

All Admin endpoints require:

- ✅ Firebase Authentication
- ✅ Administrator privileges

Requests must include a valid Firebase ID Token.

```http
Authorization: Bearer <Firebase_ID_Token>
```

---

# 📊 Get Admin Dashboard

Returns information about the currently authenticated administrator.

### Endpoint

```http
GET /api/admin
```

### Success Response

```json
{
  "role": "admin",
  "name": "Administrator"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Dashboard loaded successfully|
|401|Unauthorized|
|403|Forbidden|
|500|Internal server error|

---

# 🍽 Create Restaurant

Creates a new restaurant on behalf of an administrator.

### Endpoint

```http
POST /api/admin/restaurant
```

### Content-Type

```http
multipart/form-data
```

### Middleware

- Firebase Authentication
- Multer File Upload
- Form Data Parser
- Request Validation

### Success Response

```json
{
  "message": "Restaurant created successfully"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|201|Restaurant created|
|400|Validation failed|
|401|Unauthorized|
|403|Forbidden|
|500|Internal server error|

---

# ✏️ Update Restaurant

Updates an existing restaurant.

### Endpoint

```http
PUT /api/admin/restaurant/:restaurantId
```

### Success Response

```json
{
  "message": "Restaurant updated successfully"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Restaurant updated|
|400|Validation failed|
|401|Unauthorized|
|403|Forbidden|
|404|Restaurant not found|
|500|Internal server error|

---

# 📋 Get All Restaurants

Returns all registered restaurants.

### Endpoint

```http
GET /api/admin/restaurant
```

### Success Response

```json
[
  {
    "restaurantId": "restaurant_001",
    "restaurantName": "Godiyaoni Kitchen"
  }
]
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Restaurants retrieved|
|401|Unauthorized|
|403|Forbidden|
|500|Internal server error|

---

# 🛒 Get All Orders

Returns all customer orders.

### Endpoint

```http
GET /api/admin/orders
```

### Success Response

```json
[
  {
    "orderId": "order_001",
    "status": "Placed"
  }
]
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Orders retrieved|
|401|Unauthorized|
|403|Forbidden|
|500|Internal server error|

---

# 🔄 Update Order Status

Updates the status of a customer order.

### Endpoint

```http
PATCH /api/admin/orders/:orderId/status
```

### Example Request

```json
{
  "status": "Delivered"
}
```

### Success Response

```json
{
  "message": "Order status updated successfully"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Status updated|
|400|Invalid status|
|401|Unauthorized|
|403|Forbidden|
|404|Order not found|
|500|Internal server error|

---

# 🚚 Get All Deliveries

Returns all delivery requests.

### Endpoint

```http
GET /api/admin/delivery
```

### Success Response

```json
[
  {
    "deliveryId": "delivery_001",
    "status": "Pending"
  }
]
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Deliveries retrieved|
|401|Unauthorized|
|403|Forbidden|
|500|Internal server error|

---

# 🔄 Update Delivery Status

Updates the status of a delivery.

### Endpoint

```http
PATCH /api/admin/delivery/:deliveryId/status
```

### Example Request

```json
{
  "status": "Completed"
}
```

### Success Response

```json
{
  "message": "Delivery status updated successfully"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Status updated|
|400|Invalid status|
|401|Unauthorized|
|403|Forbidden|
|404|Delivery not found|
|500|Internal server error|

---

# 🔒 Security

The Admin API is protected using Firebase Authentication.

Only users with administrative privileges can:

- Create restaurants
- Update restaurants
- View all restaurants
- View all orders
- Update order status
- View all deliveries
- Update delivery status

---

# 📂 Related Technologies

- Node.js
- Express.js
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Multer