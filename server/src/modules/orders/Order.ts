export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  id?: string;
}

export interface Order {
  id: string;
  userId: string;
  timestamp?: string;
  date?: string;
  products: string;
  status: 'Pending' | 'Awaiting Delivery' | 'Out For Delivery' | 'Delivered' | 'Cancelled' | 'Awaiting Payment' | 'Confirmed' | 'Dispatched';
  amount: number;
  items: OrderItem[];
  shippingAddress: string;
  billingAddress: string;
  gstNumber?: string;
  paymentMethod: string;
  pointsEarned?: number;
  createdAt?: string;
}
