type OrderItem = {
  title: string;
  quantity: number;
  price: number;
  imagePath?: string; // optional for now
};

export function renderOrderItemsTable(items: OrderItem[], totalAmount: number) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px;">
            ${
              item.imagePath
                ? `<img src="${item.imagePath}" width="60" style="border-radius:6px;" />`
                : ""
            }
          </td>
          <td style="padding: 8px;">
            <strong>${item.title}</strong><br/>
            Qty: ${item.quantity}
          </td>
          <td style="padding: 8px; text-align:right;">
            ₹${item.price}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th align="left" style="border-bottom:1px solid #ddd; padding:8px;">Item</th>
          <th></th>
          <th align="right" style="border-bottom:1px solid #ddd; padding:8px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr>
          <td colspan="2" style="padding: 12px; text-align:right;">
            <strong>Total</strong>
          </td>
          <td style="padding: 12px; text-align:right;">
            <strong>₹${totalAmount}</strong>
          </td>
        </tr>
      </tbody>
    </table>
  `;
}
