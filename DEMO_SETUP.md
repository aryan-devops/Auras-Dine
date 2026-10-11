# AuraDine Demo Setup & Cross-Device Testing Guide

This guide explains how to test the multi-tenant restaurant application on your computer and test live QR scanning from a smartphone connected to the same Wi-Fi network.

---

## 1. Local Network Mobile Testing

To test the digital menu directly on your smartphone camera:

1. **Find your computer's local IP address**:
   - macOS / Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Windows: `ipconfig` (look for IPv4 Address, e.g. `192.168.1.45`)

2. **Run Vite development server with host binding**:
   ```bash
   npm run dev -- --host 0.0.0.0 --port 3000
   ```

3. **Connect your phone to the same Wi-Fi network** as your PC.

4. **Open your phone browser**:
   Navigate to `http://<YOUR_LOCAL_IP>:3000` (e.g. `http://192.168.1.45:3000`).

5. **Test QR Table Scanning**:
   - In the **Restaurant Admin** tab on your computer, navigate to **Tables & QR Codes**.
   - Open the **Preview Printable Stand** for Table 4.
   - Point your phone camera at the screen QR code.
   - Your phone will open the digital menu locked directly to Table 4!

---

## 2. Seeded Demo Tenants

### Tenant A: The Green Table
- **Cuisine**: Contemporary Organic & Botanical Bistro
- **Branding**: Retro Green (`#30673A`), Pistachio (`#E9E9C7`), Tangerine (`#E3792F`)
- **Sample Dishes**: Pistachio Smoked Paneer Tikka (Veg), Velvet Dal Makhani (Veg), Nizami Saffron Chicken Biryani (Non-Veg), Irani Masala Omelette (Egg), Quinoa Avocado Bowl (Vegan).

### Tenant B: Urban Grill House
- **Cuisine**: Modern Smokehouse & Craft Burgers
- **Branding**: Charcoal (`#1F2421`), Flame Tangerine (`#E3792F`)
- **Sample Dishes**: The Foundry Double Smash (Non-Veg), 8-Hour Hickory St. Louis Ribs (Non-Veg), Portobello Burger (Veg), Truffle Fries (Veg).

---

## 3. Simulated Demo Accounts

Use the **Simulation Bar** at the top of the interface to switch between roles instantly:

| Role | Interface | Key Workflow to Test |
| :--- | :--- | :--- |
| **Customer** | Mobile Menu | Filter Veg/Non-Veg, observe cart conflict warning, customize dish, place order, track progress |
| **Kitchen KDS** | Chef Screen | View incoming ticket, accept order, start cooking, mark ready to pass |
| **Waiter Bell** | Floor Staff | Receive table calling bell ("Water refill" / "Request bill"), claim & resolve request |
| **Restaurant Admin** | Owner Portal | Create new dishes, classify food type, generate table QR codes, view revenue |
| **Super Admin** | SaaS Console | View all tenants, renew 3/6/12 month subscriptions, toggle suspension |
