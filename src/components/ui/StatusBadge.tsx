import { Badge } from './Badge';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  let variant: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' = 'default';

  switch (normalizedStatus) {
    case 'completed':
    case 'accepted':
    case 'delivered':
    case 'paid':
    case 'active':
    case 'success':
      variant = 'success';
      break;
    case 'pending':
    case 'negotiating':
    case 'negotiation':
    case 'review':
    case 'warning':
      variant = 'warning';
      break;
    case 'cancelled':
    case 'rejected':
    case 'failed':
    case 'danger':
      variant = 'danger';
      break;
    case 'assigned':
    case 'info':
    case 'processing':
    case 'shipping':
      variant = 'info';
      break;
    case 'draft':
    case 'secondary':
      variant = 'secondary';
      break;
    default:
      variant = 'default';
  }

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
