/**
 * @file CatalogSyncService.ts
 * @description Executes bulk catalog sync tasks, updates, and inserts based on import modes.
 */

import { getAllProducts, addProduct, updateProduct } from './ProductService';
import { getAllBrands, addBrand } from './BrandService';
import { addImportHistory } from './ImportHistoryService';
import { logAction } from '../analytics/AuditLogService';
import { Product } from './Product';
import { Brand } from './Brand';

export interface ImportSyncResult {
  importId: string;
  fileName: string;
  mode: string;
  addedCount: number;
  updatedCount: number;
  failedCount: number;
  skippedCount: number;
  auditMessage: string;
}

/**
 * Normalizes SKU string.
 */
function normalizeSku(sku: any): string {
  return String(sku || '').trim();
}

/**
 * Normalizes a text string into a URL-friendly slug.
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Runs the sync catalog operation.
 */
export async function executeImport(
  importId: string,
  fileName: string,
  mode: 'ADD_NEW' | 'UPDATE_EXISTING' | 'ADD_UPDATE' | 'SYNC',
  rows: any[],
  createBrands: boolean,
  performedBy: string
): Promise<ImportSyncResult> {
  const existingProducts = await getAllProducts();
  const existingBrands = await getAllBrands();

  const brandIds = new Set(existingBrands.map(b => b.id.toLowerCase()));
  const brandNames = new Set(existingBrands.map(b => b.name.toLowerCase()));
  
  const productBySku = new Map<string, Product>();
  existingProducts.forEach(p => {
    productBySku.set(p.sku.toLowerCase(), p);
  });

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const failedRows: any[] = [];

  // 1. Process Brand Auto-Creation if requested
  const brandsToCreate = new Set<string>();
  rows.forEach(r => {
    if (r.brand) {
      const bName = String(r.brand).trim();
      const lower = bName.toLowerCase();
      if (!brandIds.has(lower) && !brandNames.has(lower)) {
        brandsToCreate.add(bName);
      }
    }
  });

  if (createBrands && brandsToCreate.size > 0) {
    for (const bName of brandsToCreate) {
      const bId = slugify(bName);
      const newBrand: Brand = {
        id: bId,
        name: bName,
        logo: '/logo.png', // Fallback logo
        description: `Auto-created during import of ${fileName}`,
        status: 'ACTIVE'
      };
      try {
        await addBrand(newBrand);
        brandIds.add(bId.toLowerCase());
        brandNames.add(bName.toLowerCase());
        await logAction('SETTINGS_CHANGE', `Brand auto-created during import: ${bName} (ID: ${bId})`, performedBy);
      } catch (err) {
        console.error(`Failed to auto-create brand: ${bName}`, err);
      }
    }
  }

  // 2. Process Rows
  const processedSkus = new Set<string>();

  for (const r of rows) {
    const sku = normalizeSku(r.sku);
    if (!sku) {
      failedCount++;
      failedRows.push({ ...r, error: 'Missing SKU' });
      continue;
    }

    const lowerSku = sku.toLowerCase();
    processedSkus.add(lowerSku);
    const existing = productBySku.get(lowerSku);

    // Apply Import Mode Logic
    if (mode === 'ADD_NEW') {
      if (existing) {
        skippedCount++;
        continue;
      }
    } else if (mode === 'UPDATE_EXISTING') {
      if (!existing) {
        skippedCount++;
        continue;
      }
    }

    try {
      if (existing) {
        // Update product fields
        const updatedFields: Partial<Product> = {};
        
        // Update pricing
        if (r.price !== undefined) {
          updatedFields.price = Number(r.price);
        }
        
        // Update inventory
        if (r.stock !== undefined) {
          updatedFields.inventory = {
            available: Number(r.stock),
            reserved: existing.inventory?.reserved || 0,
            reorderLevel: r.reorderLevel !== undefined ? Number(r.reorderLevel) : (existing.inventory?.reorderLevel || 10)
          };
          updatedFields.stock = Number(r.stock);
        } else if (r.reorderLevel !== undefined) {
          updatedFields.inventory = {
            available: existing.inventory?.available || 100,
            reserved: existing.inventory?.reserved || 0,
            reorderLevel: Number(r.reorderLevel)
          };
        }

        // Update MOQ rules
        if (r.minimumOrderQuantity !== undefined) {
          updatedFields.minimumOrderQuantity = Number(r.minimumOrderQuantity);
        }
        if (r.minimumOrderUnit !== undefined) {
          updatedFields.minimumOrderUnit = r.minimumOrderUnit;
          updatedFields.unit = `/ ${r.minimumOrderUnit}`;
          updatedFields.unitOfMeasure = r.minimumOrderUnit;
        }
        if (r.orderMultiple !== undefined) {
          updatedFields.orderMultiple = Number(r.orderMultiple);
        }

        // Update lead time
        if (r.leadTimeDays !== undefined) {
          updatedFields.leadTimeDays = Number(r.leadTimeDays);
        }

        // Update status
        if (r.status !== undefined) {
          updatedFields.status = r.status;
        }

        // Update specifications
        if (r.specifications && Object.keys(r.specifications).length > 0) {
          updatedFields.specifications = {
            ...(existing.specifications || {}),
            ...r.specifications
          };
        }

        // Apply fields to existing
        const mergedProduct: Product = {
          ...existing,
          ...updatedFields,
          // Merge metadata
          categoryTitle: r.category ? r.category.charAt(0).toUpperCase() + r.category.slice(1) : existing.categoryTitle
        };

        await updateProduct(mergedProduct);
        updatedCount++;
      } else {
        // Create brand mapping fallback
        let finalBrand = r.brand || 'Generic';
        
        // Auto-generate ID & Slug
        const prodId = r.productId || slugify(r.name) || `prod_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        const link = `#/product/${prodId}`;

        const newProduct: Product = {
          id: prodId,
          productId: prodId,
          sku: sku,
          brand: finalBrand,
          model: r.model || r.name,
          name: r.name,
          description: r.description || undefined,
          categoryId: r.category || 'hardware',
          subcategorySlug: r.subcategory ? slugify(r.subcategory) : undefined,
          leafSlug: r.leafCategory ? slugify(r.leafCategory) : undefined,
          price: Number(r.price || 0),
          unitOfMeasure: r.minimumOrderUnit || 'Piece',
          hsnCode: r.hsnCode || 'HSN-8481',
          gstRate: r.gstRate !== undefined ? Number(r.gstRate) : 18,
          inventory: {
            available: r.stock !== undefined ? Number(r.stock) : 100,
            reserved: 0,
            reorderLevel: r.reorderLevel !== undefined ? Number(r.reorderLevel) : 10
          },
          minimumOrderQuantity: r.minimumOrderQuantity !== undefined ? Number(r.minimumOrderQuantity) : 1,
          minimumOrderUnit: r.minimumOrderUnit || 'Piece',
          orderMultiple: r.orderMultiple !== undefined ? Number(r.orderMultiple) : 1,
          allowB2B: true,
          allowB2C: true,
          leadTimeDays: r.leadTimeDays !== undefined ? Number(r.leadTimeDays) : 3,
          status: r.status || 'ACTIVE',
          specifications: r.specifications || {},
          images: r.images || [],
          priceTiers: [],
          recommendedAccessories: [],
          reviews: [],
          
          // Legacy Compatibility
          categoryTitle: r.category ? r.category.charAt(0).toUpperCase() + r.category.slice(1) : 'Hardware',
          unit: `/ ${r.minimumOrderUnit || 'Piece'}`,
          stock: r.stock !== undefined ? Number(r.stock) : 100,
          link,
          icon: 'inventory_2',
          rating: '4.5'
        };

        await addProduct(newProduct);
        addedCount++;
      }
    } catch (err: any) {
      console.error(`Error processing import row SKU: ${sku}`, err);
      failedCount++;
      failedRows.push({ ...r, error: err.message || 'Database write error' });
    }
  }

  // 3. Sync Catalog Mode - Archive Missing Products
  if (mode === 'SYNC') {
    const missingProducts = existingProducts.filter(p => {
      const lowerSku = p.sku.toLowerCase();
      // Skip if sku is in the processed list, or if it is already discontinued/archived
      return !processedSkus.has(lowerSku) && p.status !== 'DISCONTINUED' && p.status !== 'ARCHIVED';
    });

    for (const p of missingProducts) {
      try {
        const archivedProduct = {
          ...p,
          status: 'DISCONTINUED' as const
        };
        await updateProduct(archivedProduct);
        updatedCount++;
      } catch (err) {
        console.error(`Failed to archive missing product SKU: ${p.sku}`, err);
      }
    }
  }

  // 4. Create Detailed Failed Rows report in CSV string format
  let errorReport = '';
  if (failedRows.length > 0) {
    const headers = ['Row Number', 'SKU', 'Product Name', 'Error Message'];
    const csvLines = [headers.join(',')];
    failedRows.forEach((fr, i) => {
      const rowNum = i + 2;
      const csvLine = [
        rowNum,
        `"${fr.sku || ''}"`,
        `"${(fr.name || '').replace(/"/g, '""')}"`,
        `"${(fr.error || '').replace(/"/g, '""')}"`
      ];
      csvLines.push(csvLine.join(','));
    });
    errorReport = csvLines.join('\n');
  }

  // 5. Save in Import History
  const historyLog = {
    id: importId,
    importDate: new Date().toISOString(),
    importedBy: performedBy,
    fileName,
    mode,
    productsAdded: addedCount,
    productsUpdated: updatedCount,
    productsFailed: failedCount,
    errorReport: errorReport || undefined
  };
  await addImportHistory(historyLog);

  // 6. Log Audit Action
  const auditMessage = `Import completed (${fileName}, mode: ${mode}). Added: ${addedCount}, Updated: ${updatedCount}, Failed: ${failedCount}, Skipped: ${skippedCount}.`;
  await logAction('PRODUCT_CHANGE', auditMessage, performedBy);

  return {
    importId,
    fileName,
    mode,
    addedCount,
    updatedCount,
    failedCount,
    skippedCount,
    auditMessage
  };
}

