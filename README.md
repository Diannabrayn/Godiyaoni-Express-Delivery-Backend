<p align="center">
  <img src="docs/images/banner.png" width="100%" alt="Godiyaoni Backend Banner">
</p>

# 🚀 Godiyaoni Express Delivery Backend

A production-ready REST API powering the **Godiyaoni Express Delivery** platform.

The backend provides secure authentication, restaurant management, food ordering, logistics management, payment processing, and delivery tracking for customers, restaurant owners, and administrators.

---

## 📱 Related Project

The mobile application for this backend is available here:

➡️ **Godiyaoni Express Delivery Mobile App**

*(Replace this with your frontend repository link.)*

---

# ✨ Features

### 🔐 Authentication

- Firebase Authentication
- Firebase Admin SDK
- Role-Based Authorization
- Protected REST API

### 👤 Customer Features

- User Profile Management
- Address Management
- Order History
- Delivery Tracking

### 🍽 Restaurant Features

- Restaurant Management
- Menu CRUD Operations
- Cloudinary Image Uploads
- Restaurant Dashboard

### 🛒 Orders

- Shopping Cart Checkout
- Order Creation
- Order Management
- Order Status Updates

### 🚚 Logistics & Delivery

- Door-to-Door Delivery
- Pickup Delivery
- Motor Park Delivery
- Waybill Delivery
- Delivery History
- Distance-Based Pricing

### 💳 Payments

- Paystack Integration
- Secure Payment Verification
- Webhook Processing

### 👨‍💼 Administration

- Restaurant Management
- User Management
- Order Management
- Delivery Management
- Admin Dashboard

---

# 🛠 Technology Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Storage | Cloudinary |
| Payments | Paystack |
| Maps | Google Places API |
| File Uploads | Multer |
| Deployment | Render |

---

# 🏗 System Architecture

<p align="center">
    <img src="docs/images/backend-architecture.png" width="100%">
</p>

---

# 📂 Project Structure

```text
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── types/
├── utils/

docs/
├── api/
├── diagrams/
├── images/

package.json
README.md
```

---

# 📡 API Documentation

Complete API documentation is available in the **docs/api** directory.

| Documentation | Description |
|--------------|-------------|
| Authentication | Firebase Authentication |
| User Profile | Customer Profile |
| Restaurant | Restaurant Management |
| Orders | Customer Orders |
| Delivery | Delivery Services |
| Admin | Administrative Endpoints |

---

# 🔐 Security

The backend implements:

- Firebase Authentication
- Firebase Admin SDK
- Role-Based Access Control (RBAC)
- Request Validation
- Secure File Uploads
- Paystack Webhook Verification

---

# 🚀 Deployment

| Service | Platform |
|----------|----------|
| Backend API | Render |
| Database | Cloud Firestore |
| Authentication | Firebase Authentication |
| Storage | Cloudinary |
| Payments | Paystack |

---

# ⚙️ Getting Started

## Clone the Repository

```bash
git clone https://github.com/sadeeqmusa10/GodiyaoniMobileApp-Backend.git
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file.

See:

```text
docs/environment.md
```

## Start Development Server

```bash
npm run dev
```

---

# 📖 Additional Documentation

- 📡 API Documentation
- ⚙️ Environment Variables
- 🚀 Deployment Guide
- 📂 Project Structure

---

# 🚧 Future Improvements

- Push Notifications
- Email Notifications
- Analytics Dashboard
- API Rate Limiting
- Docker Support
- CI/CD Pipeline
- API Versioning

---

# 👨‍💻 Author

**Abubakar Musa**

Software Engineer

LinkedIn:

https://www.linkedin.com/in/abubakar-musa-48b994225

---

# 📄 License

This project is licensed under the MIT License.

## 🔗 Related Repository

React Native Mobile App:

https://github.com/sadeeqmusa10/GodiayoniMobleApp-Frontend