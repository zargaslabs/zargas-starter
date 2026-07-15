// Roller spec'ten gelir; yeni projede bu union'ı ve migration'daki
// check constraint'i birlikte güncelle (bkz. docs/patterns/auth.md).
export type AppRole = "admin" | "staff";

export type Profile = {
  id: string;
  full_name: string;
  role: AppRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthFormState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
