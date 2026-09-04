import {
  ShieldCheck,
  Building,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
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
import { UserSession } from "@/types/auth";

interface PemilikDashboardViewProps {
  user: UserSession;
}

export function PemilikDashboardView({ user }: PemilikDashboardViewProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Welcome Banner Card */}
      <Card className="border-emerald-100 bg-linear-to-br from-emerald-500/10 via-white to-emerald-50/50 card-shadow overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-emerald-500/10 rounded-full blur-lg pointer-events-none" />
        <CardHeader className="pb-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Panel Pengelola Properti
            </span>
            <Badge variant="lunas" className="text-[10px]">
              Sesi Aktif
            </Badge>
          </div>
          <CardTitle className="text-lg font-black text-slate-900">
            Selamat Datang, {user.name}
          </CardTitle>
          <CardDescription className="text-xs text-slate-600">
            Pantau dan verifikasi pembayaran sewa 8 kamar Kost Syantika untuk periode aktif.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100/80 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-700">
              Seluruh unit kamar (101 - 108) terhubung ke sistem verifikasi bukti transfer.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics Preview */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <Building className="w-4 h-4 text-emerald-600 mb-1" />
          <span className="text-lg font-black text-slate-900 leading-tight">8</span>
          <span className="text-[10px] font-medium text-slate-500">Total Kamar</span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
          <span className="text-lg font-black text-emerald-600 leading-tight">3</span>
          <span className="text-[10px] font-medium text-slate-500">Kamar Lunas</span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <Clock className="w-4 h-4 text-amber-500 mb-1" />
          <span className="text-lg font-black text-amber-600 leading-tight">2</span>
          <span className="text-[10px] font-medium text-slate-500">Perlu Verifikasi</span>
        </div>
      </div>

      {/* Quick Access Card */}
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            Daftar Unit & Tagihan Sewa
          </CardTitle>
          <CardDescription className="text-xs">
            Unit kamar aktif: Kamar 101 hingga 108
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                101
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">Rizky Ramadhan</p>
                <p className="text-[10px] text-slate-500">Rp 1.500.000 / bln</p>
              </div>
            </div>
            <Badge variant="belumbayar">Belum Bayar</Badge>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                102
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">Siti Nurhaliza</p>
                <p className="text-[10px] text-slate-500">Rp 1.300.000 / bln</p>
              </div>
            </div>
            <Badge variant="pending">Menunggu Verifikasi</Badge>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                103
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">Budi Santoso</p>
                <p className="text-[10px] text-slate-500">Rp 1.500.000 / bln</p>
              </div>
            </div>
            <Badge variant="lunas">Lunas</Badge>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Verifikasi Bukti Transfer Detail
            </span>
            <span className="text-[11px] font-bold text-emerald-700">Fase 1 (Tiket #04)</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
