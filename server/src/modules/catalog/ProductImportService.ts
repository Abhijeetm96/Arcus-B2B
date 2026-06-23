/**
 * @file ProductImportService.ts
 * @description Service to parse, auto-map, and validate product sheets and images.
 */

import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { getAllCategories } from './CategoryService';
import { getAllBrands } from './BrandService';
import { getAllProducts } from './ProductService';
import { Product } from './Product';

// Dictionary mapping common header names to standard keys
export const HEADER_MAPPING: Record<string, string> = {
  'product name': 'name', 'product_name': 'name', 'productname': 'name', 'name': 'name',
  'brand': 'brand', 'brand_name': 'brand', 'brandname': 'brand',
  'model': 'model', 'model_name': 'model', 'modelname': 'model',
  'sku': 'sku',
  'product id': 'productId', 'product_id': 'productId', 'productid': 'productId', 'id': 'productId',
  'category': 'category', 'category_title': 'category', 'category_id': 'category',
  'subcategory': 'subcategory', 'subcategory_slug': 'subcategory',
  'leaf category': 'leafCategory', 'leaf_category': 'leafCategory', 'leafcategory': 'leafCategory',
  'price': 'price', 'unit_price': 'price', 'unitprice': 'price',
  'gst rate': 'gstRate', 'gst_rate': 'gstRate', 'gstrate': 'gstRate', 'gst': 'gstRate',
  'hsn code': 'hsnCode', 'hsn_code': 'hsnCode', 'hsncode': 'hsnCode', 'hsn': 'hsnCode',
  'moq': 'minimumOrderQuantity', 'minimum_order_quantity': 'minimumOrderQuantity', 'minimumorderquantity': 'minimumOrderQuantity',
  'moq unit': 'minimumOrderUnit', 'moq_unit': 'minimumOrderUnit', 'moqunit': 'minimumOrderUnit', 'minimum_order_unit': 'minimumOrderUnit', 'unit': 'minimumOrderUnit', 'unit_of_measure': 'minimumOrderUnit',
  'order multiple': 'orderMultiple', 'order_multiple': 'orderMultiple', 'ordermultiple': 'orderMultiple',
  'available stock': 'stock', 'available_stock': 'stock', 'availablestock': 'stock', 'stock': 'stock', 'available': 'stock',
  'reorder level': 'reorderLevel', 'reorder_level': 'reorderLevel', 'reorderlevel': 'reorderLevel',
  'lead time': 'leadTimeDays', 'lead_time': 'leadTimeDays', 'leadtime': 'leadTimeDays', 'lead_time_days': 'leadTimeDays',
  'status': 'status',
  'description': 'description', 'desc': 'description'
};

export interface ValidationError {
  row: number;
  sku: string;
  name: string;
  field: string;
  error: string;
}

export interface ValidationWarning {
  row: number;
  sku: string;
  name: string;
  field: string;
  warning: string;
  suggestion?: any;
}

export interface ImportPreview {
  importId: string;
  fileName: string;
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  unrecognizedBrands: string[];
  unrecognizedCategories: Record<string, string>; // name -> suggestion
  mappedRows: any[];
}

/**
 * Suggests a category mapping based on string analysis.
 */
function suggestCategoryMapping(inputCat: string): { categoryId: string; subcategory: string; displayName: string } {
  const clean = inputCat.toLowerCase();
  
  if (clean.includes('pipe') || clean.includes('plumb') || clean.includes('fitting') || clean.includes('valve') || clean.includes('elbow') || clean.includes('tee')) {
    return { categoryId: 'plumbing', subcategory: 'Pipes', displayName: 'Plumbing > Pipes' };
  }
  if (clean.includes('wire') || clean.includes('cable') || clean.includes('switch') || clean.includes('mcb') || clean.includes('electr') || clean.includes('light') || clean.includes('led')) {
    return { categoryId: 'electrical', subcategory: 'Wiring', displayName: 'Electrical > Wiring' };
  }
  if (clean.includes('paint') || clean.includes('brush') || clean.includes('solvent') || clean.includes('primer') || clean.includes('chemical')) {
    return { categoryId: 'paints', subcategory: 'Wall Paints', displayName: 'Paints > Wall Paints' };
  }
  if (clean.includes('cement') || clean.includes('concrete') || clean.includes('mortar') || clean.includes('bag')) {
    return { categoryId: 'cement', subcategory: 'Portland Cement', displayName: 'Cement > Portland Cement' };
  }
  if (clean.includes('steel') || clean.includes('rebar') || clean.includes('rod') || clean.includes('beam') || clean.includes('bar')) {
    return { categoryId: 'steel', subcategory: 'Rebars', displayName: 'Steel > Rebars' };
  }
  if (clean.includes('screw') || clean.includes('bolt') || clean.includes('nut') || clean.includes('nail') || clean.includes('tool') || clean.includes('hardware')) {
    return { categoryId: 'hardware', subcategory: 'Fasteners', displayName: 'Hardware > Fasteners' };
  }
  if (clean.includes('safety') || clean.includes('helmet') || clean.includes('glove') || clean.includes('vest') || clean.includes('boot')) {
    return { categoryId: 'safety', subcategory: 'Personal Protection', displayName: 'Safety > Personal Protection' };
  }
  
  return { categoryId: 'hardware', subcategory: 'General', displayName: 'Hardware > General' };
}

