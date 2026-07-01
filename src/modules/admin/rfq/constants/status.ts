export const RFQStatus = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  ASSIGNED: 'Assigned',
  UNDER_REVIEW: 'Under Review',
  NEGOTIATION: 'Negotiation',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  CONVERTED: 'Converted'
} as const;

export type RFQStatusType = typeof RFQStatus[keyof typeof RFQStatus];

export const STATUS_COLORS: Record<RFQStatusType, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'> = {
  [RFQStatus.DRAFT]: 'secondary',
  [RFQStatus.SUBMITTED]: 'default',
  [RFQStatus.ASSIGNED]: 'info',
  [RFQStatus.UNDER_REVIEW]: 'warning',
  [RFQStatus.NEGOTIATION]: 'warning',
  [RFQStatus.APPROVED]: 'success',
  [RFQStatus.REJECTED]: 'danger',
  [RFQStatus.EXPIRED]: 'secondary',
  [RFQStatus.CONVERTED]: 'success'
};
