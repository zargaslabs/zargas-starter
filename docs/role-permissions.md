# Rol ve Yetki Haritası

> Spec'teki rollere göre bu dosyayı ve kod karşılıklarını birlikte güncelle.

## Roller (varsayılan)

| Rol | Açıklama |
|---|---|
| `admin` | Tüm modüller + kullanıcı yönetimi |
| `staff` | Dashboard (spec'e göre modül erişimleri eklenir) |

## Rol değiştirirken güncellenecek 5 yer

1. `frontend/src/types/auth.ts` — `AppRole` union
2. `frontend/src/validations/user.ts` — `roleValues`
3. `frontend/src/lib/auth/routes.ts` — `navigationItems` + `routePermissions`
4. `frontend/src/lib/i18n/dictionaries.ts` — `roles` bölümü (Türkçe adlar)
5. `supabase/migrations/` — yeni migration ile `profiles.role` check constraint'i

## Route erişimleri

Tek kaynak: `lib/auth/routes.ts`. Sidebar menüsü de bu haritadan üretilir.
Server action guard'ları her action'ın ilk satırındadır — route koruması yetmez
(bkz. `docs/patterns/auth.md`, üç koruma katmanı).
