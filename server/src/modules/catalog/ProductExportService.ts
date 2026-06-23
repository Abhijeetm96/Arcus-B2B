/**
 * @file ProductExportService.ts
 * @description Service to export products to CSV / Excel and generate import templates.
 */

import * as XLSX from 'xlsx';
import { getAllProducts } from './ProductService';
import { Product } from './Product';

const TEMPLATE_HEADERS = [
  'Product Name',
  'Brand',
  'Model',
  'SKU',
  'Product ID',
  'Category',
  'Subcategory',
  'Leaf Category',
  'Price',
  'GST Rate',
  'HSN Code',
  'MOQ',
  'MOQ Unit',
  'Order Multiple',
  'Available Stock',
  'Reorder Level',
  'Lead Time',
  'Status',
  'Description'
];

/**
 * Generates the import template buffer.
 */
export function generateTemplate(format: 'xlsx' | 'csv'): Buffer {
  const data = [
    TEMPLATE_HEADERS,
    // Add an example row for operations simplicity!
    [
      'Ultratech Cement 50kg',
      'UltraTech',
      'Premium OPC 53 Grade',
      'UTC001',
      'utc-cement-50',
      'Cement',
      'Portland Cement',
      'OPC 53 Grade',
      420,
      28,
      'HSN-2523',
      50,
      'Bag',
      10,
      1000,
      100,
      2,
      'ACTIVE',
      'High strength Portland cement for concrete work.'
    ]
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  if (format === 'csv') {
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    return Buffer.from(csvContent, 'utf-8');
  } else {
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}

/**
 * Exports products based on filters.
 */
export async function exportCatalog(filters: {
  categoryId?: string;
  brand?: string;
  status?: string;
  format?: 'xlsx' | 'csv';
}): Promise<{ buffer: Buffer; fileName: string; contentType: string }> {
  const allProducts = await getAllProducts();
  
  // Apply filters
  let filtered = allProducts;
  if (filters.categoryId && filters.categoryId !== 'all') {
    filtered = filtered.filter(p => p.categoryId?.toLowerCase() === filters.categoryId?.toLowerCase() || p.categoryTitle?.toLowerCase() === filters.categoryId?.toLowerCase());
  }
  if (filters.brand && filters.brand !== 'all') {
    filtered = filtered.filter(p => p.brand?.toLowerCase() === filters.brand?.toLowerCase());
  }
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(p => p.status === filters.status);
  }

  // Map to table data
  const data = [
    TEMPLATE_HEADERS,
    ...filtered.map(p => [
      p.name,
      p.brand,
      p.model || '',
      p.sku,
      p.productId || p.id,
      p.categoryTitle || p.categoryId,
      p.subcategorySlug || '',
      p.leafSlug || '',
      p.price,
      p.gstRate !== undefined ? p.gstRate : 18,
      p.hsnCode || '',
      p.minimumOrderQuantity || 1,
      p.minimumOrderUnit || 'Piece',
      p.orderMultiple || 1,
      p.inventory?.available ?? p.stock ?? 0,
      p.inventory?.reorderLevel ?? 10,
      p.leadTimeDays || 3,
      p.status || 'ACTIVE',
      p.description || ''
    ])
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  const timestamp = new Date().toISOString().split('T')[0];
  const format = filters.format || 'xlsx';

  if (format === 'csv') {
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    return {
      buffer: Buffer.from(csvContent, 'utf-8'),
      fileName: `arcus_catalog_export_${timestamp}.csv`,
      contentType: 'text/csv'
    };
  } else {
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return {
      buffer,
      fileName: `arcus_catalog_export_${timestamp}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }
}
