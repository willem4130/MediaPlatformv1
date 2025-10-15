# Media Platform Setup Guide

🔒 **PRIVATE PLATFORM** - Authentication required for all access. No public pages.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create `.env.local` file:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/media_platform"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Claude API
ANTHROPIC_API_KEY="your-anthropic-api-key"

# File Upload (optional, defaults shown)
MAX_FILE_SIZE=26214400  # 25MB
MAX_FILES_PER_BATCH=50
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Create Admin User

```bash
npx tsx scripts/create-admin.ts
```

Follow prompts to create your admin account.

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and login with your admin credentials!

---

## What You Have

### Backend ✅

- **NextAuth v5** - Email/password authentication with ADMIN/EDITOR roles
- **Prisma ORM** - PostgreSQL database with User, Image, Folder, Comment models
- **File Upload API** - Batch uploads (up to 50 images, 25MB each)
- **Claude AI Integration** - Full vision analysis with platform scores
- **Background Jobs** - Automatic AI processing after upload

### Frontend ✅

- **Login Page** - `/auth/login` - Email/password form
- **Gallery Grid** - `/dashboard` - View all images with AI classifications
- **Upload Interface** - `/dashboard/upload` - Drag-drop batch uploader
- **Image Detail Modal** - Click any image to see full AI analysis

### Features

- **100% Private** - No public access, login required for everything
- **Protected Files** - All uploaded images require authentication
- **Security Headers** - XSS, clickjacking, and MIME-sniffing protection
- **No Indexing** - robots.txt and meta tags prevent search engines
- Automatic thumbnail generation (400x400)
- Image metadata extraction (dimensions, orientation, aspect ratio)
- AI classification: subjects, style, mood, lighting, composition, colors
- Platform suitability scores: Instagram, Facebook, LinkedIn, Website, Print
- Background job queue for AI processing

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth API routes
│   │   ├── images/                  # GET /api/images - List images
│   │   │   └── [id]/analyze/        # POST - Trigger AI analysis
│   │   └── upload/                  # POST /api/upload - Upload files
│   ├── auth/
│   │   ├── login/                   # Login page
│   │   └── error/                   # Auth error page
│   ├── dashboard/
│   │   ├── layout.tsx               # Protected layout
│   │   ├── page.tsx                 # Gallery grid
│   │   └── upload/                  # Upload interface
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Redirect to login
│   └── globals.css                  # Tailwind styles
├── components/
│   ├── DashboardNav.tsx             # Navigation bar
│   ├── ImageDetailModal.tsx         # Full AI analysis modal
│   └── Providers.tsx                # NextAuth SessionProvider
├── lib/
│   ├── auth.ts                      # NextAuth configuration
│   ├── prisma.ts                    # Prisma client
│   ├── claude-ai.ts                 # Claude vision API
│   ├── image-processing.ts          # Thumbnail generation
│   └── job-queue.ts                 # Background job queue
└── types/
    └── next-auth.d.ts               # NextAuth type extensions
```

---

## Next Steps

### Test the Platform

1. Login as admin
2. Upload 2-3 test images
3. Watch AI processing complete
4. Click images to see detailed analysis
5. Check platform suitability scores

### Environment Notes

- **PostgreSQL**: Use local instance or hosted (Supabase, Railway, Neon)
- **Claude API**: Get key from https://console.anthropic.com
- **File Storage**: Images stored in `public/uploads/` (use S3/Cloudflare R2 for production)

### Production Checklist

- [ ] Setup PostgreSQL on production host
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Setup file storage (S3/R2)
- [ ] Configure domain and SSL
- [ ] Create admin user
- [ ] Test upload and AI processing

---

## Troubleshooting

### Database Connection

```bash
# Test connection
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### AI Processing

- Check `ANTHROPIC_API_KEY` is set
- Images must be in `public/uploads/`
- Check console logs for processing status

### Authentication

- Generate new `NEXTAUTH_SECRET` if needed
- Clear cookies if login fails
- Check session in browser DevTools

---

## 🔒 Privacy & Security

This platform is **completely private** and secure:

### Authentication Protection

- ✅ **Middleware** blocks ALL routes except login page
- ✅ **Uploaded files** require authentication (no direct access to /uploads/)
- ✅ **API routes** verify session on every request
- ✅ **Auto-redirect** to login if not authenticated

### Security Headers

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Protects referrer info
- `Permissions-Policy` - Blocks camera/microphone/geolocation

### Search Engine Protection

- **robots.txt** - Blocks all search engines
- **Meta robots tags** - noindex, nofollow, nocache
- No sitemap provided

---

Built with Next.js 15, Prisma, NextAuth v5, Claude AI, and Tailwind CSS.
