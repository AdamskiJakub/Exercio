export interface BottomNavBarProps {
  backText: string;
  backHref: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
  };
}