# ⚙️ Environment Variables

Create a `.env` file in the project root and configure the following variables.

| Variable | Description |
|----------|-------------|
| PORT | Server port |
| FIREBASE_PROJECT_ID | Firebase project ID |
| FIREBASE_CLIENT_EMAIL | Firebase service account email |
| FIREBASE_PRIVATE_KEY | Firebase service account private key |
| FIREBASE_STORAGE_BUCKET | Firebase Storage bucket |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| PAYSTACK_SECRET_KEY | Paystack secret key |
| PAYSTACK_WEBHOOK_SECRET | Paystack webhook verification secret |
| GOOGLE_PLACES_API_KEY | Google Places API key |
| CLIENT_URL | Frontend application URL |

---

## Example

```env
PORT=7000

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_STORAGE_BUCKET=your_bucket

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=xxxxxxxxx

GOOGLE_PLACES_API_KEY=AIzaxxxxxxxxxxxx

CLIENT_URL=http://localhost:8081
```

> **Important:** Never commit your actual `.env` file or secrets to GitHub.