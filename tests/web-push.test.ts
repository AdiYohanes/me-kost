import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  registerServiceWorker,
  requestNotificationPermission,
  kirimNotifikasiLokal,
} from "@/lib/web-push";

describe("Web Push & Service Worker Seam (lib/web-push.ts)", () => {
  const originalNotification = globalThis.Notification;
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.Notification = originalNotification;
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  describe("registerServiceWorker", () => {
    it("mendaftarkan service worker /sw.js jika didukung oleh browser", async () => {
      const mockRegister = vi.fn().mockResolvedValue({ scope: "/" });
      Object.defineProperty(globalThis, "navigator", {
        value: {
          serviceWorker: {
            register: mockRegister,
          },
        },
        configurable: true,
        writable: true,
      });

      const reg = await registerServiceWorker();
      expect(mockRegister).toHaveBeenCalledWith("/sw.js");
      expect(reg).toEqual({ scope: "/" });
    });

    it("mengembalikan null jika service worker tidak didukung", async () => {
      Object.defineProperty(globalThis, "navigator", {
        value: {},
        configurable: true,
        writable: true,
      });

      const reg = await registerServiceWorker();
      expect(reg).toBeNull();
    });
  });

  describe("requestNotificationPermission", () => {
    it("meminta izin notifikasi peramban dan mengembalikan hasil 'granted'", async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue("granted");
      // @ts-expect-error Mocking Notification
      globalThis.Notification = {
        requestPermission: mockRequestPermission,
        permission: "default",
      };

      const result = await requestNotificationPermission();
      expect(mockRequestPermission).toHaveBeenCalled();
      expect(result).toBe("granted");
    });

    it("mengembalikan 'denied' jika Notification API tidak tersedia", async () => {
      // @ts-expect-error Mocking undefined Notification
      delete globalThis.Notification;

      const result = await requestNotificationPermission();
      expect(result).toBe("denied");
    });
  });

  describe("kirimNotifikasiLokal", () => {
    it("mengirimkan notifikasi via service worker jika permission 'granted' dan SW aktif", async () => {
      const mockShowNotification = vi.fn().mockResolvedValue(undefined);
      const mockGetRegistration = vi.fn().mockResolvedValue({
        showNotification: mockShowNotification,
      });

      Object.defineProperty(globalThis, "navigator", {
        value: {
          serviceWorker: {
            getRegistration: mockGetRegistration,
          },
        },
        configurable: true,
        writable: true,
      });

      // @ts-expect-error Mocking Notification
      globalThis.Notification = {
        permission: "granted",
      };

      await kirimNotifikasiLokal({
        title: "Pengingat Jatuh Tempo Kost Syantika",
        body: "Tagihan Kamar 101 akan jatuh tempo dalam 3 hari.",
        tag: "pengingat-h3",
      });

      expect(mockShowNotification).toHaveBeenCalledWith(
        "Pengingat Jatuh Tempo Kost Syantika",
        expect.objectContaining({
          body: "Tagihan Kamar 101 akan jatuh tempo dalam 3 hari.",
          tag: "pengingat-h3",
        })
      );
    });

    it("tidak mengirimkan notifikasi jika permission bukan 'granted'", async () => {
      const mockShowNotification = vi.fn();
      // @ts-expect-error Mocking Notification
      globalThis.Notification = {
        permission: "denied",
      };

      await kirimNotifikasiLokal({
        title: "Pengingat",
        body: "Test body",
      });

      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });
});
