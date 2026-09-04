import {
  DoorClosed,
  Calendar,
  CreditCard,
  UploadCloud,
  Banknote,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserSession } from "@/types/auth";

interface PenghuniDashboardViewProps {
  user: UserSession;
}

export function PenghuniDashboardView({ user }: PenghuniDashboardViewProps) {
  const formattedNominal = user.tarifBulanan
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(user.tarifBulanan)
    : "Rp 1.500.000";

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Greeting & Room Card */}
      <Card className="border-emerald-100 bg-linear-to-br from-emerald-500/10 via-white to-emerald-50/50 card-shadow overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-emerald-500/10 rounded-full blur-lg pointer-events-none" />
        <CardHeader className="pb-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <DoorClosed className="w-3.5 h-3.5" />
              Kamar {user.nomorKamar}
            </span>
            <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-800">
              Penghuni Aktif
            </Badge>
          </div>
          <CardTitle className="text-lg font-black text-slate-900">
            Halo, {user.name}
          </CardTitle>
          <CardDescription className="text-xs text-slate-600">
            {user.tipeKamar || "Kamar Kost Syantika"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 p-2.5 bg-white/90 rounded-xl border border-emerald-100/80 text-xs text-slate-700">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Periode Sewa Aktif: <strong>September 2026</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Active Bill Card */}
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Tagihan Kamar Anda
            </CardTitle>
            <Badge variant="belumbayar">Belum Bayar</Badge>
          </div>
          <CardDescription className="text-xs">
            Batas waktu pembayaran tanggal 10 setiap bulan
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Nominal Sewa Bulanan</p>
              <p className="text-xl font-black text-slate-900">{formattedNominal}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">Jatuh Tempo</p>
              <p className="text-xs font-semibold text-rose-600">10 Sep 2026</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <Button variant="emerald" className="w-full gap-2 text-xs font-semibold">
              <UploadCloud className="w-4 h-4" />
              Unggah Bukti Transfer
            </Button>

            <Button variant="outline" className="w-full gap-2 text-xs font-semibold border-slate-200">
              <Banknote className="w-4 h-4 text-slate-600" />
              Informasi Bayar Tunai (Cash)
            </Button>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Form upload bukti transfer foto Base64 siap dihubungkan di Tiket #03.</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
