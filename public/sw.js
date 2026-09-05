// Service Worker Kost Syantika (PWA & Push Notifications)

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Pengingat Jatuh Tempo Kost Syantika";
  const options = {
    body: data.body || "Tagihan sewa kamar Anda mendekati tanggal jatuh tempo.",
    icon: "/icons/icon-192x192.png",
    badge: "/favicon.png",
    tag: data.tag || "pengingat-h3",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/dashboard");
      }
    })
  );
});
