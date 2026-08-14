# Draft Order Merge API Contract

Date: 2026-08-14
Status: ready for Mobile approval

## Endpoint

```http
POST /api/orders/merge-drafts
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Request

```json
{
  "targetOrderId": "11111111-1111-4111-8111-111111111111",
  "sourceOrderIds": ["22222222-2222-4222-8222-222222222222"]
}
```

Rules:

- `targetOrderId`: UUID of the draft order that remains after merge.
- `sourceOrderIds`: 1–50 UUIDs of selected draft orders to merge into target.
- If `sourceOrderIds` contains `targetOrderId`, backend ignores that duplicate; if no real source remains, request fails.

## Business rules

Backend merges only when all selected orders satisfy:

1. Belong to the current authenticated shop.
2. Have status `draft`.
3. Have the same non-null `customer.id` as the target order.
4. Have no shipment/waybill yet.

On success backend runs one transaction:

1. Moves all `order_items` from source orders to target order.
2. Re-links source `live_comments` to target order.
3. Deletes source orders.
4. Recalculates target order money fields (`subtotalAmount`, `totalAmount`, `remainingAmount`, `codAmount`).
5. Decrements customer `totalOrders` by deleted source count; `totalSpent` is preserved because selected order values remain in the merged target order.

Example: 3 draft orders exist, seller merges 2 selected orders into 1 target → 2 draft orders remain total.

## Success response

```json
{
  "status": "success",
  "message": "Ghép đơn thành công.",
  "data": {
    "merge": {
      "targetOrderId": "11111111-1111-4111-8111-111111111111",
      "mergedOrderIds": [
        "11111111-1111-4111-8111-111111111111",
        "22222222-2222-4222-8222-222222222222"
      ],
      "deletedOrderIds": ["22222222-2222-4222-8222-222222222222"],
      "mergedItemCount": 2,
      "order": {
        "id": "11111111-1111-4111-8111-111111111111",
        "status": "draft",
        "customerId": "customer-uuid",
        "subtotalAmount": 300000,
        "totalAmount": 300000,
        "remainingAmount": 300000,
        "codAmount": 300000,
        "products": []
      }
    }
  }
}
```

`order` is the refreshed target order in the same shape as `GET /api/orders/:orderId`.

## Error cases for Mobile

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid UUID, empty `sourceOrderIds`, or more than 50 source ids. |
| 400 | `BAD_REQUEST` | No real source order after de-dupe, any selected order is not `draft`, customer differs, target has no customer, or any selected order has shipment. |
| 404 | `NOT_FOUND` | Target/source order is missing or not in current shop. |
| 401 | auth error | Missing/invalid JWT. |

Mobile should refresh/remove `deletedOrderIds` from local order list and replace `targetOrderId` with `order` from the response.
