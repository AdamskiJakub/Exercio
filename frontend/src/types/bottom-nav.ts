export interface BottomNavBarProps {
  backText: string;
  backHref: any;
  actionButton?: {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
  };
}