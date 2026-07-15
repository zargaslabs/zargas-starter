-- Roller projeye göre spec'ten gelir; check constraint'i ve
-- frontend/src/types/auth.ts AppRole union'ını birlikte güncelle.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'staff')),
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Spec'teki varlık tabloları buraya yeni migration dosyalarıyla eklenir
-- (şablon: docs/patterns/database-rls.md).