/**
 * Execute a fast bulk update of pricing or inventory
 */
export async function executeBulkUpdates(
  type: 'price' | 'inventory' | 'moq' | 'status',
  rows: any[],
  performedBy: string
): Promise<{ updatedCount: number; failedCount: number; errors: any[] }> {
  const existingProducts = await getAllProducts();
  const productMap = new Map<string, Product>();
  existingProducts.forEach(p => productMap.set(p.sku.toLowerCase(), p));

  let updatedCount = 0;
  let failedCount = 0;
  const errors: any[] = [];

  for (const r of rows) {
    const sku = normalizeSku(r.sku);
    if (!sku) {
      failedCount++;
      errors.push({ sku: 'N/A', error: 'Missing SKU' });
      continue;
    }

    const product = productMap.get(sku.toLowerCase());
    if (!product) {
      failedCount++;
      errors.push({ sku, error: `SKU '${sku}' not found in catalog.` });
      continue;
    }

    try {
      if (type === 'price') {
        const priceVal = parseFloat(String(r.price).replace(/[^\d.]/g, ''));
        if (isNaN(priceVal) || priceVal < 0) {
          throw new Error('Invalid price');
        }
        product.price = priceVal;
      } else if (type === 'inventory') {
        const stockVal = parseInt(String(r.stock), 10);
        if (isNaN(stockVal) || stockVal < 0) {
          throw new Error('Invalid stock quantity');
        }
        product.inventory = {
          ...product.inventory,
          available: stockVal
        };
        product.stock = stockVal;
      } else if (type === 'moq') {
        const moqVal = parseInt(String(r.moq), 10);
        if (isNaN(moqVal) || moqVal < 1) {
          throw new Error('Invalid MOQ');
        }
        product.minimumOrderQuantity = moqVal;
        if (r.moqUnit) {
          product.minimumOrderUnit = r.moqUnit;
          product.unit = `/ ${r.moqUnit}`;
          product.unitOfMeasure = r.moqUnit;
        }
        if (r.orderMultiple !== undefined) {
          const multVal = parseInt(String(r.orderMultiple), 10);
          if (!isNaN(multVal) && multVal >= 1) {
            product.orderMultiple = multVal;
          }
        }
      } else if (type === 'status') {
        const statusVal = String(r.status).toUpperCase();
        const validStatuses = ['ACTIVE', 'OUT_OF_STOCK', 'COMING_SOON', 'DISCONTINUED', 'ARCHIVED', 'RFQ_ONLY'];
        if (!validStatuses.includes(statusVal)) {
          throw new Error(`Invalid status '${statusVal}'`);
        }
        product.status = statusVal as any;
      }

      await updateProduct(product);
      updatedCount++;
    } catch (err: any) {
      failedCount++;
      errors.push({ sku, error: err.message || 'Update failed' });
    }
  }

  // Write audit action
  await logAction(
    'INVENTORY_CHANGE',
    `Bulk ${type} update executed. Updated: ${updatedCount}, Failed: ${failedCount}.`,
    performedBy
  );

  return {
    updatedCount,
    failedCount,
    errors
  };
}
