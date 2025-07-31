# Database Setup Guide

## 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

## 2. Run SQL Commands

Execute these SQL commands in your Supabase SQL editor:

```sql
-- Note: auth.users table already has RLS enabled by Supabase
-- No need to enable RLS on auth.users - it's managed by Supabase

-- Create todos table
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 10) DEFAULT 5,
  archived BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create junction table for many-to-many relationship
CREATE TABLE tag_todo (
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  PRIMARY KEY (tag_id, todo_id)
);

-- Enable RLS on our custom tables
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_todo ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies
CREATE POLICY "Users can only see their own todos" ON todos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own tags" ON tags
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only manage their own tag associations" ON tag_todo
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM todos WHERE todos.id = tag_todo.todo_id AND todos.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_tags_user_id ON tags(user_id);
```

## 3. Configure Google OAuth

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. **Configure Redirect URLs** (IMPORTANT for production):
   - For **local development**: `http://localhost:3000/auth/callback`
   - For **production**: `https://yourdomain.com/auth/callback`
   - You can add multiple redirect URLs separated by commas
   - Example: `http://localhost:3000/auth/callback,https://yourdomain.com/auth/callback`

## 4. Update Environment Variables

### For Local Development (.env.local):

```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### For Production Deployment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**Important**: Replace `yourdomain.com` with your actual production domain.

### About Supabase Keys:

- **Project URL**: Your unique Supabase project URL
- **Anon Key**: Public key for client-side operations (safe to expose)
- **Service Role Key**: Admin key that bypasses RLS (not needed for this app)

### How to Find Your Keys:

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the **Project URL**
3. Copy the **anon** key (also called "public" key)
4. You can ignore the service role key for this todo app

## 5. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Try signing in with Google
4. Create a test todo

## Troubleshooting

### "must be owner of table users" Error

This error occurs if you try to enable RLS on `auth.users`. The `auth.users` table is managed by Supabase and already has RLS enabled. Simply skip that line in the SQL commands.

### RLS Policy Issues

- Make sure to enable RLS on your custom tables (`todos`, `tags`, `tag_todo`)
- The `auth.uid()` function returns the current user's ID and works automatically with Supabase Auth
- Test your policies by creating data through the dashboard first

Your database is now ready for the todo app!
