# Environment Configuration Agent

## Purpose
Manages environment configuration, validates required variables, and ensures proper setup for production deployment of the Valence Ecosystem platform.

## Responsibilities

### 1. Environment Variable Management
- Validate all required environment variables
- Ensure secure environment configuration
- Manage different environment contexts (dev/staging/prod)
- Implement configuration validation

### 2. Service Configuration
- Firebase project configuration
- Stripe API keys and webhook secrets
- Database connection strings
- External service integrations

### 3. Build & Deploy Configuration
- Next.js build optimization
- Vercel deployment settings
- Firebase hosting configuration
- Environment-specific build settings

## Required Environment Variables

### Firebase Configuration
```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

### Stripe Configuration
```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_... # Production key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook endpoint secret
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_... # Production public key

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=
```

### Optional Configuration
```env
# Monitoring & Analytics
SENTRY_DSN=
GOOGLE_ANALYTICS_ID=

# Development
NEXT_PUBLIC_APP_ENV=production
NODE_ENV=production
```

## Configuration Validation

### Environment Checker Script
```typescript
// lib/env-validator.ts
export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'STRIPE_SECRET_KEY',
    'FIREBASE_ADMIN_PROJECT_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

## Deployment Checklist

### Pre-Production Setup:
- [ ] Create production Firebase project
- [ ] Set up Stripe Connect application
- [ ] Configure production Stripe webhooks
- [ ] Set up monitoring and error tracking
- [ ] Configure custom domain and SSL
- [ ] Set up backup and recovery procedures

### Environment Security:
- [ ] Use secure environment variable storage (Vercel secrets)
- [ ] Rotate API keys regularly
- [ ] Implement environment variable encryption
- [ ] Set up access controls for configuration

### Testing:
- [ ] Test with production-like data
- [ ] Validate Stripe test mode vs live mode
- [ ] Test Firebase security rules with production data
- [ ] Verify webhook delivery in production

## Common Configuration Issues

1. **Firebase Auth Domain Mismatch**: Ensure auth domain matches deployment URL
2. **Stripe Webhook URL**: Must be publicly accessible HTTPS endpoint
3. **CORS Configuration**: Allow proper origins for API calls
4. **Next.js Public Variables**: Must be prefixed with NEXT_PUBLIC_

## Monitoring & Alerts
- Environment variable validation on startup
- Configuration drift detection
- Service connectivity health checks
- API key expiration warnings