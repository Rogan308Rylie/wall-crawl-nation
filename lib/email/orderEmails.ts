import { resend } from "./client";
import { renderOrderItemsTable } from "./orderBlocks";

type Order = {
  id: string;
  email: string;
  name: string;
  totalAmount: number;
  items: {
    title: string;
    quantity: number;
    price: number;
    imagePath?: string;
  }[];
};

export async function sendCustomerOrderPlacedEmail(order: Order) {
  const itemsTable = renderOrderItemsTable(
    order.items,
    order.totalAmount
  );

  await resend.emails.send({
    from: "Wall Crawl Nation <orders@resend.dev>",
    to: order.email,
    subject: "Your Wall Crawl Nation order is confirmed 🎉",
    html: `
      <h2>Hey ${order.name} 👋</h2>

      <p>Your order has been successfully placed.</p>

      <p><strong>Order ID:</strong> ${order.id}</p>

      ${itemsTable}

      <br />

      <a
        href="https://wallcrawl.shop/orders/${order.id}"
        style="
          display:inline-block;
          padding:12px 18px;
          background:#000;
          color:#fff;
          text-decoration:none;
          border-radius:6px;
          margin-top:12px;
        "
      >
        View Order Status
      </a>

      <br /><br />
      <p>We’ll notify you as your order is packed, shipped, and delivered.</p>

      <p>— Wall Crawl Nation</p>
    `,
  });
}

export async function sendAdminNewOrderEmail(order: Order) {
  const itemsTable = renderOrderItemsTable(
    order.items,
    order.totalAmount
  );

  await resend.emails.send({
    from: "Wall Crawl Nation <orders@resend.dev>",
    to: process.env.ADMIN_EMAIL!,
    subject: "🛒 New Order Received",
    html: `
      <h2>New order received</h2>

      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.name}</p>
      <p><strong>Email:</strong> ${order.email}</p>

      ${itemsTable}

      <br />
      <p>Login to admin panel to process this order.</p>
    `,
  });
}

