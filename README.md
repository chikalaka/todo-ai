# Todo List App

A modern, full-stack todo list application built with Next.js, Supabase, and TypeScript.

## Features

- 🔐 **Authentication**: Google OAuth integration via Supabase
- ✅ **Todo Management**: Create, update, delete, and archive todos
- 🏷️ **Tags**: Organize todos with tags
- 📊 **Priority System**: 1-10 priority levels
- 📅 **Due Dates**: Set and track due dates
- 🔍 **Search & Filter**: Find todos by text, status, or priority
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎨 **Modern UI**: Built with Tailwind CSS and Shadcn/ui

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: TanStack Query (React Query)
- **Authentication**: Supabase Auth with Google OAuth

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd todo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your Supabase credentials.

4. **Set up the database**
   Follow the instructions in [DATABASE_SETUP.md](./DATABASE_SETUP.md)

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### Tables

- **todos**: Main todo items with user association
- **tags**: User-specific tags for organization
- **tag_todo**: Junction table for many-to-many todo-tag relationship

### Security

- Row Level Security (RLS) ensures users can only access their own data
- All tables reference `auth.users(id)` for user isolation

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/auth/callback/  # OAuth callback handler
│   ├── auth/               # Authentication page
│   ├── dashboard/          # Main todo interface
│   └── middleware.ts       # Auth middleware
├── components/
│   ├── auth/               # Authentication components
│   ├── todos/              # Todo-related components
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── hooks/              # Custom React hooks
│   ├── providers/          # Context providers
│   ├── supabase/           # Supabase client configs
│   └── types/              # TypeScript type definitions
```

## Key Features Explained

### Authentication Flow

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. Google redirects to `/auth/callback`
4. Supabase exchanges code for session
5. User redirected to dashboard

### Data Flow

1. React Query manages client-side state
2. Custom hooks abstract Supabase operations
3. Optimistic updates for better UX
4. Real-time subscriptions for live updates

### Security

- Middleware protects dashboard routes
- RLS policies ensure data isolation
- TypeScript provides compile-time safety

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Required Environment Variables Explained:

- **`NEXT_PUBLIC_SUPABASE_URL`**: Your Supabase project URL (found in Project Settings > API)
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Your public anon key (found in Project Settings > API)

### Optional Environment Variables:

- **`SUPABASE_SERVICE_ROLE_KEY`**: Only needed for admin operations that bypass RLS. Not required for this todo app since all operations respect user-level security.

### Where to Find Your Keys:

1. Go to your Supabase dashboard
2. Navigate to **Settings** > **API**
3. Copy the **Project URL** and **anon/public key**
4. The service role key is also listed but not needed for this app

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
