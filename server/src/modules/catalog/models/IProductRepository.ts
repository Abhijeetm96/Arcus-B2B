import { Product } from '../Product';

/**
 * Interface defining contract database operations for Catalog Products.
 */
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<boolean>;
  findAll(filters?: {
    categoryId?: string;
    brand?: string;
    status?: string;
  }): Promise<Product[]>;
}
