/*
# ERP E-commerce — Esquema Inicial (v1)

1. Visão Geral
   Cria o esquema completo do ERP multi-marketplace. Single-tenant (sem auth),
   políticas `TO anon, authenticated` para o frontend com anon-key.

2. Novas Tabelas
   - marketplaces, categories, products, warehouses, inventory
   - customers, orders, order_items
   - suppliers, purchases, purchase_items
   - transactions, stock_checks, stock_check_items
   - system_users, settings

3. Segurança
   - RLS em todas as tabelas, políticas CRUD separadas, TO anon, authenticated.
*/

-- MARKETPLACES
CREATE TABLE IF NOT EXISTS marketplaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#6366f1',
  status text NOT NULL DEFAULT 'ativo',
  external_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE marketplaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mp_select" ON marketplaces;
CREATE POLICY "mp_select" ON marketplaces FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "mp_insert" ON marketplaces;
CREATE POLICY "mp_insert" ON marketplaces FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "mp_update" ON marketplaces;
CREATE POLICY "mp_update" ON marketplaces FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "mp_delete" ON marketplaces;
CREATE POLICY "mp_delete" ON marketplaces FOR DELETE TO anon, authenticated USING (true);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cat_select" ON categories;
CREATE POLICY "cat_select" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "cat_insert" ON categories;
CREATE POLICY "cat_insert" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "cat_update" ON categories;
CREATE POLICY "cat_update" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cat_delete" ON categories;
CREATE POLICY "cat_delete" ON categories FOR DELETE TO anon, authenticated USING (true);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  cost_price numeric(12,2) NOT NULL DEFAULT 0,
  sale_price numeric(12,2) NOT NULL DEFAULT 0,
  image_url text,
  status text NOT NULL DEFAULT 'ativo',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prod_select" ON products;
CREATE POLICY "prod_select" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "prod_insert" ON products;
CREATE POLICY "prod_insert" ON products FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "prod_update" ON products;
CREATE POLICY "prod_update" ON products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "prod_delete" ON products;
CREATE POLICY "prod_delete" ON products FOR DELETE TO anon, authenticated USING (true);

-- WAREHOUSES
CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  address text,
  city text,
  state char(2),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wh_select" ON warehouses;
CREATE POLICY "wh_select" ON warehouses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "wh_insert" ON warehouses;
CREATE POLICY "wh_insert" ON warehouses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "wh_update" ON warehouses;
CREATE POLICY "wh_update" ON warehouses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "wh_delete" ON warehouses;
CREATE POLICY "wh_delete" ON warehouses FOR DELETE TO anon, authenticated USING (true);

-- INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id uuid NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0,
  min_quantity integer NOT NULL DEFAULT 0,
  UNIQUE (product_id, warehouse_id)
);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inv_select" ON inventory;
CREATE POLICY "inv_select" ON inventory FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "inv_insert" ON inventory;
CREATE POLICY "inv_insert" ON inventory FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "inv_update" ON inventory;
CREATE POLICY "inv_update" ON inventory FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "inv_delete" ON inventory;
CREATE POLICY "inv_delete" ON inventory FOR DELETE TO anon, authenticated USING (true);

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  document text,
  city text,
  state char(2),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cust_select" ON customers;
