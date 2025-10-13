# Media Platform v1

AI-powered media management platform with Claude vision analysis, NextAuth authentication, and batch upload capabilities.

## Features

### 🤖 AI-Powered Analysis
- **Claude Vision API** integration for comprehensive image analysis
- Automatic classification: subjects, style, mood, lighting, composition, colors
- Platform suitability scores (Instagram, Facebook, LinkedIn, Website, Print)
- Background job queue for processing

### 🔐 Authentication & Authorization
- NextAuth v5 with email/password credentials
- Role-based access (ADMIN/EDITOR)
- Protected routes and API endpoints
- Session management with JWT

### 📤 Batch Upload
- Drag-and-drop interface
- Upload up to 50 images at once (25MB each)
- Automatic thumbnail generation (400x400)
- Metadata extraction (dimensions, orientation, aspect ratio)

### 🖼️ Media Management
- Gallery grid view with AI classifications
- Detailed image modal with full analysis
- Search and filter capabilities (coming soon)
- Folder organization and commenting system (coming soon)

---

## 🚀 Tech Stack (31 Packages)

### Core Stack
- ⚡ **Next.js 15** with App Router
- 🔒 **TypeScript** in strict mode  
- 🎨 **Tailwind CSS** with dark mode support

### Authentication & Database
- 🔐 **NextAuth.js v5** - GitHub, Google, email auth
- 🗄️ **Prisma** - Type-safe database ORM
- ⚙️ **Type-safe env vars** - Runtime validation

### Forms & UI
- 📝 **React Hook Form + Zod** - Forms with validation
- 🎯 **Radix UI** - 8 primitive components (modals, dropdowns, etc.)
- 🌟 **Framer Motion** - Smooth animations
- 📁 **React Dropzone** - File upload handling

### State & Data
- 🏪 **Zustand** - Client state management  
- 🔄 **TanStack Query** - Server state, caching, mutations
- 📡 **Axios** - HTTP client

### Developer Experience  
- 🧪 **Vitest + Testing Library** - Fast testing
- 🛠️ **ESLint + Prettier** - Code quality
- 🪝 **Husky** - Git hooks
- 🔍 **Next SEO** - Meta tag management

## 📋 Documentation

- **📦 CAPABILITIES.md** - Complete list of 31 pre-installed packages
- **📖 SETUP.md** - Detailed installation and configuration guide
- **📝 PLATFORM_SPEC.md** - Complete project documentation and architecture
- **⚙️ .env.example** - Environment variables template

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Anthropic API key

### Installation

1. **Clone and install**
```bash
git clone https://github.com/willem4130/MediaPlatformv1.git
cd MediaPlatformv1
npm install
```

2. **Configure environment**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/media_platform"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"  # Generate with: openssl rand -base64 32
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

3. **Setup database**
```bash
npm run db:generate
npm run db:push
```

4. **Create admin user**
```bash
npx tsx scripts/create-admin.ts
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000` and login with your admin credentials!

See **SETUP.md** for detailed instructions.

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Database (Prisma)
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations  
- `npm run db:studio` - Open database GUI

### Testing
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report

### Analysis
- `npm run analyze` - Analyze bundle size

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth API routes
│   │   ├── images/                  # Image listing and analysis
│   │   └── upload/                  # File upload endpoint
│   ├── auth/                        # Login/error pages
│   ├── dashboard/                   # Protected dashboard
│   │   ├── page.tsx                 # Gallery grid
│   │   └── upload/                  # Upload interface
│   └── layout.tsx                   # Root layout
├── components/
│   ├── DashboardNav.tsx             # Navigation
│   ├── ImageDetailModal.tsx         # AI analysis modal
│   └── Providers.tsx                # Context providers
├── lib/
│   ├── auth.ts                      # NextAuth config
│   ├── prisma.ts                    # Database client
│   ├── claude-ai.ts                 # Claude API integration
│   ├── image-processing.ts          # Thumbnail generation
│   └── job-queue.ts                 # Background jobs
└── types/
    └── next-auth.d.ts               # Type extensions
```

## Quality Gates

This project includes pre-commit hooks that automatically:
- Run ESLint and fix issues
- Format code with Prettier
- Ensure type safety with TypeScript

## Testing

Tests are written with Vitest and React Testing Library:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Bundle Analysis

Analyze your bundle size to optimize performance:

```bash
npm run analyze
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Login with credentials
- `POST /api/auth/signout` - Logout

### Images
- `GET /api/images` - List all images with metadata
- `POST /api/upload` - Upload images (multipart/form-data)
- `POST /api/images/[id]/analyze` - Trigger AI analysis

## Claude AI Analysis

The platform uses **Claude 3.5 Sonnet** for comprehensive image analysis:

### Classification Categories
- **Subjects**: Primary and secondary subjects
- **Style**: Photography style (portrait, landscape, abstract, etc.)
- **Mood**: Emotional tone (joyful, serious, peaceful, etc.)
- **Lighting**: Lighting conditions (natural, studio, dramatic, etc.)
- **Composition**: Visual arrangement (rule of thirds, symmetry, etc.)
- **Colors**: Dominant color palette

### Platform Scores (0-10)
- **Instagram**: Visual appeal, engagement potential
- **Facebook**: Shareability, broad appeal
- **LinkedIn**: Professional tone, business context
- **Website Hero**: Above-fold suitability
- **Website Thumbnail**: Small-format effectiveness
- **Print**: Physical reproduction quality

## Production Deployment

### Hosting Recommendations
- **Platform**: Vercel, Railway, or AWS
- **Database**: Supabase, Neon, or RDS
- **File Storage**: AWS S3 or Cloudflare R2

### Production Checklist
- [ ] Setup PostgreSQL on production host
- [ ] Configure environment variables
- [ ] Setup file storage (move from local to S3/R2)
- [ ] Configure domain and SSL
- [ ] Create admin user
- [ ] Test upload and AI processing
- [ ] Monitor API usage and costs

## Built with Queen Claude

This platform was built using Queen Claude's autonomous development system with 31 pre-installed packages and best practices for rapid full-stack development.

**Key Features:**
- 🤖 **Autonomous AI agents** for parallel feature development
- 📦 **31 battle-tested packages** pre-installed
- 🎨 **Design system** with Tailwind CSS
- 🔐 **Authentication** with NextAuth v5
- 🗄️ **Database** with Prisma ORM
- 🧪 **Testing** with Vitest

---

Built with ❤️ using Next.js, Prisma, NextAuth, Claude AI, and Tailwind CSS.