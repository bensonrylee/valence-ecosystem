# Ecosystem Marketplace - Deployment Guide

## 🚀 Quick Start

This marketplace platform is built with Next.js, Clerk (auth), Supabase (database), and Stripe (payments).

### Prerequisites

1. **Clerk Account** - Sign up at [clerk.com](https://clerk.com)
2. **Supabase Project** - Create at [supabase.com](https://supabase.com)
3. **Stripe Account** - Register at [stripe.com](https://stripe.com)

### Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Fill in your credentials:

```env
# Clerk
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Database Setup

1. Go to your Supabase dashboard
2. Run the SQL from `supabase/schema.sql` in the SQL editor
3. Run the SQL from `supabase/functions.sql` in the SQL editor

### Webhooks Configuration

#### Clerk Webhook
1. In Clerk Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/clerk`
3. Select events: `user.created`, `user.updated`
4. Copy the signing secret to `CLERK_WEBHOOK_SECRET`

#### Stripe Webhook
1. In Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/stripe`
3. Select events for payments and transfers
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

### Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

### Production Deployment

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Manual Build
```bash
npm run build
npm start
```

## 🎨 Customization

### Theme
- Primary color (neon green): `#00FFAD`
- Edit colors in `app/globals.css` and component files

### Platform Fee
- Currently set to 7%
- Update in `supabase/functions.sql` and booking logic

## 📝 Key Features

- **User Roles**: Customer and Provider modes
- **Booking System**: Real-time availability with calendar
- **Payments**: Stripe Connect for marketplace transactions
- **Messaging**: In-app communication between users
- **Reviews**: Rating system for completed services

## 🔧 Troubleshooting

### Common Issues

1. **"Supabase connection failed"**
   - Check your Supabase URL and anon key
   - Ensure RLS policies are properly set

2. **"Clerk authentication error"**
   - Verify Clerk keys are correct
   - Check if webhook is properly configured

3. **"Stripe payment failed"**
   - Ensure Stripe keys are in test/live mode as needed
   - Verify webhook endpoint is accessible

## 📞 Support

For issues or questions:
- Check the [GitHub repository](https://github.com/yourusername/ecosystem)
- Review Clerk, Supabase, and Stripe documentation

---

**Last Updated**: January 2025
**Version**: 1.0.0