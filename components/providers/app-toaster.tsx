"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "!border !border-white/80 !bg-white/92 !text-slate-950 !shadow-[0_28px_60px_-34px_rgba(15,23,42,0.45)]",
          description: "!text-slate-600",
          actionButton: "!bg-[#2f6fe4] !text-white",
        },
      }}
    />
  );
}
