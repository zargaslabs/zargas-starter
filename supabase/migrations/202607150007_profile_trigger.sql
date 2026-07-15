-- Yeni auth kullanıcısında profil satırı otomatik açılır (bkz. docs/patterns/auth.md).
-- inviteUserAction ayrıca upsert eder; bu trigger dashboard'dan elle
-- oluşturulan kullanıcıları da kapsar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email, 'Yeni Kullanıcı'),
    coalesce(new.raw_user_meta_data ->> 'role', 'staff'),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
