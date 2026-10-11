# Aurasdine · Premium QR Menu & Restaurant Operations SaaS

A production-grade, multi-tenant restaurant SaaS platform featuring QR contactless ordering, strict dietary Veg/Non-Veg controls with conflict protection, real-time Kitchen Display System (KDS), floor waiter calling bell system, table management, and 3/6/12-month membership SaaS administration.

Designed with an elegant, whimsical aesthetic featuring **Glinster** typography, warm ceramic tones, and the curated palette:
- **Tangerine**: `#E3792F`
- **Soft Pistachio**: `#E9E9C7`
- **Retro Green**: `#30673A`

---

## 🌟 Key Features

### 1. Customer Digital Menu & QR Ordering
- **Table-Bound Sessions**: QR codes encode cryptographic tokens binding customers to their exact table.
- **Mandatory Dietary Switch**: Prominent `[ ● Veg ] [ Non-Veg ] [ All ]` segmented control.
- **Cart Conflict Guard**: Switching to Veg while holding Non-Veg items displays a dialog:
  - *Remove items and continue*
  - *Keep my cart & filter view*
- **Customizations**: Portion variants, artisanal add-ons, and chef cooking instructions.
- **Live Order Tracking**: Real-time progress bar (`Received` → `Cooking` → `Ready` → `Served`).

### 2. Waiter Calling Bell & Tableside Assistance
- Customers can page their server directly: *Call Waiter*, *Water Refill*, *Request Bill*, *Table Tidy*, or *Urgent Attention*.
- Floor staff can claim requests and mark them resolved.

### 3. Kitchen Display System (KDS)
- Real-time station tickets with elapsed timers and audio notification alerts.
- Chef workflow buttons: *Accept & Start Cooking*, *Mark Ready on Pass*, *Complete/Handover*.
- Audit history for every order transition.

### 4. Restaurant Owner Admin
- Menu catalogue CRUD with food type classification (`veg`, `vegan`, `non_veg`, `egg`).
- Floor table management & cryptographic QR code generator with printable tent-stand preview & PNG download.
- Daily revenue analytics, order status breakdown, and tax/service charge configuration.

### 5. Super Admin SaaS Platform
- **Multi-Tab Governance Suite**:
  - **Overview & KPIs**: Real-time MRR, ARR run-rate, active vs suspended tenant metrics, and cross-platform order volume.
  - **Tenants Directory**: Search, filter (All, Active, Suspended, Expiring Soon), context switcher, and **Onboard New Restaurant** wizard.
  - **Plans & Pricing Engine**: Custom pricing and table quota editor for 3-Month, 6-Month, and 12-Month tiers.
  - **Billing & Invoices Ledger**: Financial invoice ledger with payment method records and **Export CSV** download.
  - **Security & Audit Trail**: Real-time immutable audit trail filtered by severity (`info`, `warning`, `critical`).
  - **System Health & Broadcast Announcement**: Database latency ping tester, Realtime channel monitor, and live global announcement banner broadcast.
- **Onboarding Wizard**: Self-contained modal that provisions tenant, seeds 3 tables with QR codes, initial categories, sample menu item, and issues subscription invoice.
- **Operational Controls**: Real-time tenant suspension/reactivation and permanent archiving with audit logging.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Access locally or from a mobile phone on the same Wi-Fi
# http://localhost:3000 or http://<YOUR_LOCAL_IP>:3000
```
