import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white hover:bg-emerald-700",
        secondary:
          "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-200",
        outline:
          "border border-zinc-200 text-zinc-700 hover:bg-zinc-50",
        lunas:
          "bg-emerald-100 text-emerald-800 border border-emerald-200/90 font-medium",
        pending:
          "bg-amber-100 text-amber-800 border border-amber-200/90 font-medium",
        ditolak:
          "bg-rose-100 text-rose-800 border border-rose-200/90 font-medium",
        belumbayar:
          "bg-slate-100 text-slate-700 border border-slate-200 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
