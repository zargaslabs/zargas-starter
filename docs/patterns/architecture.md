# Mimari Pattern'i

Kaynak: PhysioFlow `frontend/src` + `docs/coding-rules.md`. Tüm projelerde aynı iskelet kullanılır.

## Route grupları

```
app/
├── (auth)/                 # login, reset-password, update-password, auth/callback
│   └── layout.tsx          # ortalanmış kart layout'u, session varsa dashboard'a yönlendirir
├── (dashboard)/            # korumalı alan
│   ├── layout.tsx          # ProtectedShell: session yoksa login'e, sidebar + header
│   ├── dashboard/          # metrik kartları (ana sayfa)
│   ├── <modul>/            # her modül: page + loading + new/ + [id]/edit/
│   ├── reports/
│   └── settings/           # işletme ayarları + settings/users (kullanıcı yönetimi)
├── api/                    # SADECE webhook + cron job (ör. api/jobs/send-reminders)
└── page.tsx                # role göre varsayılan sayfaya redirect
```

## Katman sorumlulukları

| Katman | Kural |
|---|---|
| `app/**/page.tsx` | Server Component; `lib/<modul>/queries.ts`'den veri çeker, component'lere geçer |
| `actions/` | Tek yazma noktası. Rol guard → validasyon → DB → revalidate → toast redirect |
| `lib/<modul>/queries.ts` | Tüm SELECT'ler burada; sayfalar doğrudan supabase sorgusu yazmaz |
| `lib/supabase/` | `client.ts` (browser) · `server.ts` (SSR cookie'li) · `admin.ts` (service role, sadece server) |
| `components/ui/` | shadcn — elle düzenlenmez, `npx shadcn add` ile gelir |
| `components/<modul>/` | Modülün form/tablo/kart component'leri |
| `types/` + `validations/` | Modül başına birer dosya; tip `z.infer` ile şemadan türetilebilir |

## Veri akışı (tek yön)

```
page.tsx (RSC) ──queries──▶ Supabase (RLS altında)
     │
     ▼ props
form component ("use client", useActionState)
     │ formData
     ▼
server action ──guard+zod──▶ Supabase ──▶ revalidatePath ──▶ redirect(withToast(...))
```

## Karar kuralları

- Yeni bir ihtiyaç geldiğinde önce: **shadcn'de hazır component var mı? Mevcut pattern'e uyuyor mu?** Yoksa en basit çözüm.
- REST endpoint isteği gelirse sorgula: webhook/cron değilse server action'dır.
- State management kütüphanesi (redux, zustand) ekleme — URL param + server state yeterli.
- i18n: tek dilli projede bile metinleri `lib/i18n/dictionaries.ts` benzeri tek dosyada topla; sonradan dil eklemek kolaylaşır (PhysioFlow'da kanıtlandı).
