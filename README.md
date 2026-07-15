# zargas-starter

Zargas Labs müşteri projeleri (iç yönetim uygulamaları) için template repo.
Bilgi tabanı [zargas-kit](../zargas-kit)'tedir; bu repo onun **kod** karşılığıdır —
PhysioFlow'dan damıtılmış, kit pattern'lerine birebir uyan çalışır iskelet.

## İçinde ne var

- **Auth:** login / şifre sıfırlama / şifre güncelleme / davet callback'i; `getActiveSession` + üç koruma katmanı (`docs/patterns/auth.md`)
- **Dashboard shell:** rol-farkındalıklı sidebar (menü `lib/auth/routes.ts` haritasından üretilir), header, mobile-first düzen
- **Kullanıcı yönetimi:** `settings/users` — davet, düzenleme, aktif/pasif (service role ile; son admin ve kendi hesabını pasife alma korumaları dahil)
- **Geri bildirim altyapısı:** `withToast` redirect + `RouteToastListener`, `PendingButton`, `RouteLoading` skeleton, AlertDialog onayı
- **Supabase:** `client/server/admin` istemcileri, `profiles` + RLS helper'lı migration seti, yeni kullanıcıda profil trigger'ı
- **Tek dosya sözlük:** tüm UI metinleri `lib/i18n/dictionaries.ts` içinde (Türkçe; ikinci dil eklenebilir yapıda)
- **Skills:** `.claude/skills/new-project` ve `new-module` — Claude Code ile proje kurma / modül ekleme
- **Pattern tarifleri:** `docs/patterns/` (kaynak: zargas-kit — değişiklikleri kite geri işle)

Roller varsayılan `admin | staff`; spec'e göre `types/auth.ts` + `validations/user.ts` + migration check constraint'i birlikte değişir.

## Yeni proje kurulumu

Tam akış zargas-kit README'de; kısaca:

1. `gh repo create <proje> --private --template zargas-labs/zargas-starter --clone`
2. Doldurulmuş `project-spec.md`'yi repo köküne koy, `CLAUDE.md` placeholder'larını doldur
3. Supabase projesi oluştur → `frontend/.env.example` → `.env.local`
4. `supabase link` + `supabase db push` (ilk admin: `docs/initial-admin-setup.md`)
5. `cd frontend && npm install && npm run dev`
6. Modülleri `/new-module` (ya da `docs/patterns/crud-module.md`) ile ekle

## Yerel geliştirme

```bash
cd frontend
cp .env.example .env.local   # değerleri doldur
npm install
npm run dev
```

## Yapı

```
frontend/          # Next.js app (App Router, src/ altında)
supabase/          # migration'lar (konu bazlı, sıralı)
docs/              # şema, ortam değişkenleri, ilk admin + patterns/
.claude/skills/    # new-project, new-module
netlify.toml       # base=frontend deploy ayarı
CLAUDE.md          # proje talimatları (placeholder'lı)
```

## Geri besleme kuralı

Projede öğrenilen her genellenebilir şey önce zargas-kit'e, sonra buraya işlenir.
Starter'daki pattern kopyaları (`docs/patterns/`) kit ile senkron tutulur.
