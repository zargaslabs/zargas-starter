# Ortam Değişkenleri

Kaynak: `frontend/.env.example`. Yerel: `frontend/.env.local` · Prod: Netlify env.

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key (RLS altında) |
| `SUPABASE_SERVICE_ROLE_KEY` | Kullanıcı yönetimi için | Sadece server-side; `lib/supabase/admin.ts` dışında kullanılmaz |
| `NEXT_PUBLIC_SITE_URL` | Prod'da ✅ | Davet/şifre sıfırlama e-postalarındaki dönüş adresi |

Yeni server-side değişken eklerken `frontend/src/lib/env.ts` şemasına da ekle —
env değişkenleri `process.env`'den doğrudan değil, `getServerEnv()/getPublicEnv()`
üzerinden okunur.

Supabase Auth ayarı: Dashboard → Authentication → URL Configuration →
Site URL + Redirect URL'lere canlı domain ve `http://localhost:3000` ekle
(`/auth/callback` dönüşleri için).
