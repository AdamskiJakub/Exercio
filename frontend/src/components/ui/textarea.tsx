import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-lg border-2 border-slate-700 bg-slate-900 px-3 py-2 text-base text-slate-200 transition-colors outline-none placeholder:text-slate-500 focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/50 aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
