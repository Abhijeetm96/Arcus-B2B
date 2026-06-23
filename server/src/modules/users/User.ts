export interface User {
  id?: string;
  name: string;
  full_name?: string;
  fullName?: string;
  email: string;
  phone: string;
  phone_number?: string;
  phoneNumber?: string;
  passwordHash: string;
  password_hash?: string;
  passwordSalt: string;
  companyName?: string;
  role: 'USER' | 'ADMIN' | 'Buyer' | 'Contractor' | 'Supplier' | 'Individual' | 'Business' | 'Professional' | 'Admin';
  customerType?: 'BUSINESS' | 'INDIVIDUAL' | 'PROFESSIONAL';
  adminRole?: 'SUPER_ADMIN' | 'OPERATIONS_MANAGER' | 'INVENTORY_MANAGER' | 'SALES_MANAGER' | 'CUSTOMER_SUPPORT';
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
  email_verified?: boolean;
  gstNumber?: string;
  serviceCategory?: string;
  experience?: string;
  city?: string;
  state?: string;
  website?: string;
  portfolioUrl?: string;
  buildPoints?: number;
}

export interface OtpRecord {
  id: string;
  userId: string;
  otpHash: string;
  expiresAt: string;
  attempts: number;
  createdAt: string;
}
