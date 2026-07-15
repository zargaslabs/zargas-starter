# {{APP_NAME}} — CLAUDE.md

> Bu dosya zargas-starter ile geldi (kaynak: zargas-kit `CLAUDE.template.md`).
> Yeni projede placeholder'ları `project-spec.md`'den doldur, projeye özel
> kuralları en alta ekle. Pattern tarifleri: `docs/patterns/`.

{{APP_NAME}}, {{MUSTERI}} için geliştirilen bir {{UYGULAMA_TIPI}} uygulamasıdır.
Kapsamın tek kaynağı `project-spec.md`'dir — orada olmayan özellik eklenmez, MVP dışına çıkılmaz.

## Stack

- Next.js (App Router) + TypeScript **strict** (`any` yasak, `unknown` + tip daraltma kullan)
- Tailwind CSS + shadcn/ui (özel component yazmadan önce shadcn'de var mı bak)
- Supabase: PostgreSQL + Auth + RLS (`@supabase/ssr`)
- zod (tüm input validasyonu) · react-hook-form · sonner (toast)
- Netlify deploy (repo kökünde `netlify.toml`, app `frontend/` altında)

## Mimari kurallar

- **Server first:** Server Component varsayılan; `"use client"` sadece form etkileşimi, local state, browser API gerektiğinde.
- **Server Actions:** Tüm CRUD işlemleri server action ile. REST API route'u sadece webhook/cron/entegrasyon için.
- **Mobile first:** Her ekran önce mobilde çalışır; tablet/desktop sonra.
- Component'ler 100-200 satır, max 300; büyüyeni böl.
- Anlamlı hata mesajları: "Bir şeyler ters gitti" değil, "Telefon numarası geçersiz."
- Tüm UI metinleri `lib/i18n/dictionaries.ts` içinde — component'lere hardcoded metin yazma.

## Klasör yapısı

```
frontend/src/
├── app/            # (auth) ve (dashboard) route grupları; her liste sayfasına loading.tsx
├── actions/        # server actions (modül başına bir dosya)
├── components/     # ui/ (shadcn), modül klasörleri, layout/, feedback/, forms/
├── lib/            # supabase/, auth/, i18n/, <modül>/queries.ts, feedback/toast.ts, env.ts
├── types/          # modül başına tip dosyası
├── validations/    # modül başına zod şeması
supabase/migrations/  # konu bazlı sıralı migration'lar
```

## Yeni modül ekleme

Sıra her zaman aynıdır — detaylı tarif: `docs/patterns/crud-module.md` (veya `/new-module` skill'i):

1. `supabase/migrations/` — tablo + index + updated_at trigger + RLS policy
2. `types/<modul>.ts` — satır tipi + form state tipi
3. `validations/<modul>.ts` — zod şeması (trim, min/max, Türkçe hata mesajları)
4. `lib/<modul>/queries.ts` — okuma sorguları (server component'ler buradan çağırır)
5. `actions/<modul>.ts` — rol guard'ı → `safeParse` → supabase yazma → `revalidatePath` → `withToast` redirect
6. `components/<modul>/` — form (`useActionState`), tablo
7. `app/(dashboard)/<modul>/` — liste `page.tsx` + `loading.tsx` + `new/` + `[id]/edit/`
8. `lib/auth/routes.ts` — `navigationItems`'a menü öğesi + `routePermissions`'a rol kuralı

## Güvenlik

- Yetki kontrolü **her server action'ın ilk satırında** (`getActiveSession` + rol kontrolü) — UI'da gizlemek yetmez.
- RLS her tabloda açık; policy'siz tablo bırakılmaz.
- Service role key sadece `lib/supabase/admin.ts` içinde, sadece server-side.
- Bildirim (WhatsApp/e-posta) hataları asıl işlemi asla bloklamaz — logla ve devam et.

## Kalite kapısı (her görev bitiminde)

- `npm run build` hatasız · ESLint temiz · TypeScript hatasız
- Mobilde kontrol edildi
- `project-spec.md` ile uyumlu

## Projeye özel kurallar

{{PROJEYE_OZEL — ör. çakışma kuralları, sektör terminolojisi, özel iş mantığı}}
