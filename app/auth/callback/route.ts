import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAndLinkPenghuniGoogleUser, fetchUserProfile } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.session?.user?.email) {
        return NextResponse.redirect(`${origin}/login?error=auth_failed`);
      }

      const authUser = data.session.user;
      const userEmail = authUser.email;
      const authUserId = authUser.id;

      if (!userEmail) {
        return NextResponse.redirect(`${origin}/login?error=auth_failed`);
      }

      // Periksa apakah ini akun Pemilik Kost (Pemilik wajib menggunakan Email & Kata Sandi)
      const profile = await fetchUserProfile(supabase, authUserId, userEmail);

      if (profile && profile.role === "PEMILIK") {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=owner_oauth_unsupported`);
      }

      // Verifikasi alur Penghuni Kost dengan penaut kamar otomatis
      const verification = await verifyAndLinkPenghuniGoogleUser(
        supabase,
        authUserId,
        userEmail
      );

      if (!verification.success) {
        // Hapus sesi auth karena email tidak sah / belum terdaftar di kamar
        await supabase.auth.signOut();
        const reason = verification.reason ?? "unregistered";
        return NextResponse.redirect(
          `${origin}/login?error=${reason}&email=${encodeURIComponent(userEmail)}`
        );
      }

      // Berhasil diverifikasi dan tertaut ke kamar
      return NextResponse.redirect(`${origin}${next}`);
    } catch {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
