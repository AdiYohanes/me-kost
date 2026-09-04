"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:font-sans",
          description: "group-[.toast]:text-slate-500",
          actionButton:
            "group-[.toast]:bg-emerald-600 group-[.toast]:text-white group-[.toast]:rounded-xl group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 group-[.toast]:rounded-xl",
          success:
            "group-[.toaster]:border-emerald-200 group-[.toaster]:text-emerald-950",
          error:
            "group-[.toaster]:border-rose-200 group-[.toaster]:text-rose-950",
          warning:
            "group-[.toaster]:border-amber-200 group-[.toaster]:text-amber-950",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
