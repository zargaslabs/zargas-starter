export const toastSearchParam = "toast";

// Yeni modülde buraya key ekle (ör. "studentCreated") ve mesajını
// lib/i18n/dictionaries.ts feedback bölümüne yaz.
export const toastKeys = [
  "userInvited",
  "userUpdated",
  "userActivated",
  "userDeactivated",
  "passwordUpdated",
] as const;

export type ToastKey = (typeof toastKeys)[number];

export function isToastKey(value: string | null): value is ToastKey {
  return toastKeys.includes(value as ToastKey);
}

export function withToast(path: string, toast: ToastKey): string {
  const [pathname, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  params.set(toastSearchParam, toast);

  return `${pathname}?${params.toString()}`;
}
