# UI Geri Bildirim Pattern'i (toast, loading, pending)

Kaynak: PhysioFlow `lib/feedback/toast.ts`, `components/feedback/`, `components/forms/pending-button.tsx`. Kullanıcı hiçbir işlemin sonucundan şüphede kalmamalı — bu pattern üç boşluğu kapatır.

## 1. Redirect sonrası başarı toast'ı — `withToast`

Server action başarıda `redirect` eder; redirect sonrası toast göstermenin güvenilir yolu URL paramıdır:

- `lib/feedback/toast.ts`: `withToast(path, key)` → `/students?toast=studentCreated` üretir; key→mesaj sözlüğü de burada durur ("Öğrenci eklendi." gibi).
- `components/feedback/route-toast-listener.tsx`: `"use client"`; dashboard layout'una bir kez konur. `useSearchParams`'tan `toast` paramını okur, sonner ile gösterir, `router.replace` ile paramı URL'den temizler (yenilemede tekrar çıkmasın).

## 2. Form hataları — action state üzerinden

Toast değil, **alanın altında** gösterilir:

```tsx
const [state, formAction] = useActionState(createStudentAction, {});
// genel hata:  {state.message && <Alert variant="destructive">{state.message}</Alert>}
// alan hatası: {state.fieldErrors?.full_name && <p className="text-sm text-destructive">...</p>}
```

## 3. Bekleme durumları

- **PendingButton** (`components/forms/pending-button.tsx`): `useFormStatus` ile submit sırasında disable + spinner + "Kaydediliyor…" metni. Her formun submit'i budur.
- **loading.tsx**: veri çeken her route'a skeleton (shadcn `Skeleton` ile tablo/kart silueti). Yeni modülde mevcut bir `loading.tsx` kopyalanıp uyarlanır.

## 4. Yıkıcı işlemler

Arşivle/sil her zaman shadcn `AlertDialog` onayından geçer; onay metni ne olacağını söyler ("5 kayıt arşivlenecek"). Onay sonrası aynı toast akışı.

## Sonner kurulumu

Root layout'ta `<Toaster richColors position="top-center" />` (shadcn `sonner` component'i). Client tarafında anlık geri bildirim gerekirse doğrudan `toast.success/error` — ama CRUD akışlarında standart yol `withToast` redirect'idir, ikisini karıştırma.
