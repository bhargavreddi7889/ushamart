interface OrderTelegramPayload {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  items: { name: string; quantity: number }[];
  status: string;
}

export async function sendTelegramOrderNotification(
  payload: OrderTelegramPayload
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("Telegram credentials not configured");
    return;
  }

  const itemsList = payload.items
    .map((item) => `${item.name} x ${item.quantity}`)
    .join("\n");

  const message = `🛒 *New Order Received*

*Order ID:* #${payload.orderNumber}
*Customer:* ${payload.customerName}
*Phone:* ${payload.customerPhone}
*Amount:* ₹${payload.total.toLocaleString("en-IN")}

*Items:*
${itemsList}

*Status:* ${payload.status}`;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  });
}
