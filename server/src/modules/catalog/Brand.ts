export interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED' | string;
}
