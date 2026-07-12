# 🍽 Restaurant Management API

The Restaurant Management API allows authenticated restaurant owners to create, retrieve, and update their restaurant information.

**Base URL**

```text
/api/my/restaurant
```

---

## 🔍 Get My Restaurant

Returns the restaurant profile belonging to the authenticated restaurant owner.

### Endpoint

```http
GET /api/my/restaurant
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
  "restaurantName": "Godiyaoni Kitchen",
  "city": "Abuja",
  "country": "Nigeria",
  "deliveryPrice": 1500,
  "estimatedDeliveryTime": 30,
  "cuisines": [
    "African",
    "Fast Food"
  ],
  "menuItems": []
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Restaurant returned successfully|
|401|Unauthorized|
|404|Restaurant not found|
|500|Internal server error|

---

# ➕ Create Restaurant

Creates a new restaurant profile.

### Endpoint

```http
POST /api/my/restaurant
```

### Authentication

- ✅ Firebase Authentication required

### Middleware

- Firebase Authentication
- Multer File Upload
- Request Validation

### Content-Type

```http
multipart/form-data
```

### Form Fields

| Field | Type | Required |
|---------|------|----------|
| restaurantName | String | ✅ |
| city | String | ✅ |
| country | String | ✅ |
| deliveryPrice | Number | ✅ |
| estimatedDeliveryTime | Number | ✅ |
| cuisines | Array | ✅ |
| menuItems | Array | ✅ |
| imageFile | Image | Optional |

### Image Upload

Restaurant images are uploaded to **Cloudinary** before being stored in Firestore.

### Success Response

```json
{
  "message": "Restaurant created successfully"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|201|Restaurant created successfully|
|400|Validation failed|
|401|Unauthorized|
|500|Internal server error|

---

# ✏️ Update Restaurant

Updates an existing restaurant profile.

### Endpoint

```http
PUT /api/my/restaurant
```

### Authentication

- ✅ Firebase Authentication required

### Middleware

- Firebase Authentication
- Multer File Upload
- Request Validation

### Content-Type

```http
multipart/form-data
```

### Image Upload

If a new image is supplied, the existing restaurant image is replaced with the newly uploaded image stored in Cloudinary.

### Success Response

```json
{
  "message": "Restaurant updated successfully"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Restaurant updated successfully|
|400|Validation failed|
|401|Unauthorized|
|500|Internal server error|

---

# 🔒 Security

All Restaurant Management endpoints are protected using Firebase Authentication.

Only authenticated restaurant owners can create or update their own restaurant information.

---

# 📂 Related Technologies

- Express.js
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Cloudinary
- Multer