---
name: new-project
description: Doldurulmuş project-spec.md'den projeyi uçtan uca ayağa kaldırır — kimlik, şema, modüller, deploy. Yeni müşteri projesi kurulurken kullanılır.
---

# /new-project — Spec'ten Proje Ayağa Kaldırma

## Girdi

Repo kökünde doldurulmuş `project-spec.md` (şablon: zargas-kit `project-spec-template.md`).
Spec eksikse önce eksik soruları kullanıcıya sor — varsayımla modül üretme.

## Adımlar

1. **Altyapı**
   - Supabase projesi hazır değilse: `supabase projects create <proje>` (veya dashboard'dan; URL + anon key + service key al)
   - Netlify: `netlify sites:create` + `netlify env:set` ile `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`
   - `frontend/.env.example` → `.env.local` doldur; `npm install && npm run dev` çalıştığını doğrula

2. **Kimlik**
   - `CLAUDE.md` placeholder'larını (`{{APP_NAME}}`, `{{MUSTERI}}`, `{{UYGULAMA_TIPI}}`, projeye özel kurallar) spec'ten doldur
   - `lib/i18n/dictionaries.ts` içindeki `appName` + `app/layout.tsx` metadata (başlık, açıklama)
   - Marka: `app/globals.css`'te `--primary` ve tema renkleri, logo dosyası
   - Rolleri tanımla: `types/auth.ts` `AppRole` union'ı + `validations/user.ts` `roleValues` + `lib/auth/routes.ts` haritası + migration'daki `role` check constraint'i + `dictionaries.ts` `roles` bölümü — beşi birlikte

3. **Şema**
   - Spec'teki tüm varlıklar için migration seti (`docs/patterns/database-rls.md` sırasıyla: tables → indexes → triggers → RLS)
   - `docs/database-schema.md`'yi güncelle — tablolar, alanlar, ilişkiler
   - `supabase db push` + ilk admin (`docs/initial-admin-setup.md`)

4. **Modüller** — spec'te işaretli her modül için `docs/patterns/crud-module.md` tarifini uygula (`/new-module` skill'i). Sıra: kayıt yönetimi → takvim/vardiya → raporlar → bildirimler → ayarlar. Her modül sonunda build + mobil kontrol; modül başına bir commit.

5. **Kapanış**
   - Dashboard ana sayfasındaki yer tutucu kartları spec'teki metriklerle değiştir
   - Netlify'a deploy; canlı URL'de login → her modülde bir kayıt oluştur → rapor al akışını uçtan uca test et
   - `docs/` klasörünü doldur: database-schema, role-permissions, environment-variables, initial-admin-setup

## Kurallar

- Spec'te olmayan hiçbir modül/özellik eklenmez; "kapsam dışı" bölümündekiler açık talep gelse bile önce kullanıcıya (geliştiriciye) sorulur.
- Her adımda mevcut pattern dosyası varsa ondan sapılmaz; sapma gerekiyorsa gerekçesiyle not edilir ve zargas-kit'e geri işlenir.

## Çıktı raporu

İş bittiğinde özetle: canlı URL, ilk admin bilgisi nerede, modül listesi, bilinen eksikler, spec'ten sapmalar.
