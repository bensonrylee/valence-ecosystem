# Valence Ecosystem - Deployment Guide

## Overview

This document provides comprehensive deployment instructions for the Valence Ecosystem application, a Next.js-based marketplace platform for premium services.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Environment variables configured
- Database setup (Supabase/Firebase)
- Payment provider setup (Stripe)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Firebase (if using)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Run tests:**
   ```bash
   npm test
   npm run test:e2e
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the recommended deployment platform for Next.js applications.

#### Setup:
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Commands:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### 2. Netlify

#### Setup:
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Configure environment variables

### 3. AWS Amplify

#### Setup:
1. Connect repository to AWS Amplify
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
3. Set environment variables

### 4. Docker Deployment

#### Dockerfile:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
```

## Database Setup

### Supabase Setup:
1. Create a new Supabase project
2. Run the SQL migrations from `supabase/schema.sql`
3. Configure Row Level Security (RLS) policies
4. Set up real-time subscriptions if needed

### Firebase Setup:
1. Create a new Firebase project
2. Enable Authentication, Firestore, and Storage
3. Configure security rules
4. Set up indexes for queries

## Payment Setup

### Stripe Configuration:
1. Create a Stripe account
2. Set up webhook endpoints
3. Configure payment methods
4. Test the integration in sandbox mode

## Performance Optimization

### Build Optimization:
- Enable Next.js Image Optimization
- Use dynamic imports for code splitting
- Implement proper caching strategies
- Optimize bundle size

### Runtime Optimization:
- Implement proper error boundaries
- Use React.memo for expensive components
- Optimize database queries
- Implement proper loading states

## Monitoring & Analytics

### Recommended Tools:
- **Vercel Analytics** (if using Vercel)
- **Sentry** for error tracking
- **Google Analytics** for user analytics
- **Stripe Dashboard** for payment monitoring

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Configure proper CORS policies
3. **Rate Limiting**: Implement API rate limiting
4. **Input Validation**: Validate all user inputs
5. **HTTPS**: Always use HTTPS in production
6. **Security Headers**: Configure security headers

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables**:
   - Ensure all required variables are set
   - Check variable naming conventions
   - Verify no trailing spaces

3. **Database Connection**:
   - Verify connection strings
   - Check network connectivity
   - Ensure proper permissions

4. **Payment Issues**:
   - Verify Stripe keys are correct
   - Check webhook configurations
   - Test in sandbox mode first

## Support

For deployment issues or questions:
1. Check the application logs
2. Review the troubleshooting section
3. Contact the development team
4. Check the project documentation

## Maintenance

### Regular Tasks:
- Update dependencies monthly
- Monitor error rates
- Review performance metrics
- Backup database regularly
- Test payment flows
- Update security patches

### Backup Strategy:
- Database backups (daily)
- Code repository backups
- Environment variable backups
- Configuration backups