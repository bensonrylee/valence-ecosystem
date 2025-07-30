# Valence Ecosystem - Premium Service Marketplace

A Next.js marketplace application with integrated Claude AI agents for automated code quality and validation.

## 🚀 Features

- **Premium Marketplace**: Book services with Apple-level design standards
- **Secure Payments**: Stripe integration with escrow system
- **Real-time Messaging**: Chat with service providers
- **AI-Powered Development**: Built-in Claude agents for code quality
- **Dark Theme**: Consistent glass morphism design system
- **Full Authentication**: Clerk integration with MFA support

## 📦 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/valence-ecosystem.git
cd valence-ecosystem

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

## 🤖 Claude Agents Integration

This project includes AI-powered development agents in `.claude/agents/`:

```bash
# Run code quality checks
./.claude/agents/agent-runner.sh quality-check

# Fix failing tests automatically
./.claude/agents/agent-runner.sh test-fix

# Validate UI consistency
./.claude/agents/agent-runner.sh ui-check

# Full pre-deployment validation
./.claude/agents/agent-runner.sh pre-deploy
```

### Available Agents
- **test-fixer**: Fixes E2E test failures
- **code-quality**: TypeScript and security validation
- **ui-consistency**: Design system compliance
- **firebase-config**: Environment configuration
- **booking-flow**: Payment flow validation

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk Authentication
- **Payments**: Stripe & Stripe Connect
- **Testing**: Playwright for E2E tests
- **AI Tools**: Claude agents for development

## 📁 Project Structure

```
valence-ecosystem/
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Dashboard routes
│   ├── auth/              # Authentication pages
│   ├── booking/           # Booking flow
│   ├── explore/           # Service listings
│   └── services/          # Service details
├── components/            # React components
├── lib/                   # Utilities and services
├── .claude/              # AI agent system
│   └── agents/           # Claude development agents
├── tests/                # Test suites
└── public/              # Static assets
```

## 🔧 Environment Variables

Create `.env.local` with:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Fix failing tests automatically
./.claude/agents/agent-runner.sh test-fix
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Docker
```bash
docker build -t valence-ecosystem .
docker run -p 3000:3000 valence-ecosystem
```

## 🤝 Development Workflow

1. **Install Git Hooks**:
   ```bash
   ./.claude/agents/install-hooks.sh
   ```

2. **Enable File Watcher**:
   ```bash
   ./.claude/agents/watch-mode.sh
   ```

3. **Run Agents Before Commit**:
   ```bash
   ./.claude/agents/agent-runner.sh pre-deploy --dry-run
   ```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch
3. Run agents to validate changes
4. Commit with conventional commits
5. Push and create a PR

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Built with Claude AI assistance
- Design inspired by Apple's design system
- Open source community contributions

---

**Note**: This project includes Claude AI agents in `.claude/agents/` for automated development assistance. These tools help maintain code quality but require Claude CLI to function.
