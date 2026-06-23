// Models
export { Product, PriceTier } from './modules/catalog/Product';
export { User, OtpRecord } from './modules/users/User';
export { RFQ, Booking, DirectQuote } from './modules/rfq/RFQ';
export { Order, OrderItem } from './modules/orders/Order';
export { Category } from './modules/catalog/Category';
export { AppSettings } from './modules/settings/Settings';
export { Inventory, InventoryAdjustment } from './modules/inventory/Inventory';
export { SearchQueryLog, SearchClickLog } from './modules/search/Search';
export { Brand } from './modules/catalog/Brand';
export { AuditLog } from './modules/analytics/AuditLog';

// Database Config
export { pgPool, usePostgres, readJsonDb, writeJsonDb } from './database/db';

// Services
export { 
  getAllProducts, 
  getProductById, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} from './modules/catalog/ProductService';

export { 
  updateProductStock, 
  updateProductInventory, 
  reserveStock, 
  releaseStock, 
  checkAvailability, 
  reorderChecks,
  recordAdjustment,
  getAdjustmentHistory
} from './modules/inventory/InventoryService';

export { searchService } from './modules/search/SearchService';
export { getAppSettings, updateAppSettings } from './modules/settings/SettingsService';
export { getAllCategories, addCategory, updateCategory, deleteCategory } from './modules/catalog/CategoryService';
export { addRfq, getAllRfqs, updateRfqStatus, addBooking, getAllBookings, addQuote, getAllQuotes } from './modules/rfq/RFQService';
export { addOrder, getOrdersByUserId, getOrderById, updateOrderStatus, getAllOrders } from './modules/orders/OrderService';
export { getAllBrands, getBrandById, addBrand, updateBrand, deleteBrand } from './modules/catalog/BrandService';
export { logAction, getAllAuditLogs } from './modules/analytics/AuditLogService';

// Import / Export / Sync / History Services
export { validateImportSheet, matchZipImages, HEADER_MAPPING } from './modules/catalog/ProductImportService';
export { generateTemplate, exportCatalog } from './modules/catalog/ProductExportService';
export { executeImport, executeBulkUpdates } from './modules/catalog/CatalogSyncService';
export { addImportHistory, getAllImportHistory, getImportHistoryById } from './modules/catalog/ImportHistoryService';

export { 
  addUser, 
  getUserById, 
  getUserByEmail, 
  getUserByPhone, 
  getUserByGst, 
  updateUser, 
  deleteUserByEmail, 
  deleteUserByGst, 
  addOtp, 
  getOtpByUserId, 
  incrementOtpAttempts, 
  deleteOtp, 
  deleteOtpsByUserId,
  getAllUsers
} from './modules/users/UserService';
