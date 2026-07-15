# İlk Admin Kurulumu

Kayıt kapalıdır; kullanıcıları admin davet eder. İlk admin'i açmak için:

1. Supabase Dashboard → Authentication → Users → **Add user** → e-posta + şifre
   (veya "Send invitation").
2. `handle_new_user` trigger'ı profili `staff` rolüyle açar; rolü yükselt:

```sql
update public.profiles
set role = 'admin', full_name = 'Ad Soyad'
where id = (select id from auth.users where email = 'admin@example.com');
```

3. Uygulamada bu hesapla giriş yap → `Kullanıcılar` sayfasından diğer
   kullanıcıları davet et.

> Teslimde: müşteriye verilen admin e-postasını ve şifre sıfırlama akışını
> teslim dokümanına yaz (bkz. zargas-kit `playbook/04-teslim-checklist.md`).
