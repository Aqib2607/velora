export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at: string;
}

export interface Tenant {
  id: number;
  name: string;
  domain: string;
  status: string;
}

export interface SellerProfile {
  id: number;
  user_id: number;
  company_name: string;
  status: string;
  commission_rate: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  parent_id?: number | null;
  children?: Category[];
  productCount?: number;
}

export interface Product {
  id: number;
  category_id: number;
  seller_profile_id: number;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  status: 'draft' | 'active' | 'suspended' | 'archived';
  attributes?: Record<string, string | number | boolean>;
  category?: Category | string;
  seller?: SellerProfile | string;
  skus?: Sku[];
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  image?: string;
}

export interface Sku {
  id: number;
  product_id: number;
  sku_code: string;
  price: string | number;
  compare_price?: string | number | null;
  options?: Record<string, string>;
  is_active: boolean;
  inventory?: Inventory;
  product?: Product;
}

export interface Inventory {
  id: number;
  sku_id: number;
  quantity: number;
  reserved_quantity: number;
}

export interface Cart {
  id: number;
  user_id: number;
  status: string;
  items?: CartItem[];
}

export interface CartItem {
  id: number;
  cart_id: number;
  sku_id: number;
  quantity: number;
  unit_price: string | number;
  sku?: Sku;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Completed' | 'Failed' | 'Refunded' | 'Cancelled';
  total_amount: string | number;
  currency: string;
  idempotency_key?: string;
  items?: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: number;
  order_id: number;
  sku_id: number;
  quantity: number;
  unit_price: string | number;
  subtotal: string | number;
  sku?: Sku;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: string | number;
  currency: string;
  provider: string;
  transaction_id: string;
  status: string;
}

export interface Refund {
  id: number;
  order_id: number;
  payment_id: number;
  amount: string | number;
  reason: string;
  status: string;
}

export interface Payout {
  id: number;
  seller_profile_id: number;
  amount: string | number;
  currency: string;
  status: string;
  reference?: string;
}

export interface LedgerEntry {
  id: number;
  transaction_id: number;
  account_id: number;
  debit: string | number;
  credit: string | number;
  currency: string;
}

export interface CommissionRecord {
  id: number;
  order_id: number;
  seller_profile_id: number;
  amount: string | number;
  rate_applied: string | number;
}
