import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border-2 border-slate-700 bg-slate-900 px-3 py-2 text-base text-slate-200 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-slate-500 focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/50 aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
