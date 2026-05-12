export interface BottomNavBarProps {
  backText: string;
  backHref: string;
  backOnClick?: () => void;
  actionButton?: {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
    icon?: React.ReactNode;
    type?: 'button' | 'submit';
    form?: string;
  };
}