# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-production-api.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
```
POST /auth/register
Body: {
  phoneNumber: string (PK format),
  email?: string,
  password: string (min 6 chars),
  fullName: string,
  role: 'driver' | 'passenger'
}
```

#### Login
```
POST /auth/login
Body: {
  phoneNumber: string,
  password: string
}
```

#### Verify OTP
```
POST /auth/verify-otp
Body: {
  phoneNumber: string,
  otpCode: string (6 digits)
}
```

#### Resend OTP
```
POST /auth/resend-otp
Body: {
  phoneNumber: string
}
```

### Users

#### Get Profile
```
GET /users/me
Headers: Authorization
```

#### Update Profile
```
PUT /users/me
Headers: Authorization
Body: {
  fullName?: string,
  email?: string,
  profileImageUrl?: string
}
```

### Driver KYC

#### Submit KYC Documents
```
POST /drivers/kyc
Headers: Authorization (Driver role required)
Body: FormData {
  cnicFront: File,
  cnicBack: File,
  drivingLicense: File,
  vehicleRegistration: File,
  tokenTax: File,
  selfie: File,
  cnicNumber: string,
  drivingLicenseNumber: string
}
```

#### Get KYC Status
```
GET /drivers/kyc/status
Headers: Authorization (Driver role required)
```

### Vehicles

#### Get Vehicles
```
GET /vehicles
Headers: Authorization (Driver role required)
```

#### Add Vehicle
```
POST /vehicles
Headers: Authorization (Driver role required)
Body: FormData {
  make: string,
  model: string,
  year: number,
  fuelType: 'petrol' | 'diesel' | 'cng' | 'hybrid' | 'electric',
  seatingCapacity: number (2-7),
  registrationNumber: string,
  color?: string,
  images: File[]
}
```

### Trips

#### Search Trips
```
GET /trips/search?originLat=&originLng=&destLat=&destLng=&date=&time=
```

#### Create Trip (Driver)
```
POST /trips
Headers: Authorization (Driver role required)
Body: {
  vehicleId: string,
  routeId?: string,
  tripDate: string (YYYY-MM-DD),
  tripTime: string (HH:MM),
  originAddress: string,
  originLatitude: number,
  originLongitude: number,
  destinationAddress: string,
  destinationLatitude: number,
  destinationLongitude: number,
  intermediatePoints?: Array<{address, lat, lng, order}>,
  maxSeats: number (1-3),
  isWomenOnly?: boolean
}
```

#### Get My Trips
```
GET /trips/my-trips
Headers: Authorization
```

### Bookings

#### Create Booking (Passenger)
```
POST /bookings
Headers: Authorization (Passenger role required)
Body: {
  tripId: string,
  pickupAddress: string,
  pickupLatitude: number,
  pickupLongitude: number,
  dropoffAddress: string,
  dropoffLatitude: number,
  dropoffLongitude: number
}
```

#### Get My Bookings
```
GET /bookings/my-bookings
Headers: Authorization
```

#### Cancel Booking
```
PUT /bookings/:id/cancel
Headers: Authorization
Body: {
  cancellationReason?: string
}
```

### Subscriptions

#### Create Subscription
```
POST /subscriptions
Headers: Authorization
Body: {
  paymentMethod: 'jazzcash' | 'easypaisa' | 'ibft' | 'card',
  paymentTransactionId: string
}
```

#### Get My Subscription
```
GET /subscriptions/my-subscription
Headers: Authorization
```

### Payments

#### Process Payment
```
POST /payments/process
Headers: Authorization
Body: {
  amount: number,
  currency: 'PKR',
  paymentMethod: string,
  bookingId?: string,
  subscriptionId?: string
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error message"
  }
}
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

