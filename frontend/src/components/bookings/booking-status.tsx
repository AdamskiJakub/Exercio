import type { Booking } from "@/hooks/useMyBookings";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import type { ReactNode } from "react";

export interface StatusConfig {
  icon: ReactNode;
  colorClass: string;
}

export const BOOKING_STATUS_CONFIG: Record<Booking["status"], StatusConfig> = {
  CONFIRMED: {
    icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    colorClass: "bg-emerald-500/10 text-emerald-500",
  },
  PENDING: {
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
    colorClass: "bg-amber-500/10 text-amber-500 justify-center md:w-full",
  },
  CANCELLED: {
    icon: <XCircle className="w-5 h-5 text-rose-500" />,
    colorClass: "bg-rose-500/10 text-rose-500",
  },
  COMPLETED: {
    icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    colorClass: "bg-emerald-500/10 text-emerald-500",
  },
  EXPIRED: {
    icon: <Clock className="w-5 h-5 text-slate-500" />,
    colorClass: "bg-slate-500/10 text-slate-500",
  },
};
