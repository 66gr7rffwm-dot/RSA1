# Carpooling Application - Pakistan

A comprehensive carpooling platform tailored for Pakistan, addressing rising fuel costs, traffic congestion, and informal carpooling inefficiencies.

## Features

- ✅ User Registration & Authentication with OTP
- ✅ Driver KYC & Verification (CNIC, License, Vehicle Registration, Token Tax)
- ✅ Vehicle Management (Multiple vehicles per driver)
- ✅ Route & Trip Management (Recurring trips, intermediate points)
- ✅ Booking Flow with Partial Journey Support
- ✅ Monthly Subscription Model (500 PKR)
- ✅ Formula-Based Pricing Mechanism
- ✅ AI-Based Navigation & Route Optimization
- ✅ Payment Integration (JazzCash, EasyPaisa, IBFT, Cards)
- ✅ Ratings & Safety (SOS, Women-only rides)
- ✅ Admin Portal for KYC Approval & Analytics

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL Database
- JWT Authentication
- Socket.io for Real-time features
- Google Maps API for Navigation

### Mobile App
- React Native (iOS + Android)
- React Navigation
- React Query for State Management
- Google Maps Integration

### Admin Portal
- React + TypeScript
- Material-UI or Tailwind CSS

## Project Structure

```
RSA/
├── server/              # Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   │   ├── pricing/
│   │   │   ├── navigation/
│   │   │   ├── payment/
│   │   │   └── notification/
│   │   └── utils/
│   └── package.json
├── mobile/             # React Native App
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── admin-portal/       # Admin Dashboard
│   ├── src/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- React Native development environment
- Google Maps API Key

### Installation

1. Install all dependencies:
```bash
npm run install-all
```

2. Set up environment variables:
- Copy `.env.example` files in each directory
- Configure database, API keys, and payment gateway credentials

3. Set up database:
```bash
cd server
cp .env.example .env    # then edit DB_*, JWT_*, etc.
npm run migrate         # runs schema.sql against your PostgreSQL DB
```

4. Start development servers:
```bash
npm run dev
```

## API Documentation

See `server/API_DOCUMENTATION.md` for detailed API endpoints.

## Pricing Formula

The platform uses a formula-based cost-sharing mechanism:

- **Base Trip Cost** = Distance × FuelRatePerKm × VehicleFactor
- **Driver Contribution**: 50% if 1 passenger, 0% if 2-3 passengers
- **Partial Journey**: Cost calculated proportionally based on distance traveled

See BRD Section 4.7 for detailed formulas.

## License

MIT

