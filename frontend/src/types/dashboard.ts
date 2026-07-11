import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface DashboardCardProps {
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  title: ReactNode;
  children: ReactNode;
  delay?: number;
  className?: string;
  hoverable?: boolean;
  hoverColor?: string;
}