/**
 * Parses and validates an uploaded Excel/CSV file.
 */
export async function validateImportSheet(fileBuffer: Buffer, fileName: string): Promise<ImportPreview> {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert spreadsheet rows to raw array format
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  if (rawRows.length === 0) {
    throw new Error('The uploaded file is empty.');
  }
  
  const headers = (rawRows[0] || []).map(h => String(h || '').trim());
  const headerMap: Record<number, string> = {};
  
  // Auto-map headers
  headers.forEach((h, index) => {
    const cleanHeader = h.toLowerCase().replace(/[^a-z0-9\s_]/g, '');
    if (HEADER_MAPPING[cleanHeader]) {
      headerMap[index] = HEADER_MAPPING[cleanHeader];
    } else {
      // Custom specifications column fallback
      headerMap[index] = `spec_${h}`;
    }
  });

  const parsedRows: any[] = [];
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Database lookup maps
  const existingCategories = await getAllCategories();
  const existingBrands = await getAllBrands();
  const existingProducts = await getAllProducts();
  
  const categoryIds = new Set(existingCategories.map(c => c.id.toLowerCase()));
  const categoryNames = new Set(existingCategories.map(c => c.name.toLowerCase()));
  const brandIds = new Set(existingBrands.map(b => b.id.toLowerCase()));
  const brandNames = new Set(existingBrands.map(b => b.name.toLowerCase()));
  const dbSkus = new Set(existingProducts.map(p => p.sku.toLowerCase()));
  
  const fileSkus = new Set<string>();
  const unrecognizedBrands = new Set<string>();
  const unrecognizedCategories: Record<string, string> = {}; // name -> suggestion

  // Skip header, parse content rows
  for (let r = 1; r < rawRows.length; r++) {
    const rowData = rawRows[r];
    if (!rowData || rowData.length === 0 || rowData.every(cell => cell === null || cell === undefined || cell === '')) {
      continue; // Skip empty rows
    }
    
    const parsedRow: Record<string, any> = { specifications: {} };
    rowData.forEach((cell, index) => {
      const field = headerMap[index];
      if (!field) return;
      
      let val = cell;
      if (typeof cell === 'string') {
        val = cell.trim();
      }
      
      if (field.startsWith('spec_')) {
        const specName = field.substring(5);
        if (val !== undefined && val !== null && val !== '') {
          parsedRow.specifications[specName] = String(val);
        }
      } else {
        parsedRow[field] = val;
      }
    });

    const rowNum = r + 1;
    const sku = String(parsedRow.sku || '').trim();
    const name = String(parsedRow.name || '').trim();

    // 1. Missing SKU
    if (!sku) {
      errors.push({
        row: rowNum,
        sku: 'N/A',
        name: name || 'Unknown',
        field: 'SKU',
        error: 'Missing SKU'
      });
    } else {
      const lowerSku = sku.toLowerCase();
      // 2. Duplicate SKU in uploaded file
      if (fileSkus.has(lowerSku)) {
        errors.push({
          row: rowNum,
          sku: sku,
          name: name || 'Unknown',
          field: 'SKU',
          error: `Duplicate SKU '${sku}' within uploaded file`
        });
      }
      fileSkus.add(lowerSku);
    }

    // 3. Missing Product Name
    if (!name) {
      errors.push({
        row: rowNum,
        sku: sku || 'N/A',
        name: 'Unknown',
        field: 'Product Name',
        error: 'Missing Product Name'
      });
    }

    // 4. Invalid Category & Suggestion
    const rawCat = String(parsedRow.category || '').trim();
    let categoryResolved = false;
    if (rawCat) {
      const lowerCat = rawCat.toLowerCase();
      const matchedCat = existingCategories.find(c => c.id.toLowerCase() === lowerCat || c.name.toLowerCase() === lowerCat);
      if (matchedCat) {
        parsedRow.category = matchedCat.id; // Normalize to ID
        categoryResolved = true;
      } else {
        // Find suggestion
        const sugg = suggestCategoryMapping(rawCat);
        unrecognizedCategories[rawCat] = sugg.displayName;
        warnings.push({
          row: rowNum,
          sku: sku || 'N/A',
          name: name || 'Unknown',
          field: 'Category',
          warning: `Category '${rawCat}' not found. Suggest mapping to '${sugg.displayName}'`,
          suggestion: sugg
        });
        parsedRow.category = sugg.categoryId;
        parsedRow.subcategory = parsedRow.subcategory || sugg.subcategory;
      }
    } else {
      // Smart Default Category based on name
      const sugg = suggestCategoryMapping(name);
      parsedRow.category = sugg.categoryId;
      parsedRow.subcategory = parsedRow.subcategory || sugg.subcategory;
      warnings.push({
        row: rowNum,
        sku: sku || 'N/A',
        name: name || 'Unknown',
        field: 'Category',
        warning: `Missing Category. Defaulting to '${sugg.displayName}' based on product name`,
        suggestion: sugg
      });
    }

    // 5. Invalid Brand
    const rawBrand = String(parsedRow.brand || '').trim();
    if (rawBrand) {
      const lowerBrand = rawBrand.toLowerCase();
      const brandExists = brandIds.has(lowerBrand) || brandNames.has(lowerBrand);
      if (!brandExists) {
        unrecognizedBrands.add(rawBrand);
        warnings.push({
          row: rowNum,
          sku: sku || 'N/A',
          name: name || 'Unknown',
          field: 'Brand',
          warning: `Brand '${rawBrand}' not found. Will be created automatically if confirmed.`
        });
      }
    } else {
      // Smart default brand
      let brandVal = 'Generic';
      if (name) {
        const firstWord = name.split(' ')[0];
        if (firstWord && firstWord.length > 2) {
          brandVal = firstWord;
        }
      }
      parsedRow.brand = brandVal;
      unrecognizedBrands.add(brandVal);
      warnings.push({
        row: rowNum,
        sku: sku || 'N/A',
        name: name || 'Unknown',
        field: 'Brand',
        warning: `Missing Brand. Defaulting to '${brandVal}'`
      });
    }

    // 6. Negative Pricing
    let priceVal = parseFloat(String(parsedRow.price || '0').replace(/[^\d.]/g, ''));
    if (isNaN(priceVal)) {
      priceVal = 0;
    }
    if (priceVal < 0) {
      errors.push({
        row: rowNum,
        sku: sku || 'N/A',
        name: name || 'Unknown',
        field: 'Price',
        error: 'Price cannot be negative'
      });
    }
    parsedRow.price = priceVal;

    // 7. Invalid GST & Smart Defaults
    let gstVal = parsedRow.gstRate;
    if (gstVal === undefined || gstVal === null || gstVal === '') {
      // Category smart default GST rate
      gstVal = parsedRow.category === 'cement' ? 28 : 18;
      warnings.push({
        row: rowNum,
        sku: sku || 'N/A',
        name: name || 'Unknown',
        field: 'GST Rate',
        warning: `Missing GST Rate. Defaulting to ${gstVal}%`
      });
    } else {
      gstVal = parseFloat(String(gstVal));
      if (isNaN(gstVal) || gstVal < 0) {
        errors.push({
          row: rowNum,
          sku: sku || 'N/A',
          name: name || 'Unknown',
          field: 'GST Rate',
          error: 'GST Rate must be a valid non-negative number'
        });
      }
    }
    parsedRow.gstRate = gstVal;

    // 8. Invalid MOQ & Smart Defaults
    let moqVal = parsedRow.minimumOrderQuantity;
    if (moqVal === undefined || moqVal === null || moqVal === '') {
      moqVal = parsedRow.category === 'cement' ? 50 : 1;
      warnings.push({
        row: rowNum,
        sku: sku || 'N/A',
        name: name || 'Unknown',
        field: 'MOQ',
        warning: `Missing MOQ. Defaulting to ${moqVal}`
      });
    } else {
      moqVal = parseInt(String(moqVal), 10);
      if (isNaN(moqVal) || moqVal < 1) {
        errors.push({
          row: rowNum,
          sku: sku || 'N/A',
          name: name || 'Unknown',
          field: 'MOQ',
          error: 'MOQ must be an integer >= 1'
        });
      }
    }
    parsedRow.minimumOrderQuantity = moqVal;

    // MOQ Unit Smart Defaults
    if (!parsedRow.minimumOrderUnit) {
      parsedRow.minimumOrderUnit = parsedRow.category === 'cement' ? 'Bag' : 'Piece';
      warnings.push({
        row: rowNum,
        sku: sku || 'N/A',
        name: name || 'Unknown',
        field: 'MOQ Unit',
        warning: `Missing MOQ Unit. Defaulting to '${parsedRow.minimumOrderUnit}'`
      });
    }

    // Lead Time Smart Defaults
    if (parsedRow.leadTimeDays === undefined || parsedRow.leadTimeDays === null || parsedRow.leadTimeDays === '') {
      parsedRow.leadTimeDays = 3;
    } else {
      parsedRow.leadTimeDays = parseInt(String(parsedRow.leadTimeDays), 10) || 3;
    }

    // 9. Invalid Status
    const status = String(parsedRow.status || 'ACTIVE').toUpperCase();
    const validStatuses = ['ACTIVE', 'OUT_OF_STOCK', 'COMING_SOON', 'DISCONTINUED', 'ARCHIVED', 'RFQ_ONLY'];
    if (!validStatuses.includes(status)) {
      errors.push({
        row: rowNum,
        sku: sku || 'N/A',
        name: name || 'Unknown',
        field: 'Status',
        error: `Invalid status '${parsedRow.status}'. Must be one of: ${validStatuses.join(', ')}`
      });
      parsedRow.status = 'ACTIVE';
    } else {
      parsedRow.status = status;
    }

    // Available Stock
    parsedRow.stock = parseInt(String(parsedRow.stock || '100'), 10);
    if (isNaN(parsedRow.stock) || parsedRow.stock < 0) {
      parsedRow.stock = 100;
    }

    // Reorder level
    parsedRow.reorderLevel = parseInt(String(parsedRow.reorderLevel || '10'), 10);
    if (isNaN(parsedRow.reorderLevel) || parsedRow.reorderLevel < 0) {
      parsedRow.reorderLevel = 10;
    }

    // Order multiple
    parsedRow.orderMultiple = parseInt(String(parsedRow.orderMultiple || '1'), 10);
    if (isNaN(parsedRow.orderMultiple) || parsedRow.orderMultiple < 1) {
      parsedRow.orderMultiple = 1;
    }

    parsedRows.push(parsedRow);
  }

  const importId = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  return {
    importId,
    fileName,
    totalRows: rawRows.length - 1,
    validCount: parsedRows.length - errors.length,
    warningCount: warnings.length,
    errorCount: errors.length,
    errors,
    warnings,
    unrecognizedBrands: Array.from(unrecognizedBrands),
    unrecognizedCategories,
    mappedRows: parsedRows
  };
}

