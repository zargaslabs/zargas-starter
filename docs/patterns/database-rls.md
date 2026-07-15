# Veritabanı + RLS Pattern'i

Kaynak: PhysioFlow `supabase/migrations/`. Migration'lar konu bazlı ve sıralı numaralanır.

## Migration sırası (yeni projede aynı düzen)

```
..._0001_extensions.sql          # pgcrypto vb.
..._0002_tables.sql              # tüm tablolar
..._0003_indexes.sql             # index'ler
..._0004_updated_at_triggers.sql # ortak trigger
..._0005_rls_helper_functions.sql
..._0006_rls_policies.sql
..._0007_seed_<...>.sql          # ayarlar/ilk veriler
```

Sonraki değişiklikler yeni dosyayla eklenir (`..._<konu>.sql`); eski migration asla düzenlenmez.

## Tablo şablonu

```sql
create table public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  notes text,
  archived_at timestamptz,          -- soft delete
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## updated_at trigger (bir kez tanımla, her tabloya bağla)

```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();
```

## RLS helper fonksiyonları

Policy'lerin içinde subquery tekrarlamamak için:

```sql
create or replace function public.current_role()
returns text language sql stable security definer as $$
  select role from public.profiles where id = auth.uid() and is_active
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select public.current_role() = 'admin'
$$;
```

## Policy şablonları

```sql
alter table public.students enable row level security;

-- Okumaya tüm aktif personel, yazmaya yetkili roller:
create policy "students_select" on public.students
  for select using (public.current_role() is not null);

create policy "students_write" on public.students
  for all using (public.current_role() in ('admin', 'secretary'))
  with check (public.current_role() in ('admin', 'secretary'));

-- "Sadece kendi kaydını görsün" varyantı (ör. personel kendi vardiyası):
create policy "shifts_select_own" on public.shifts
  for select using (staff_id = auth.uid() or public.is_admin());
```

## Kurallar

- **Policy'siz tablo prod'a çıkmaz.** RLS'i açıp policy yazmayı unutmak = tablo tamamen erişilmez; RLS'i hiç açmamak = herkese açık. İkisi de kontrol edilir.
- `profiles.role` istemciden güncellenemez olmalı (update policy'de `role` değişimini sadece admin'e bırak).
- Raporlama gibi karmaşık okuma için view/SQL kullanılabilir; normal CRUD'da raw SQL yazma.
- Şema kararlarını projenin `docs/database-schema.md` dosyasına yaz (PhysioFlow'daki gibi) — Claude her modülde oraya bakar.
