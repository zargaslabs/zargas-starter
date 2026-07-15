# Veritabanı Şeması

> Her şema değişikliğinde bu dosyayı güncelle — Claude her modülde buraya bakar.

## profiles

Auth kullanıcısını genişletir (`auth.users` 1-1). Yeni auth kullanıcısında
`handle_new_user` trigger'ı profil satırı açar.

| Alan | Tip | Not |
|---|---|---|
| id | uuid PK | `auth.users(id)` FK, cascade delete |
| full_name | text, not null | |
| role | text, not null | check: `admin` \| `staff` — spec'e göre genişletilir |
| phone | text | opsiyonel |
| is_active | boolean, default true | pasif kullanıcı giriş yapamaz (token geçerli olsa bile) |
| created_at / updated_at | timestamptz | `set_updated_at` trigger'ı |

**RLS:** select → admin hepsi, herkes kendi satırı; insert/update → sadece admin.
Kullanıcı yönetimi service role üzerinden çalışır (`lib/supabase/admin.ts`).

## Yeni tablolar

Spec'teki varlıklar `docs/patterns/database-rls.md` şablonuyla yeni migration
dosyaları olarak eklenir (tables → indexes → triggers → RLS sırası). Eski
migration asla düzenlenmez.
