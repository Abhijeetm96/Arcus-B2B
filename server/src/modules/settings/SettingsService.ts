/**
 * @file SettingsService.ts
 * @description Provides business operations for managing application-wide settings.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';
import { AppSettings } from './Settings';

/**
 * Retrieves the global application configuration settings.
 * 
 * @returns {Promise<AppSettings>} The application settings configuration.
 */
export async function getAppSettings(): Promise<AppSettings> {
  const defaults: AppSettings = {
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

  if (usePostgres && pgPool) {
    try {
      const res = await pgPool.query("SELECT key, value FROM settings");
      const settingsMap: Record<string, string> = {};
      for (const row of res.rows) {
        settingsMap[row.key] = row.value;
      }

      return {
        b2cMinimumOrderValue: settingsMap['b2c_minimum_order_value'] !== undefined ? parseFloat(settingsMap['b2c_minimum_order_value']) : defaults.b2cMinimumOrderValue,
        defaultGstRate: settingsMap['default_gst_rate'] !== undefined ? parseFloat(settingsMap['default_gst_rate']) : defaults.defaultGstRate,
        freeShippingThreshold: settingsMap['free_shipping_threshold'] !== undefined ? parseFloat(settingsMap['free_shipping_threshold']) : defaults.freeShippingThreshold,
        defaultMoq: settingsMap['default_moq'] !== undefined ? parseInt(settingsMap['default_moq'], 10) : defaults.defaultMoq,
        defaultOrderMultiple: settingsMap['default_order_multiple'] !== undefined ? parseInt(settingsMap['default_order_multiple'], 10) : defaults.defaultOrderMultiple,
        rfqAutoAssignment: settingsMap['rfq_auto_assignment'] !== undefined ? settingsMap['rfq_auto_assignment'] : defaults.rfqAutoAssignment,
        rfqNotifications: settingsMap['rfq_notifications'] !== undefined ? settingsMap['rfq_notifications'] === 'true' : defaults.rfqNotifications,
        quoteValidityDays: settingsMap['quote_validity_days'] !== undefined ? parseInt(settingsMap['quote_validity_days'], 10) : defaults.quoteValidityDays,
        searchEnableLogging: settingsMap['search_enable_logging'] !== undefined ? settingsMap['search_enable_logging'] === 'true' : defaults.searchEnableLogging,
        notificationEmailAlerts: settingsMap['notification_email_alerts'] !== undefined ? settingsMap['notification_email_alerts'] === 'true' : defaults.notificationEmailAlerts,
      };
    } catch (err) {
      console.error('Error fetching settings from pg:', err);
      return defaults;
    }
  } else {
    const db = await readJsonDb();
    if (!db.settings) {
      db.settings = { ...defaults };
      await writeJsonDb(db);
    }
    return { ...defaults, ...db.settings };
  }
}

/**
 * Updates the global application configuration settings.
 * 
 * @param {AppSettings} settings - The new configuration settings to persist.
 * @returns {Promise<AppSettings>} The updated application settings.
 */
export async function updateAppSettings(settings: AppSettings): Promise<AppSettings> {
  if (usePostgres && pgPool) {
    const mapping = [
      { key: 'b2c_minimum_order_value', value: String(settings.b2cMinimumOrderValue) },
      { key: 'default_gst_rate', value: String(settings.defaultGstRate) },
      { key: 'free_shipping_threshold', value: String(settings.freeShippingThreshold) },
      { key: 'default_moq', value: String(settings.defaultMoq) },
      { key: 'default_order_multiple', value: String(settings.defaultOrderMultiple) },
      { key: 'rfq_auto_assignment', value: String(settings.rfqAutoAssignment) },
      { key: 'rfq_notifications', value: String(settings.rfqNotifications) },
      { key: 'quote_validity_days', value: String(settings.quoteValidityDays) },
      { key: 'search_enable_logging', value: String(settings.searchEnableLogging) },
      { key: 'notification_email_alerts', value: String(settings.notificationEmailAlerts) }
    ];

    for (const item of mapping) {
      await pgPool.query(
        "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2",
        [item.key, item.value]
      );
    }
    return settings;
  } else {
    const db = await readJsonDb();
    db.settings = { ...db.settings, ...settings };
    await writeJsonDb(db);
    return settings;
  }
}
