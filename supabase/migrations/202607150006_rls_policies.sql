alter table public.profiles enable row level security;

-- Herkes kendi profilini görür; admin hepsini görür.
create policy "profiles_select_authorized"
on public.profiles
for select
to authenticated
using (
  public.is_admin()
  or id = auth.uid()
);

-- Profil yazma sadece admin (rol yükseltme istemciden yapılamaz;
-- kullanıcı yönetimi zaten service role ile çalışır).
create policy "profiles_insert_admin"
on public.profiles
for insert
to authenticated
with check (public.is_admin());

create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
