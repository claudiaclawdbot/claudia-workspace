# Bible2 Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/bible2?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AI API Configuration
AI_API_URL="https://api.openai.com/v1/chat/completions"
AI_API_KEY="your-ai-api-key-here"
AI_MODEL="gpt-4o-mini"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Create and run migrations
npm run db:migrate
```

When prompted, name your migration (e.g., "init").

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Setup Options

### Option 1: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:
   ```sql
   CREATE DATABASE bible2;
   ```
3. Update `DATABASE_URL` in `.env`

### Option 2: Neon (Recommended for Development)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### Option 3: Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string to `DATABASE_URL`

## AI API Setup

### Using OpenAI

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add to `.env`:
   ```env
   AI_API_URL="https://api.openai.com/v1/chat/completions"
   AI_API_KEY="sk-..."
   AI_MODEL="gpt-4o-mini"
   ```

### Using Other Providers

The app uses a generic chat completions API. Any OpenAI-compatible provider should work. Just update:
- `AI_API_URL` - Your provider's endpoint
- `AI_API_KEY` - Your provider's API key
- `AI_MODEL` - Model name (if applicable)

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database?schema=public`
- Ensure database exists

### NextAuth Issues

- Make sure `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your app URL
- Check browser console for errors

### AI API Issues

- Verify `AI_API_KEY` is correct
- Check API quota/limits
- Verify `AI_API_URL` is correct for your provider
- Check server logs for detailed error messages

### Prisma Issues

- Run `npm run db:generate` after schema changes
- Run `npm run db:migrate` to apply migrations
- Use `npm run db:studio` to view database in browser

## Next Steps

1. Create your first account at `/signup`
2. Ask your first question at `/ask`
3. Explore your history at `/history`
4. Customize settings at `/settings`

## Production Deployment

See the main README.md for deployment instructions.

