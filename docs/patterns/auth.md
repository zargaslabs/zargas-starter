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
- `(auth)/auth/confirm` — **e-posta bağlantılarının indiği yer** (route handler, aşağıya bak)
- `(auth)/auth/callback` — eski `?code=` / `#access_token` bağlantıları ve OAuth için yedek
- Logout: sidebar'da `logout-button.tsx` → server action → `/login`

## E-posta bağlantıları: token_hash, PKCE değil

Davet ve şifre sıfırlama e-postalarında `{{ .ConfirmationURL }}` **kullanma**. O
bağlantı PKCE üretir (`token=pkce_...`) ve isteği başlatan tarayıcıda saklanan
`code_verifier` çerezini şart koşar. Kullanıcı e-postayı telefonundan ya da mobil
Gmail/Outlook uygulamasının kendi tarayıcısından açınca çerez yoktur; bağlantı
`/login?error=invalid_link` ile ölür. Aynı tarayıcıda test edilirse fark edilmez —
bu yüzden üretimde patlayana kadar gizli kalır.

`flowType: "implicit"` vererek çözülmez: `@supabase/ssr`, `createServerClient` ve
`createBrowserClient` içinde `flowType`'ı senin auth ayarın yayıldıktan **sonra**
`"pkce"`ye sabitler. Verdiğin ayar sessizce yok sayılır.

Doğru çözüm doğrulamayı sunucuya taşımak:

```ts
// app/(auth)/auth/confirm/route.ts
export async function GET(request: NextRequest): Promise<never> {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type");                       // recovery | invite | ...
  const nextPath = sanitizeNextPath(params.get("next")); // "//" ile başlayanı ele!

  if (!tokenHash || !isConfirmType(type)) redirect("/login?error=invalid_link");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) redirect("/login?error=invalid_link");

  redirect(withOwnQuery(nextPath ?? "/update-password", type));
}
```

E-posta şablonundaki bağlantı (buton `href`'i **ve** altındaki düz metin):

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/update-password
```

Ayrıntı ve şablonların kopyası: `supabase/email-templates/`.

## Tuzaklar

- `supabase.auth.getSession()` server'da güvenilmez; **her zaman `getUser()`**.
- E-posta şablonunda `{{ .ConfirmationURL }}` → cihazlar arası kırık bağlantı (yukarı bak).
  `flowType: "implicit"` ile düzeltilemez; `@supabase/ssr` bu ayarı ezer.
- `?code=` callback'inde `exchangeCodeForSession`'ı doğrudan çağırma: `detectSessionInUrl`
  açık olduğu için supabase-js client kurulurken code'u zaten takas edip tek kullanımlık
  `code_verifier`'ı silmiş olabilir; ikinci takas her zaman hata verir. Önce `getSession()`
  ile oturum kurulmuş mu bak.
- Netlify: yönlendirme hedefinin kendi sorgu dizesi yoksa gelen isteğin sorgusu hedefe
  kopyalanır — `token_hash` adres çubuğuna/geçmişe düşer. Hedefe kendi sorgusunu ver.
- `is_active = false` yapılan kullanıcı token'ı geçerli olsa bile içeri giremez — kontrol profile üzerinden.
- İlk admin: seed migration ya da Supabase dashboard'dan elle; tarifi teslim dokümanına yaz.
