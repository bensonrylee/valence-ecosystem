# Valence Ecosystem

A premium service booking platform with enterprise-grade Stripe integration, built with Next.js, Firebase, and TypeScript.

## 🚀 Features

### Core Functionality
- **Service Marketplace**: Browse and book professional services
- **Provider Dashboard**: Manage services, bookings, and earnings
- **Real-time Messaging**: Chat between customers and providers
- **Review System**: Rate and review completed services

### Payment Integration
- **Stripe Connect**: Full marketplace payment infrastructure
- **Payment Tracking**: Comprehensive transaction history
- **Refund Management**: Process full or partial refunds
- **Webhook Handling**: Real-time payment event processing
- **Earnings Analytics**: Detailed revenue dashboards

### Technical Features
- **Dark Theme**: Premium glass morphism design
- **TypeScript**: Full type safety
- **Firebase Integration**: Auth, Firestore, Cloud Functions
- **Responsive Design**: Mobile-first approach
- **E2E Testing**: Playwright test suite

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS with custom design system
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Payments**: Stripe & Stripe Connect
- **Testing**: Jest, Playwright
- **Animations**: Framer Motion

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/bensonrylee/valence-ecosystem.git
cd valence-ecosystem
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

5. Run the development server:
```bash
npm run dev
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel
```

### Firebase Hosting + Cloud Run
See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## 📝 Documentation

- `CLAUDE.md` - Development guidelines and standards
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `DESIGN_SYSTEM.md` - Design tokens and components

## 🧪 Testing

```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run with specific browser
npm run test:e2e -- --project=chromium
```

## 🔐 Security

- Firebase Security Rules configured for all collections
- Stripe webhook signature verification
- Server-side authentication for all API routes
- Input validation with Zod schemas

## 📊 Key Features Implementation

### Stripe Webhook Events Handled
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.succeeded`
- `charge.refunded`
- `account.updated`
- `payout.paid`
- `payout.failed`

### Firebase Collections
- `users` - User profiles
- `providers` - Provider profiles
- `services` - Service listings
- `bookings` - Booking records
- `messages` - Chat messages
- `reviews` - Service reviews
- `transactions` - Payment records
- `refunds` - Refund tracking
- `webhook_events` - Stripe event logs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built with ❤️ using:
- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Stripe](https://stripe.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)