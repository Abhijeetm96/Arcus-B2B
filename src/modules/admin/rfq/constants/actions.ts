export const RFQAction = {
  ASSIGN: 'Assign',
  CREATE_QUOTATION: 'Create Quotation',
  REQUEST_CLARIFICATION: 'Request Clarification',
  MARK_REVIEWED: 'Mark Reviewed',
  APPROVE: 'Approve',
  REJECT: 'Reject',
  ARCHIVE: 'Archive',
  CONVERT_TO_ORDER: 'Convert to Order',
  ADD_NOTE: 'Add Note',
  UPLOAD_ATTACHMENT: 'Upload Attachment',
  EMAIL_CUSTOMER: 'Email Customer'
} as const;

export type RFQActionType = typeof RFQAction[keyof typeof RFQAction];
