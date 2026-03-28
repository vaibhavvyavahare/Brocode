# Supabase Backend Integration Guide

This document outlines the database tables, fields, schemas, and API configurations required to migrate the current local/mock data architecture of the application to a fully managed Supabase PostgreSQL backend.

## 1. Database Schema (Tables & Fields)

To replace the `MOCK_PROJECTS` and `MOCK_SESSIONS` structures currently present in the app, the following tables must be constructed in Supabase.

### 1.1 `profiles` / `settings` (Optional but Recommended)
Migrating the `useGlobalStore` settings into the database will ensure that if the app is accessed on multiple devices, the global rate floor and currency remain consistent.

| Field Name | Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, `references auth.users` cascade | Links settings strictly to the authenticated user. |
| `rate_floor`| `numeric` | Default `500` | Minimum accepted hourly rate threshold. |
| `currency` | `text` | Default `'₹'` | Output monetary formatting symbol. |
| `created_at`| `timestamptz` | Default `now()` | Timestamp of creation. |

### 1.2 `projects`
Stores all tracking buckets, pricing rules, and meeting parameters.

| Field Name | Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, Default `uuid_generate_v4()` | Unique identifier. |
| `user_id` | `uuid` | `references auth.users` cascade | Owner of the project. |
| `title` | `text` | `NOT NULL` | Name of the project. |
| `client` | `text` | `NOT NULL` | Related client name. |
| `type` | `text` | `NOT NULL` (Enum constraint recommended) | e.g. `'Web Dev'`, `'Design'`, `'ML Project'`, etc. |
| `model` | `text` | `NOT NULL` (Enum: `'fixed'`, `'hourly'`) | Specifies the pricing calculation model. |
| `price` | `numeric` | Default `0` | Total fixed price (if `model` = `'fixed'`). |
| `hourlyRate`| `numeric` | Default `0` | Rate per hour (if `model` = `'hourly'`). |
| `budgetHours`|`numeric` | Default `0` | Time ceiling for profitability scope tracking. |
| `meetUrl` | `text` | Nullable | Remote URL for auto-tracking Meet extensions. |
| `created_at`| `timestamptz` | Default `now()` | Date the project was created. |

### 1.3 `sessions`
Logs all isolated periods of time spent within discrete projects.

| Field Name | Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, Default `uuid_generate_v4()` | Unique identifier. |
| `project_id`| `uuid` | `references public.projects(id)` cascade | Links standard session to an active project. |
| `user_id` | `uuid` | `references auth.users` cascade | Restricts access to owner manually. |
| `type` | `text` | `NOT NULL` (Enum: `'billable'`, `'nonbillable'`)| Classification of the time tracked. |
| `nbCategory`| `text` | Nullable (Enum: `'communication'`, etc)| Reason code for non-billable overhead. |
| `hours` | `numeric` | `NOT NULL` | Fraction / elapsed time in exact hours. |
| `note` | `text` | Nullable | Optional contextual description string. |
| `startedAt` | `timestamptz` | `NOT NULL` | Actual ISO startup time of the session. |
| `endedAt` | `timestamptz` | `NOT NULL` | Resolved ISO end boundary of the session. |

---

## 2. Row Level Security (RLS) Policies

To safely integrate, ensure that RLS is strongly typed so users cannot steal other users' clients or metrics.
For all three tables (`projects`, `sessions`, `settings`), deploy the following standard RLS structure:

```sql
-- Enable RLS
alter table public.projects enable row level security;
alter table public.sessions enable row level security;

-- Policy to SELECT (View your own data)
create policy "Users can view their own projects."
on projects for select
using ( auth.uid() = user_id );

-- Policy to INSERT (Create your own data)
create policy "Users can create projects."
on projects for insert
with check ( auth.uid() = user_id );

-- Policy to UPDATE (Edit your own data)
create policy "Users can update their own projects."
on projects for update
using ( auth.uid() = user_id );

-- Policy to DELETE (Remove your own data)
create policy "Users can delete their own projects."
on projects for delete
using ( auth.uid() = user_id );
```
*(Apply symmetric exact mapping to `sessions` table via `auth.uid() = user_id`).*

---

## 3. Required App Updates (API Migration)

To swap the mocked code in `services/projectService.ts` and `services/sessionService.ts` with Supabase bindings:

### A. Dependencies Needed
```bash
npx expo install @supabase/supabase-js
```

### B. Replacement Service Parameters (`projectService.ts`)

```typescript
// Example refactored creation method
export const createProject = async (data: Omit<Project, 'id' | 'createdAt'>) => {
  const { data: project, error } = await supabase
    .from('projects')
    .insert([
       {
         user_id: (await supabase.auth.getUser()).data.user.id,
         title: data.title,
         client: data.client,
         type: data.type,
         model: data.model,
         price: data.price,
         hourlyRate: data.hourlyRate,
         budgetHours: data.budgetHours,
         meetUrl: data.meetUrl,
       }
    ])
    .select()
    .single();

  if (error) throw error;
  return project;
};
```

### C. Type Adjustments
- Move away from mocked string IDs (`p1`, `s1`) to standard **UUIDv4** types.
- Move array filtration loops locally (`MOCK_PROJECTS.filter`) directly into SQL parameters:
  `supabase.from('sessions').select('*').eq('project_id', projectId);`
