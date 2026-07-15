import type { AppRole } from "@/types/auth";
import type { ToastKey } from "@/lib/feedback/toast";

// Tek dilli proje: tüm UI metinleri bu dosyada toplanır. İkinci dil
// gerekirse bu dosya locale haritasına çevrilir (örnek: PhysioFlow lib/i18n).
const tr = {
  common: {
    appName: "Zargas Starter", // TODO: proje adıyla değiştir
  },
  nav: {
    dashboard: "Panel",
    users: "Kullanıcılar",
  },
  roles: {
    admin: "Yönetici",
    staff: "Personel",
  } satisfies Record<AppRole, string>,
  auth: {
    signInDescription: "Hesabınızla giriş yapın.",
    email: "E-posta",
    password: "Şifre",
    signIn: "Giriş yap",
    signingIn: "Giriş yapılıyor…",
    forgotPassword: "Şifremi unuttum",
    resetTitle: "Şifre sıfırlama",
    resetDescription:
      "E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.",
    sendResetLink: "Sıfırlama bağlantısı gönder",
    sendingResetLink: "Gönderiliyor…",
    resetLinkSent:
      "Bu e-postaya kayıtlı bir hesap varsa sıfırlama bağlantısı gönderildi.",
    backToLogin: "Girişe dön",
    updatePasswordTitle: "Yeni şifre belirle",
    updatePasswordDescription: "Hesabınız için yeni bir şifre girin.",
    newPassword: "Yeni şifre",
    confirmPassword: "Şifre (tekrar)",
    updatePassword: "Şifreyi güncelle",
    updatingPassword: "Güncelleniyor…",
    goToLogin: "Giriş sayfasına git",
    logout: "Çıkış",
    processingInviteTitle: "Bağlantı doğrulanıyor",
    processingInviteDescription:
      "Davet veya şifre sıfırlama bağlantınız işleniyor.",
    processingInvite: "Bağlantı işleniyor…",
    invalidAuthLink:
      "Bağlantı geçersiz veya süresi dolmuş. Yeni bir bağlantı isteyin.",
  },
  dashboard: {
    title: "Panel",
    description: "Genel görünüm ve metrikler.",
    activeUsers: "Aktif kullanıcı",
    activeUsersDescription: "Sisteme giriş yapabilen kullanıcı sayısı",
    placeholderNote:
      "Bu kartlar yer tutucudur — project-spec.md'deki metriklerle değiştir.",
  },
  users: {
    title: "Kullanıcılar",
    description: "Personel hesaplarını oluştur ve yönet.",
    invite: "Yeni kullanıcı",
    fullName: "Ad Soyad",
    email: "E-posta",
    role: "Rol",
    phone: "Telefon",
    phoneOptional: "Telefon (opsiyonel)",
    status: "Durum",
    active: "Aktif",
    inactive: "Pasif",
    actions: "İşlemler",
    edit: "Düzenle",
    save: "Kaydet",
    saving: "Kaydediliyor…",
    sendInvite: "Davet gönder",
    sendingInvite: "Gönderiliyor…",
    deactivate: "Pasife al",
    activate: "Aktifleştir",
    deactivateConfirmTitle: "Kullanıcı pasife alınacak",
    deactivateConfirmDescription:
      "Pasif kullanıcı sisteme giriş yapamaz. Bu işlemi daha sonra geri alabilirsiniz.",
    cancel: "Vazgeç",
    confirm: "Onayla",
    empty: "Henüz kullanıcı yok. İlk kullanıcıyı davet edin.",
    newTitle: "Yeni kullanıcı davet et",
    newDescription:
      "Kullanıcıya e-posta ile davet bağlantısı gönderilir; şifresini kendisi belirler.",
    editTitle: "Kullanıcıyı düzenle",
    backToList: "Kullanıcı listesine dön",
  },
  // withToast redirect'lerinde gösterilen başarı mesajları.
  // Yeni modülde: toast.ts'e key ekle + buraya mesajını yaz.
  feedback: {
    userInvited: "Davet gönderildi.",
    userUpdated: "Kullanıcı güncellendi.",
    userActivated: "Kullanıcı aktifleştirildi.",
    userDeactivated: "Kullanıcı pasife alındı.",
    passwordUpdated: "Şifreniz güncellendi.",
  } satisfies Record<ToastKey, string>,
  // Kullanıcı yönetiminde ?error= paramıyla dönen hata kodları.
  userErrors: {
    missing_user: "Kullanıcı bulunamadı.",
    missing_profile: "Kullanıcı profili bulunamadı.",
    self_deactivation: "Kendi hesabınızı pasife alamazsınız.",
    last_active_admin_deactivation:
      "Son aktif yönetici pasife alınamaz.",
    service_role_missing:
      "Kullanıcı yönetimi için SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.",
    status_update_failed: "Durum güncellenemedi. Tekrar deneyin.",
  },
};

export type Dictionary = typeof tr;
export type UserErrorCode = keyof Dictionary["userErrors"];

export const dictionary: Dictionary = tr;

export function isUserErrorCode(
  value: string | null | undefined
): value is UserErrorCode {
  return Boolean(value && value in tr.userErrors);
}
