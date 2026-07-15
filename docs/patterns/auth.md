# Auth + Rol Tabanlı Erişim Pattern'i

Kaynak: PhysioFlow `lib/auth/session.ts`, `lib/auth/routes.ts`, `actions/auth.ts`.

## Kurulum

- Supabase Auth (e-posta + şifre). Kayıt kapalı: kullanıcıları admin oluşturur (`settings/users`).
- `profiles` tablosu auth kullanıcısını genişletir: `id (auth.users FK)`, `full_name`, `role`, `phone`, `is_active`, timestamps. Yeni auth kullanıcısında trigger ile profil satırı açılır.
- Roller projeye göre spec'ten gelir (ör. `admin`, `secretary`, `physiotherapist`). Tip olarak union: `type Role = "admin" | ...`

## getActiveSession — her şeyin temeli

```ts
// lib/auth/session.ts
export type ActiveSession = { userId: string; email?: string; profile: Profile };

export async function getActiveSession(): Promise<ActiveSession | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();   // getUser, getSession değil!
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles")
    .select("...").eq("id", user.id).maybeSingle();
  if (!profile || !profile.is_active) return null;            // pasif kullanıcı = oturum yok
  return { userId: user.id, email: user.email, profile };
}
```

## Üç koruma katmanı (üçü de zorunlu)

1. **Layout:** `(dashboard)/layout.tsx` session yoksa `redirect("/login")`.
2. **Route-rol eşlemesi:** `lib/auth/routes.ts` içinde hangi rolün hangi route'u görebildiği tek harita; sidebar da menüyü bu haritadan üretir. `getDefaultRouteForRole(role)` login sonrası yönlendirme için.
3. **Server action guard'ı:** Her action'ın başında — UI koruması yetmez:

```ts
async function requireXManager(): Promise<FormState | null> {
  const session = await getActiveSession();
  if (!session) return { message: "Bu işlem için giriş yapmalısınız." };
  if (!["admin", "secretary"].includes(session.profile.role))
    return { message: "Bu işlem için yetkiniz yok." };
  return null; // null = yetkili
}
```

## Sayfalar

- `(auth)/login` — form + server action; başarıda `getDefaultRouteForRole`'a redirect
- `(auth)/reset-password` — e-posta ile link; `(auth)/update-password` — yeni şifre
- `(auth)/auth/callback` — Supabase magic link/recovery dönüşü (client handler)
- Logout: sidebar'da `logout-button.tsx` → server action → `/login`

## Tuzaklar

- `supabase.auth.getSession()` server'da güvenilmez; **her zaman `getUser()`**.
- `is_active = false` yapılan kullanıcı token'ı geçerli olsa bile içeri giremez — kontrol profile üzerinden.
- İlk admin: seed migration ya da Supabase dashboard'dan elle; tarifi teslim dokümanına yaz.
