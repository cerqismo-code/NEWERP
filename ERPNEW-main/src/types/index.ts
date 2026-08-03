export interface Marketplace {
  id: string;
  name: string;
  slug: string;
  color: string;
  status: string;
  external_id: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category_id: string | null;
  cost_price: number;
  sale_price: number;
  image_url: string | null;
  status: string;
  created_at: string;
  category?: Category;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  min_quantity: number;
  product?: Product;
  warehouse?: Warehouse;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  number: string;
  marketplace_id: string | null;
  customer_id: string | null;
  status: string;
  total: number;
  items_count: number;
  created_at: string;
  marketplace?: Marketplace;
  customer?: Customer;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  cnpj: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  number: string;
  supplier_id: string | null;
  status: string;
  total: number;
  items_count: number;
  expected_date: string | null;
  created_at: string;
  supplier?: Supplier;
  purchase_items?: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total: number;
}

export interface Transaction {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  order_id: string | null;
  marketplace_id: string | null;
  marketplace?: Marketplace;
  created_at: string;
}

export interface StockCheck {
  id: string;
  number: string;
  warehouse_id: string;
  status: string;
  auditor: string;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  warehouse?: Warehouse;
  stock_check_items?: StockCheckItem[];
}

export interface StockCheckItem {
  id: string;
  stock_check_id: string;
  product_id: string;
  product_name: string;
  expected_quantity: number;
  counted_quantity: number | null;
  difference: number;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar_url: string | null;
  last_access: string | null;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  label: string | null;
  category: string;
  updated_at: string;
}
