/**
 * Helper untuk Service Worker dan Notifikasi Web Push Lokal (PWA)
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    return registration;
  } catch (error) {
    console.warn("Gagal mendaftarkan service worker:", error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.warn("Gagal meminta izin notifikasi:", error);
    return "denied";
  }
}

export interface KirimNotifikasiOptions {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
}

export async function kirimNotifikasiLokal({
  title,
  body,
  tag = "pengingat-h3",
  icon = "/icons/icon-192x192.png",
  badge = "/favicon.png",
}: KirimNotifikasiOptions): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && "showNotification" in registration) {
        await registration.showNotification(title, {
          body,
          tag,
          icon,
          badge,
        });
        return;
      }
    }

    // Fallback jika tidak lewat Service Worker
    new Notification(title, {
      body,
      tag,
      icon,
      badge,
    });
  } catch (error) {
    console.warn("Gagal menampilkan notifikasi:", error);
  }
}