CREATE POLICY "cust_select" ON customers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "cust_insert" ON customers;
CREATE POLICY "cust_insert" ON customers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "cust_update" ON customers;
CREATE POLICY "cust_update" ON customers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cust_delete" ON customers;
CREATE POLICY "cust_delete" ON customers FOR DELETE TO anon, authenticated USING (true);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  marketplace_id uuid REFERENCES marketplaces(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pendente',
  total numeric(12,2) NOT NULL DEFAULT 0,
  items_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_marketplace ON orders(marketplace_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ord_select" ON orders;
CREATE POLICY "ord_select" ON orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "ord_insert" ON orders;
CREATE POLICY "ord_insert" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "ord_update" ON orders;
CREATE POLICY "ord_update" ON orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ord_delete" ON orders;
CREATE POLICY "ord_delete" ON orders FOR DELETE TO anon, authenticated USING (true);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "oi_select" ON order_items;
CREATE POLICY "oi_select" ON order_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "oi_insert" ON order_items;
CREATE POLICY "oi_insert" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "oi_update" ON order_items;
CREATE POLICY "oi_update" ON order_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "oi_delete" ON order_items;
CREATE POLICY "oi_delete" ON order_items FOR DELETE TO anon, authenticated USING (true);

-- SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  cnpj text,
  city text,
  state char(2),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sup_select" ON suppliers;
CREATE POLICY "sup_select" ON suppliers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "sup_insert" ON suppliers;
CREATE POLICY "sup_insert" ON suppliers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sup_update" ON suppliers;
CREATE POLICY "sup_update" ON suppliers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sup_delete" ON suppliers;
CREATE POLICY "sup_delete" ON suppliers FOR DELETE TO anon, authenticated USING (true);

-- PURCHASES
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pendente',
  total numeric(12,2) NOT NULL DEFAULT 0,
  items_count integer NOT NULL DEFAULT 0,
  expected_date date,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pur_select" ON purchases;
CREATE POLICY "pur_select" ON purchases FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "pur_insert" ON purchases;
CREATE POLICY "pur_insert" ON purchases FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "pur_update" ON purchases;
CREATE POLICY "pur_update" ON purchases FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "pur_delete" ON purchases;
CREATE POLICY "pur_delete" ON purchases FOR DELETE TO anon, authenticated USING (true);

-- PURCHASE ITEMS
CREATE TABLE IF NOT EXISTS purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_pi_purchase ON purchase_items(purchase_id);
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pi_select" ON purchase_items;
CREATE POLICY "pi_select" ON purchase_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "pi_insert" ON purchase_items;
CREATE POLICY "pi_insert" ON purchase_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "pi_update" ON purchase_items;
CREATE POLICY "pi_update" ON purchase_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "pi_delete" ON purchase_items;
CREATE POLICY "pi_delete" ON purchase_items FOR DELETE TO anon, authenticated USING (true);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'receita',
  category text NOT NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  marketplace_id uuid REFERENCES marketplaces(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tx_select" ON transactions;
CREATE POLICY "tx_select" ON transactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "tx_insert" ON transactions;
CREATE POLICY "tx_insert" ON transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "tx_update" ON transactions;
CREATE POLICY "tx_update" ON transactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "tx_delete" ON transactions;
CREATE POLICY "tx_delete" ON transactions FOR DELETE TO anon, authenticated USING (true);

-- STOCK CHECKS
CREATE TABLE IF NOT EXISTS stock_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  warehouse_id uuid NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'em_andamento',
  auditor text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_sc_warehouse ON stock_checks(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_sc_status ON stock_checks(status);
ALTER TABLE stock_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sc_select" ON stock_checks;
CREATE POLICY "sc_select" ON stock_checks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "sc_insert" ON stock_checks;
CREATE POLICY "sc_insert" ON stock_checks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sc_update" ON stock_checks;
CREATE POLICY "sc_update" ON stock_checks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sc_delete" ON stock_checks;
CREATE POLICY "sc_delete" ON stock_checks FOR DELETE TO anon, authenticated USING (true);

-- STOCK CHECK ITEMS
CREATE TABLE IF NOT EXISTS stock_check_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_check_id uuid NOT NULL REFERENCES stock_checks(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  expected_quantity integer NOT NULL DEFAULT 0,
  counted_quantity integer,
  difference integer GENERATED ALWAYS AS (COALESCE(counted_quantity, 0) - expected_quantity) STORED
);
CREATE INDEX IF NOT EXISTS idx_sci_check ON stock_check_items(stock_check_id);
ALTER TABLE stock_check_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sci_select" ON stock_check_items;
CREATE POLICY "sci_select" ON stock_check_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "sci_insert" ON stock_check_items;
CREATE POLICY "sci_insert" ON stock_check_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sci_update" ON stock_check_items;
CREATE POLICY "sci_update" ON stock_check_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sci_delete" ON stock_check_items;
CREATE POLICY "sci_delete" ON stock_check_items FOR DELETE TO anon, authenticated USING (true);

-- SYSTEM USERS
CREATE TABLE IF NOT EXISTS system_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'operador',
  status text NOT NULL DEFAULT 'ativo',
  avatar_url text,
  last_access timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "su_select" ON system_users;
CREATE POLICY "su_select" ON system_users FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "su_insert" ON system_users;
CREATE POLICY "su_insert" ON system_users FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "su_update" ON system_users;
CREATE POLICY "su_update" ON system_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "su_delete" ON system_users;
CREATE POLICY "su_delete" ON system_users FOR DELETE TO anon, authenticated USING (true);

-- SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  label text,
  category text NOT NULL DEFAULT 'geral',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "set_select" ON settings;
CREATE POLICY "set_select" ON settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "set_insert" ON settings;
CREATE POLICY "set_insert" ON settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "set_update" ON settings;
CREATE POLICY "set_update" ON settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "set_delete" ON settings;
CREATE POLICY "set_delete" ON settings FOR DELETE TO anon, authenticated USING (true);
