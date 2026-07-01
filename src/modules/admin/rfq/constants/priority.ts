export const RFQPriority = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
} as const;

export type RFQPriorityType = typeof RFQPriority[keyof typeof RFQPriority];

export const PRIORITY_COLORS: Record<RFQPriorityType, string> = {
  [RFQPriority.LOW]: 'bg-slate-100 text-slate-700 border-slate-200',
  [RFQPriority.MEDIUM]: 'bg-blue-50 text-blue-700 border-blue-100',
  [RFQPriority.HIGH]: 'bg-orange-50 text-orange-700 border-orange-100',
  [RFQPriority.CRITICAL]: 'bg-red-50 text-red-700 border-red-100 animate-pulse'
};
