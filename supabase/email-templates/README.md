# E-posta şablonları (Supabase Dashboard)

Şablonlar Supabase Dashboard'da tutulur: **Authentication → Emails → Templates**.
Dashboard tek doğruluk kaynağıdır; buradaki HTML dosyalar yayındakinin kopyasıdır —
şablonu değiştirirken ikisini birlikte güncelleyin.

- `recovery.html` → **Reset Password**
- `invite.html` → **Invite user**

Yeni projede: markayı/metni değiştirin, **bağlantı satırlarına dokunmayın**.

## Kural: `{{ .ConfirmationURL }}` kullanmayın

`{{ .ConfirmationURL }}` PKCE bağlantısı üretir (`token=pkce_...`). PKCE, isteği
başlatan tarayıcıda saklanan `code_verifier` çerezini şart koşar. Kullanıcı e-postayı
başka bir cihazda ya da mobil Gmail/Outlook uygulamasının kendi tarayıcısında açınca
o çerez yoktur → bağlantı `/login?error=invalid_link` ile ölür.

`@supabase/ssr` bunu `flowType: "implicit"` vererek çözmeye izin **vermez**:
`createServerClient`/`createBrowserClient` içinde `flowType` sizin auth ayarınız
yayıldıktan sonra `"pkce"`ye sabitlenir. Tek doğru çözüm `{{ .TokenHash }}` ile
**token_hash** akışıdır: doğrulama sunucuda, `/auth/confirm` route handler'ında
yapılır ve çereze bağımlı değildir.

## Şablonlardaki bağlantı

**Reset Password:**

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/update-password
```

**Invite user:**

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/update-password
```

Butonun `href`'i ve altındaki "Buton çalışmazsa şu bağlantıyı yapıştırın" satırındaki
düz metin bağlantı — **ikisi de** ayrı ayrı güncellenmeli.

## Bağımlı ayarlar

- **Authentication → URL Configuration → Site URL** = production domain.
  Şablon `{{ .SiteURL }}` kullandığı için bu değer yanlışsa tüm bağlantılar kırılır.
- **Redirect URLs** listesinde production domain'i `/**` ile bulunmalı.

## Şablonu yayına alma / karşılaştırma

`supabase config push` **kullanmayın**: config.toml'daki tüm `[auth]` bloğunu
(site_url, SMTP, şifre politikası…) varsayılanlarıyla gönderir ve yayındaki ayarları
ezer. Management API ile sadece ilgili alanı güncelleyin:

```bash
REF=<project-ref>
TOKEN=$(cat ~/.supabase/access-token)

# Yayındakini indir ve repodakiyle karşılaştır
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.supabase.com/v1/projects/$REF/config/auth" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).mailer_templates_recovery_content))' \
  | diff - recovery.html && echo "aynı"

# Repodakini yayına al
node -e 'const fs=require("fs");process.stdout.write(JSON.stringify({mailer_templates_recovery_content:fs.readFileSync("recovery.html","utf8")}))' \
  | curl -s -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    --data @- "https://api.supabase.com/v1/projects/$REF/config/auth" -o /dev/null -w "%{http_code}\n"
```

`invite` için alan adı `mailer_templates_invite_content`. Yayındaki auth config'i
yedeklerseniz içinde `smtp_pass` olur — **repoya koymayın**.

## Test

Şifre sıfırlama isteğini masaüstünden gönderip bağlantıyı **isteği yapmadığınız**
bir tarayıcıda (ör. telefon) açın. `/update-password` gelmelidir. Asıl kırılan
senaryo budur; aynı tarayıcıda test etmek yanıltıcıdır.
