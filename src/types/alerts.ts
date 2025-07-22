export type AlertType = 'success' | 'error' | 'warning' | 'info';
export type AlertVariant = 'filled' | 'outlined' | 'border-left';
export interface Props {
  message: string;
  description?: string;
  type?: AlertType;
  variant?: AlertVariant;
  dismissible?: boolean;
  customClasses?: string;
}