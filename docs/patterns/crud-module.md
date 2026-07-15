# CRUD Modülü Tarifi

En sık kullanılan pattern. Kaynak: PhysioFlow `patients` modülü. Yeni bir varlık (öğrenci, personel, üye…) eklerken bu sırayı izle — sıra önemli, her adım bir öncekini kullanır.

Örnek varlık: `students` (öğrenci).

## 1. Migration

`supabase/migrations/<timestamp>_students.sql`: tablo + index + `updated_at` trigger + RLS policy (şablonlar: [database-rls.md](database-rls.md)). Soft delete isteniyorsa `archived_at timestamptz`.

## 2. Tipler — `types/student.ts`

```ts
export type Student = { id: string; full_name: string; phone: string | null; /* ... */ created_at: string; updated_at: string };
export type StudentFormState = { message?: string; fieldErrors?: Record<string, string[] | undefined> };
```

## 3. Validasyon — `validations/student.ts`

```ts
export const studentSchema = z.object({
  full_name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı.").max(120),
  phone: z.string().trim().min(7, "Telefon zorunludur.").max(32),
  notes: z.string().trim().max(1000).optional().transform((v) => (v ? v : null)),
});
// Liste sayfası URL paramları için ayrıca:
export const studentSearchSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
});
```

Kurallar: her string `trim()`; hata mesajları Türkçe ve alan-spesifik; boş opsiyoneller `null`'a transform.

## 4. Sorgular — `lib/students/queries.ts`

Liste (arama + sayfalama, `range` ile), tekil kayıt (`maybeSingle`), select listeleri için hafif sorgu (`id, full_name`). Sayfalar supabase'e doğrudan dokunmaz, hep buradan geçer.

## 5. Server actions — `actions/students.ts`

```ts
"use server";
export async function createStudentAction(
  _prev: StudentFormState, formData: FormData
): Promise<StudentFormState> {
  const authError = await requireStudentManager();      // 1. guard (bkz. auth.md)
  if (authError) return authError;

  const parsed = studentSchema.safeParse({              // 2. validasyon
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  });
  if (!parsed.success)
    return { message: "İşaretli alanları kontrol edin.", fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createServerSupabaseClient();  // 3. yazma
  const { error } = await supabase.from("students").insert(parsed.data);
  if (error) return { message: error.message };

  revalidatePath("/students");                          // 4. cache + toast redirect
  redirect(withToast("/students", "studentCreated"));
}
```

`updateStudentAction(studentId, _prev, formData)` aynı iskelet + `.update().eq("id", id)`. Silme yerine arşivleme tercih et (`archived_at` set eden action + AlertDialog onayı).

## 6. Component'ler — `components/students/`

- `student-form.tsx` — `"use client"`; `useActionState(action, {})`; alan altı hatalar `fieldErrors`'tan; submit `PendingButton` (bkz. [ui-feedback.md](ui-feedback.md)). Edit modunda action'ı `bind` ile kur: `updateStudentAction.bind(null, student.id)`.
- `student-table.tsx` — shadcn Table; mobilde kart görünümüne düşen responsive düzen; satırda düzenle/arşivle.
- Sayfalama: URL `?page=` paramı üzerinden (client state değil).

## 7. Sayfalar — `app/(dashboard)/students/`

```
page.tsx        # RSC: searchParams'ı studentSearchSchema ile parse et → queries → tablo
loading.tsx     # skeleton (mevcut bir loading.tsx'i kopyala)
new/page.tsx    # boş form
[id]/edit/page.tsx  # kaydı çek (yoksa notFound()), dolu form
```

## 8. Menü

Sidebar haritasına route + ikon + görünür roller ekle (`lib/auth/routes.ts` — tek yerden).

## Bitti sayılması için

`npm run build` temiz · mobilde form ve tablo kullanılabilir · yetkisiz rol action'dan hata alıyor (URL'i bilse bile) · toast'lar çalışıyor.
