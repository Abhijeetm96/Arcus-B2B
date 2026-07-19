// 1. Export Workspace Engine
export * from './workspace/WorkspaceContext';
export * from './workspace/WorkspaceLayout';
export * from './workspace/useWorkspaceShortcuts';

// 2. Export Enterprise Grid
export * from './grid/EnterpriseGrid';
export * from './grid/useGridPreferences';

// 3. Export Search Engine
export * from './search/GlobalSearch';

// 4. Export Filter Engine
export * from './filters/AdvancedFilterBuilder';
export * from './filters/FilterChips';

// 5. Export Document Engine
export * from './document/DocumentEngine';
export * from './document/resendService';

// 6. Export Notification Engine
export * from './notification/NotificationCenter';
export * from './notification/useNotifications';

// 7. Export Approval & Workflow Engines
export * from './workflow/WorkflowStateMachine';
export * from './workflow/ApprovalTimeline';

// 8. Export Attachment Engine
export * from './attachment/AttachmentManager';

// 9. Export Audit Engine
export * from './audit/AuditService';

// 10. Reusable Master Data Specifications & Type Interfaces
export interface CompanyProfile {
  id: string;
  name: string;
  pan: string;
  cin?: string;
  registeredAddress: string;
  isSez: boolean;
}

export interface BranchProfile {
  id: string;
  companyId: string;
  name: string;
  gstin: string;
  stateCode: string;
  stateName: string;
  address: string;
}

export interface WarehouseProfile {
  id: string;
  branchId: string;
  name: string;
  stateCode: string;
  postalCode: string;
  address: string;
  availableStockLinesCount: number;
}

export interface FinancialYearProfile {
  id: string;
  companyId: string;
  yearLabel: string; // e.g., '2026-27'
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  gstin?: string;
  pan?: string;
  stateCode: string;
  taxTreatment: 'BUSINESS_GST' | 'CONSUMER_B2C' | 'SEZ_DEVELOPER' | 'EXPORT';
}

export interface SupplierProfile {
  id: string;
  name: string;
  gstin?: string;
  pan?: string;
  stateCode: string;
  taxTreatment: 'REGISTERED' | 'UNREGISTERED' | 'COMPOSITION';
  isMsme: boolean;
}

export interface ProductProfile {
  id: string;
  name: string;
  sku: string;
  hsnCode: string;
  gstRate: number;
  taxClassId?: string;
  price: number;
}

export interface BrandProfile {
  id: string;
  name: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface CategoryProfile {
  id: string;
  name: string;
  parentId?: string;
  slug: string;
}

export interface UnitProfile {
  code: string;
  label: string; // e.g., 'Bags', 'Pieces', 'Metric Tons'
}

export interface HsnProfile {
  code: string;
  description: string;
  taxClassId: string;
  standardGstRate: number;
}

export interface GstRateProfile {
  cgst: number;
  sgst: number;
  igst: number;
  cess?: number;
}

export interface TaxClassProfile {
  id: string;
  className: string;
  description?: string;
}

export interface CurrencyProfile {
  code: string; // e.g., 'INR', 'USD', 'EUR'
  symbol: string;
  exchangeRateToInr: number;
}
