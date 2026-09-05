import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  // Menyegarkan sesi pengguna sebelum route dijalankan
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    /*
     * Tangani rute dinamis dan lindungi sesi, kecualikan file statis:
     * - _next/static, _next/image, favicon.ico, images, manifest
     */
    "/((?!_next/static|_next/image|favicon.ico|images|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