/**
 * Processes extracted ZIP of product images matching SKU
 * Returns report of missing product images or unmatched images
 */
export async function matchZipImages(zipBuffer: Buffer, fileSkus: string[]): Promise<{
  matchedCount: number;
  missingImages: string[];
  unmatchedImages: string[];
  savedImages: Record<string, string>; // sku -> path
}> {
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();
  
  const savedImages: Record<string, string> = {};
  const unmatchedImages: string[] = [];
  const lowercaseSkus = fileSkus.map(s => s.toLowerCase());
  const skuMap = new Map<string, string>(); // lowercase -> original
  fileSkus.forEach(s => skuMap.set(s.toLowerCase(), s));

  // Destination folder for product images
  const uploadDir = path.join(__dirname, '..', '..', '..', 'public', 'product-images');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let matchedCount = 0;

  for (const entry of zipEntries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;
    const baseName = path.basename(entryName);
    const ext = path.extname(baseName).toLowerCase();
    
    if (ext === '.jpg' || ext === '.png' || ext === '.jpeg') {
      const nameWithoutExt = path.basename(baseName, ext).trim().toLowerCase();
      
      if (lowercaseSkus.includes(nameWithoutExt)) {
        const originalSku = skuMap.get(nameWithoutExt)!;
        const targetFilename = `${originalSku}${ext}`;
        const targetPath = path.join(uploadDir, targetFilename);
        
        fs.writeFileSync(targetPath, entry.getData());
        savedImages[originalSku] = `/product-images/${targetFilename}`;
        matchedCount++;
      } else {
        unmatchedImages.push(baseName);
      }
    }
  }

  const missingImages: string[] = [];
  fileSkus.forEach(sku => {
    if (!savedImages[sku]) {
      missingImages.push(sku);
    }
  });

  return {
    matchedCount,
    missingImages,
    unmatchedImages,
    savedImages
  };
}
