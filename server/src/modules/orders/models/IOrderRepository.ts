import { Order } from '../Order';

/**
 * Interface defining contract database operations for Order records.
 */
export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  save(order: Order): Promise<Order>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<Order[]>;
}
