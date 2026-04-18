# Complete Flow Documentation

## Login Flow

### Step 1: Enter Credentials
```
┌─────────────────┐
│  UI Login Page  │
│  - Phone Number │
│  - Password     │
└────────┬────────┘
         │
         ▼ User clicks "Continue"
```

### Step 2: Backend → Firebase Verification
```
POST /api/auth/verify-credentials
         │
         ▼
┌─────────────────────────┐
│       Backend           │
│  - Receives phone + pwd │
└────────┬────────────────┘
         │
         ▼ Query Firebase
┌─────────────────────────┐
│       Firebase          │
│  - Check if user exists │
│  - Verify password      │
└────────┬────────────────┘
         │
         ▼ If valid
┌─────────────────────────┐
│       Backend           │
│  - Generate OTP         │
│  - Store OTP in Firebase│
│  - (otps collection)    │
└────────┬────────────────┘
         │
         ▼ Response
┌─────────────────────────┐
│          UI             │
│  OTP field appears!     │
└─────────────────────────┘
```

### Step 3: Verify OTP
```
┌─────────────────┐
│  UI Login Page  │
│  - OTP Field    │
└────────┬────────┘
         │
         ▼ User enters OTP
         ▼ Clicks "Verify & Login"
         ▼
POST /api/auth/verify-otp
         │
         ▼
┌─────────────────────────┐
│       Backend           │
│  - Receives phone + OTP │
└────────┬────────────────┘
         │
         ▼ Query Firebase
┌─────────────────────────┐
│       Firebase          │
│  - Get OTP from DB      │
│  - Check if expired     │
│  - Verify OTP matches   │
└────────┬────────────────┘
         │
         ▼ If valid
┌─────────────────────────┐
│       Backend           │
│  - Delete used OTP      │
│  - Generate JWT token   │
└────────┬────────────────┘
         │
         ▼ Response
┌─────────────────────────┐
│          UI             │
│  - Store token          │
│  - Redirect to /inquiry │
└─────────────────────────┘
```

---

## Inquiry Submission Flow

```
┌─────────────────────────┐
│    Inquiry Form UI      │
│  - Fill all fields      │
│  - Click Submit         │
└────────┬────────────────┘
         │
         ▼
POST /api/inquiries
         │
         ▼
┌─────────────────────────┐
│       Backend           │
│  - Validate data        │
└────────┬────────────────┘
         │
         ▼ Store in Firebase
┌─────────────────────────┐
│       Firebase          │
│  - inquiries collection │
│  - Data saved           │
└────────┬────────────────┘
         │
         ▼ Response
┌─────────────────────────┐
│          UI             │
│  - Success message      │
└─────────────────────────┘
```

---

## Firebase Collections

### 1. users
```javascript
{
  id: "auto-generated",
  name: "John Doe",
  phone: "9876543210",
  email: "john@example.com",
  password: "hashed_or_plain", // ⚠️ Should hash in production
  role: "user" | "admin",
  createdAt: timestamp,
}
```

### 2. otps (temporary)
```javascript
{
  id: "phone_number",
  phone: "9876543210",
  otp: "123456",
  createdAt: timestamp,
  expiresAt: timestamp,
  verified: false
}
```

### 3. inquiries
```javascript
{
  id: "auto-generated",
  customerName: "Jane Smith",
  phone: "9123456789",
  email: "jane@company.com",
  company: "ABC Corp",
  productInterest: "color-sorter",
  quantity: "5",
  source: "website",
  message: "Need quote for 5 machines",
  status: "new",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/verify-credentials` | Verify phone+pwd, send OTP |
| POST | `/api/auth/verify-otp` | Verify OTP and login |
| POST | `/api/inquiries` | Create new inquiry |
| GET | `/api/inquiries` | Get all inquiries |

---

## Setup Steps

1. **Create Firebase Project**
2. **Enable Firestore Database**
3. **Add Firebase Config to `.env.local`**
4. **Create Users in Firebase**
5. **Test Login Flow**

```bash
# .env.local
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```
