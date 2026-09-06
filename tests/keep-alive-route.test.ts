import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/api/keep-alive/route";

vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: vi.fn(),
  };
});

describe("GET /api/keep-alive", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it("should return 500 when environment variables are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toContain("belum dikonfigurasi");
  });

  it("should return 200 when Supabase query succeeds", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

    const { createClient } = await import("@supabase/supabase-js");
    const mockLimit = vi.fn().mockResolvedValue({
      data: [{ id: "mock-kamar-1" }],
      error: null,
    });
    const mockSelect = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom,
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("berhasil");
    expect(body.rowsRetrieved).toBe(1);
    expect(body.timestamp).toBeDefined();
  });

  it("should return 500 when Supabase query fails", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

    const { createClient } = await import("@supabase/supabase-js");
    const mockLimit = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database connection timeout" },
    });
    const mockSelect = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom,
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe("Database connection timeout");
  });
});
