import nodemailer from "nodemailer";

// ============================================================
// Gmail SMTP Transporter
// ============================================================
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export interface OrderEmailData {
    orderNumber: string;
    fullName: string;
    email: string;
    paymentMethod: string;
    deliveryMethod: string;
    deliveryLocation: string;
    deliveryNotes?: string | null;
    subtotal: number;
    deliveryFee: number;
    total: number;
    mpesaReceipt?: string | null;
    items: {
        productName: string;
        variantName?: string | null;
        quantity: number;
        price: number;
    }[];
}

function formatPrice(amount: number): string {
    return `KSh ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
}

function buildOrderEmailHtml(data: OrderEmailData): string {
    const itemRows = data.items
        .map(
            (item) => `
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333;">
                    <span style="font-weight: 600;">${item.productName}</span>
                    ${item.variantName ? `<br/><span style="font-size: 12px; color: #888;">${item.variantName}</span>` : ""}
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #555; text-align: center;">
                    x${item.quantity}
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333; text-align: right; font-weight: 600;">
                    ${formatPrice(item.price * item.quantity)}
                </td>
            </tr>`
        )
        .join("");

    const paymentMethodLabel =
        data.paymentMethod === "mpesa" ? "M-Pesa" : "Pay on Delivery";
    const deliveryMethodLabel =
        data.deliveryMethod === "delivery" ? "Home Delivery" : "Pickup";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed - ${data.orderNumber}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 40px 40px 32px; text-align:center;">
              <h1 style="margin:0; font-size:28px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">MkStore</h1>
              <p style="margin:8px 0 0; font-size:13px; color:#9ca3af; letter-spacing:2px; text-transform:uppercase;">Your Order is Confirmed</p>
            </td>
          </tr>

          <!-- Green success banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 20px 40px; text-align:center;">
              <p style="margin:0; font-size:15px; color:#ffffff; font-weight:600;">&#10003; &nbsp; Thank you, ${data.fullName}!</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 40px 0;">
              <p style="margin:0 0 24px; font-size:15px; color:#6b7280; line-height:1.6;">
                We've received your order and it's being processed. Here's a summary of what you ordered.
              </p>

              <!-- Order number badge -->
              <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:16px 20px; margin-bottom:32px;">
                <p style="margin:0; font-size:13px; color:#9ca3af; text-transform:uppercase; letter-spacing:1px;">Order Number</p>
                <p style="margin:4px 0 0; font-size:22px; font-weight:800; color:#111827; letter-spacing:-0.5px;">${data.orderNumber}</p>
              </div>

              <!-- Items table -->
              <h2 style="margin:0 0 16px; font-size:16px; font-weight:700; color:#111827;">Order Items</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="font-size:12px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; padding-bottom:8px; text-align:left; border-bottom:2px solid #f0f0f0;">Item</th>
                    <th style="font-size:12px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; padding-bottom:8px; text-align:center; border-bottom:2px solid #f0f0f0;">Qty</th>
                    <th style="font-size:12px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; padding-bottom:8px; text-align:right; border-bottom:2px solid #f0f0f0;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="font-size:14px; color:#6b7280; padding:6px 0;">Subtotal</td>
                  <td style="font-size:14px; color:#374151; text-align:right; padding:6px 0;">${formatPrice(data.subtotal)}</td>
                </tr>
                <tr>
                  <td style="font-size:14px; color:#6b7280; padding:6px 0;">${deliveryMethodLabel} Fee</td>
                  <td style="font-size:14px; color:#374151; text-align:right; padding:6px 0;">${data.deliveryFee === 0 ? "Free" : formatPrice(data.deliveryFee)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-top:2px solid #f0f0f0; padding-top:12px;"></td>
                </tr>
                <tr>
                  <td style="font-size:18px; font-weight:800; color:#111827; padding:4px 0;">Total</td>
                  <td style="font-size:18px; font-weight:800; color:#22c55e; text-align:right; padding:4px 0;">${formatPrice(data.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details grid -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-right:12px; vertical-align:top;">
                    <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:16px 20px;">
                      <p style="margin:0 0 4px; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#9ca3af; font-weight:600;">Delivery</p>
                      <p style="margin:0; font-size:14px; color:#111827; font-weight:600;">${deliveryMethodLabel}</p>
                      <p style="margin:4px 0 0; font-size:13px; color:#6b7280;">${data.deliveryLocation}</p>
                      ${data.deliveryNotes ? `<p style="margin:4px 0 0; font-size:12px; color:#9ca3af; font-style:italic;">${data.deliveryNotes}</p>` : ""}
                    </div>
                  </td>
                  <td width="50%" style="padding-left:12px; vertical-align:top;">
                    <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:16px 20px;">
                      <p style="margin:0 0 4px; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#9ca3af; font-weight:600;">Payment</p>
                      <p style="margin:0; font-size:14px; color:#111827; font-weight:600;">${paymentMethodLabel}</p>
                      ${data.mpesaReceipt ? `<p style="margin:4px 0 0; font-size:12px; color:#6b7280;">Receipt: <strong>${data.mpesaReceipt}</strong></p>` : ""}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 32px 40px; text-align:center;">
              <a href="${appUrl}/track-order"
                style="display:inline-block; background:#111827; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:10px; font-size:15px; font-weight:600; letter-spacing:-0.2px;">
                Track Your Order &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:24px 40px; text-align:center;">
              <p style="margin:0; font-size:13px; color:#9ca3af; line-height:1.6;">
                Questions? Contact us at <a href="mailto:${process.env.GMAIL_USER}" style="color:#6b7280;">${process.env.GMAIL_USER}</a><br/>
                <strong style="color:#6b7280;">MkStore</strong> - Nairobi, Kenya
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
    try {
        await transporter.sendMail({
            from: `"MkStore Orders" <${process.env.GMAIL_USER}>`,
            to: data.email,
            subject: `Order Confirmed - ${data.orderNumber}`,
            html: buildOrderEmailHtml(data),
        });

        console.log(`[Email] Order confirmation sent to ${data.email} for order ${data.orderNumber}`);
        return { success: true };
    } catch (err) {
        console.error("[Email] Failed to send order confirmation:", err);
        return { success: false, error: err };
    }
}
