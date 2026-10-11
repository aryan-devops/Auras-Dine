# Security Specification

## 1. Data Invariants
- An order MUST belong to a valid `restaurantId` and a valid `tableId`.
- An order MUST have a `tenantId` that matches the `restaurantId`.
- Customer access to orders MUST be restricted to orders the customer initiated (via authentication UID).
- Kitchen/Waiter access MUST be restricted by roles defined in the `restaurants/{restaurantId}/staff/{userId}` document.

## 2. The "Dirty Dozen" Payloads (Examples)
1. Customer A attempts to read Customer B's order: Should be rejected.
2. Customer attempts to change order status from 'pending' to 'completed': Should be rejected.
3. Waiter attempts to modify menu item pricing: Should be rejected.
4. Kitchen staff attempts to read billing/tenant subscription data: Should be rejected.
5. Unauthorized user attempts to read restaurant tables: Should be rejected.
6. ... (and so on)
