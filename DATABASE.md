# AuraDine Database Architecture & Schema Specification

The database model is architected for Supabase PostgreSQL with strict multi-tenant Row-Level Security (RLS).

---

## 1. Schema Tables

### Core Tenant & SaaS Management
- `tenants`: Primary restaurant entity (`id`, `name`, `slug`, `cuisine`, `currency`, `tax_rate`, `service_charge`, `is_open`, `created_at`).
- `tenant_subscriptions`: Membership records (`tenant_id`, `plan_id`, `start_date`, `expiry_date`, `status`, `last_payment_amount`).
- `membership_plans`: Platform subscription tiers (`3_months`, `6_months`, `12_months`).

### Dining Tables & Cryptographic QR
- `restaurant_tables`: Physical dining tables (`id`, `tenant_id`, `table_number`, `capacity`, `qr_token`, `is_active`).
- `table_qr_tokens`: Audit log of issued and rotated tokens with hashes.

### Menu Catalogue
- `menu_categories`: Groupings (`id`, `tenant_id`, `name`, `slug`, `display_order`).
- `menu_items`: Dish records (`id`, `tenant_id`, `category_id`, `name`, `slug`, `description`, `base_price`, `food_type`, `is_available`, `is_recommended`, `is_must_try`, `prep_time_minutes`, `calories`, `allergen_information`).
- `menu_item_variants`: Portion sizing (`id`, `menu_item_id`, `name`, `price_delta`).
- `menu_addons`: Customizable toppings/sides (`id`, `menu_item_id`, `name`, `price`).

### Orders & Kitchen Lifecycle
- `orders`: Master order tickets (`id`, `order_number`, `tenant_id`, `table_id`, `customer_name`, `subtotal`, `tax_amount`, `service_charge_amount`, `grand_total`, `status`, `payment_status`, `special_notes`).
- `order_items`: Line item snapshot with historical prices.
- `order_status_history`: Immutable transition log with timestamps and staff notes.

### Service Calling Bells
- `service_requests`: Real-time waiter calls (`id`, `tenant_id`, `table_id`, `type`, `status`, `claimed_by_staff`, `note`, `created_at`).

---

## 2. Row-Level Security (RLS) Policies

1. **Public Anonymous Menu Access**:
   - `SELECT` on `menu_items`, `menu_categories`, `tenants` WHERE `is_available = true` and `tenant.is_open = true`.
2. **Customer Order Placement**:
   - `INSERT` into `orders` and `order_items` permitted when accompanied by a valid `table_qr_token`.
3. **Tenant Staff Access**:
   - `SELECT`, `UPDATE` on orders, menu, and service requests strictly constrained by `tenant_id = auth.jwt() ->> 'tenant_id'`.
4. **Super Admin Access**:
   - Bypasses tenant scoping only for authenticated users possessing the `platform_super_admin` claim.
