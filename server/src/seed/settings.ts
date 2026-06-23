import { AppSettings } from '../modules/settings/Settings';

export const defaultSettings: AppSettings = {
  b2cMinimumOrderValue: 1000,
  defaultGstRate: 18,
  freeShippingThreshold: 5000,
  defaultMoq: 1,
  defaultOrderMultiple: 1,
  rfqAutoAssignment: 'Unassigned',
  rfqNotifications: true,
  quoteValidityDays: 30,
  searchEnableLogging: true,
  notificationEmailAlerts: true
};

