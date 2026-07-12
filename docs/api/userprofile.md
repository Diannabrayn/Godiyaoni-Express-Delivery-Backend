## Get Current User

GET /my/user

Returns the currently authenticated user's profile.

---

## Update Current User

PUT /my/user

Updates the authenticated user's profile.

# 👤 User Profile API

The User Profile API manages the authenticated customer's profile information.

**Base URL**

```text
/api/my/user
```

---

## 🔍 Get Current User

Returns the profile of the currently authenticated user.

### Endpoint

```http
GET /api/my/user
```

### Authentication

- ✅ Firebase Authentication required
- Send a valid Firebase ID Token in the Authorization header.

### Request Headers

```http
Authorization: Bearer <Firebase_ID_Token>
```

### Success Response

```json
{
  "firebaseId": "uid123",
  "email": "john@example.com",
  "name": "John Doe",
  "addressLine1": "12 Main Street",
  "city": "Abuja",
  "country": "Nigeria"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|User profile returned successfully|
|401|Unauthorized|
|500|Internal server error|

---

## ➕ Create Current User

Creates a new user profile after successful Firebase Authentication.

### Endpoint

```http
POST /api/my/user
```

### Authentication

- ✅ Firebase Authentication required

### Request Headers

```http
Authorization: Bearer <Firebase_ID_Token>
```

### Example Request

```json
{
  "name": "John Doe",
  "addressLine1": "12 Main Street",
  "city": "Abuja",
  "country": "Nigeria"
}
```

### Success Response

```json
{
  "message": "User created successfully"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|201|User created successfully|
|400|Validation failed|
|401|Unauthorized|
|500|Internal server error|

---

## ✏️ Update Current User

Updates the authenticated user's profile.

### Endpoint

```http
PUT /api/my/user
```

### Authentication

- ✅ Firebase Authentication required

### Validation

This endpoint uses server-side request validation.

### Request Headers

```http
Authorization: Bearer <Firebase_ID_Token>
```

### Example Request

```json
{
  "name": "John Doe",
  "addressLine1": "25 New Street",
  "city": "Lagos",
  "country": "Nigeria"
}
```

### Success Response

```json
{
  "message": "Profile updated successfully"
}
```

### Status Codes

| Status | Description |
|---------|-------------|
|200|Profile updated successfully|
|400|Validation failed|
|401|Unauthorized|
|500|Internal server error|

---

## Security

All endpoints are protected using Firebase Authentication middleware.

Only authenticated users can access or modify their own profile.