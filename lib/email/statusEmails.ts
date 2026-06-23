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

const STATUS_COPY: Record<
  "packed" | "shipped" | "delivered",
  { subject: string; heading: string; message: string }
> = {
  packed: {
    subject: "📦 Your order is packed!",
    heading: "Your order is packed 📦",
    message: "Good news! Your order has been packed and will be shipped soon.",
  },
  shipped: {
    subject: "🚚 Your order is on the way!",
    heading: "Your order has been shipped 🚚",
    message: "Your order is on the way. Sit tight!",
  },
  delivered: {
    subject: "✅ Order delivered!",
    heading: "Your order has been delivered ✅",
    message: "We hope it looks amazing on your wall!",
  },
};

export async function sendOrderStatusEmail(
  order: Order,
  status: "packed" | "shipped" | "delivered"
) {
  const copy = STATUS_COPY[status];
  const itemsTable = renderOrderItemsTable(order.items, order.totalAmount);

  await resend.emails.send({
    from: "Wall Crawl Nation <orders@resend.dev>",
    to: order.email,
    subject: copy.subject,
    html: `
      <h2>${copy.heading}</h2>

      <p>Hey ${order.name},</p>
      <p>${copy.message}</p>

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
      <p>- Wall Crawl Nation</p>
    `,
  });
}
