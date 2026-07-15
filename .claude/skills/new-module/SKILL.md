---
name: new-module
description: Mevcut projeye tek komutla CRUD modülü ekler (migration → tip → validasyon → sorgu → action → component → sayfa → menü). Kullanım — /new-module ogrenci "ad, doğum tarihi, veli telefonu, grup"
---

# /new-module — Mevcut Projeye Modül Ekleme

## Girdi

- Varlık adı (Türkçe) + İngilizce tablo adı (çoğul, snake_case — ör. öğrenci → `students`)
- Alan listesi (tip ve zorunluluklarıyla)
- Hangi roller yazabilir, hangi roller okuyabilir
- Liste sayfası ihtiyaçları: arama neye göre, filtre var mı

Eksikse üretmeden önce sor.

## Adımlar

`docs/patterns/crud-module.md` tarifini 1-8 sırasıyla uygula:

1. Migration (tablo + index + trigger + RLS) — `docs/patterns/database-rls.md` şablonlarıyla
2. `types/<entity>.ts`
3. `validations/<entity>.ts` — Türkçe hata mesajları
4. `lib/<entity>/queries.ts`
5. `actions/<entity>.ts` — guard → safeParse → yazma → revalidate → withToast redirect (toast key'ini `lib/feedback/toast.ts` + `lib/i18n/dictionaries.ts` feedback bölümüne ekle)
6. `components/<entity>/` — form + tablo (metinler `dictionaries.ts`'e)
7. `app/(dashboard)/<entity>/` — liste + loading + new + edit
8. `lib/auth/routes.ts` — `navigationItems` + `routePermissions` (rol görünürlüğüyle)

Ardından `docs/database-schema.md`'yi güncelle.

## Doğrulama (bitmeden önce)

- `npm run build` temiz
- Kayıt oluştur → listede gör → düzenle → arşivle akışı çalışıyor
- Validasyon hataları alan altında, Türkçe
- Yetkisiz rolle action çağrısı reddediliyor
- Mobil görünüm kullanılabilir

Tek commit: `Add <entity> module`
