const {CONFIG} = require("../../config/config");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

module.exports.userEmailVerificationTemplate = (code) => {
  return `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>
<body style="background:#f4f4f4;margin:0;padding:0;font-family:Arial, sans-serif;">

  <!-- Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.05);">

          <!-- HEADER / BANNER -->
          <tr>
            <td style="background:#0d6efd;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dh5pf5on1/image/upload/v1772492968/temp/y7wsqa8x8jd9w2mjfbk4.png" alt="Logo" style="width:140px;margin-bottom:10px;" />
              <h2 style="color:#ffffff;margin:0;font-weight:600;">Welcome to ${CONFIG.COMPANY_NAME}</h2>
            </td>
          </tr>

          <!-- MESSAGE BODY -->
          <tr>
            <td style="padding:30px 40px;text-align:left;color:#333;font-size:16px;line-height:1.5;">
              <p>Hi there,</p>
              <p>Thank you for registering with <strong>${CONFIG.COMPANY_NAME}</strong>. To complete your registration and secure your account, please verify your email address by clicking the button below.</p>
            </td>
          </tr>

          <!-- BUTTON -->
          <tr>
            <td align="center" style="padding:20px;">
              <a href="${CONFIG.CLIENT_URL}/?code=${code}"
                 style="background:#0d6efd;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:16px;display:inline-block;">
                Verify Email
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:25px 40px;text-align:left;color:#777;font-size:14px;line-height:1.5;">
              <p>If you did not register for a ${CONFIG.COMPANY_NAME} account, you may safely ignore this email.</p>
              <p style="margin-top:20px;">Best Regards,<br><strong>${CONFIG.COMPANY_NAME} Team</strong></p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
</body>
</html>
`
}

module.exports.userForgotPasswordTemplate = (newPassword) => {
  return `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset</title>
</head>
<body style="background:#f4f4f4;margin:0;padding:0;font-family:Arial, sans-serif;">

  <!-- Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.05);">

          <!-- HEADER / BANNER -->
          <tr>
            <td style="background:#0d6efd;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dh5pf5on1/image/upload/v1772492968/temp/y7wsqa8x8jd9w2mjfbk4.png" alt="Logo" style="width:140px;margin-bottom:10px;" />
              <h2 style="color:#ffffff;margin:0;font-weight:600;">${CONFIG.COMPANY_NAME}</h2>
            </td>
          </tr>

          <!-- MESSAGE BODY -->
          <tr>
            <td style="padding:30px 40px;text-align:left;color:#333;font-size:16px;line-height:1.5;">
              <p>Hi there,</p>
              <p>You requested to reset your password for your <strong>${CONFIG.COMPANY_NAME}</strong> account.</p>
              <p>Your password has now been successfully updated. Below is your new password:</p>

              <div style="margin:20px 0;padding:12px 18px;background:#f1f3ff;border-left:4px solid #0d6efd;font-size:18px;color:#0d6efd;font-weight:bold;">
                ${newPassword}
              </div>

              <p>We highly recommend logging into your account and changing this password to something more secure.</p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:25px 40px;text-align:left;color:#777;font-size:14px;line-height:1.5;">
              <p>If you did not request this password change, please contact our support team immediately.</p>
              <p style="margin-top:20px;">Best Regards,<br><strong>${CONFIG.COMPANY_NAME} Team</strong></p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
</body>
</html>
`;
};

module.exports.orderPaymentStatusTemplate = ({ name, orderId, status, amount, accountType }) => {
  const statusLabel = String(status || '').toUpperCase();
  const safeName = name || 'there';
  const safeOrderId = orderId || '';
  const safeAccountType = accountType || '';
  const safeAmount = typeof amount === 'number' ? amount : (amount ? Number(amount) : null);

  const headline =
    status === 'finished'
      ? 'Payment Completed'
      : status === 'confirmed'
        ? 'Payment Confirmed'
        : 'Payment Update';

  const message =
    status === 'finished'
      ? `Your payment has been completed successfully. Your account will be updated shortly.`
      : status === 'confirmed'
        ? `Your payment has been confirmed and is being processed.`
        : `Your payment status has been updated.`;

  return `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Status</title>
</head>
<body style="background:#f4f4f4;margin:0;padding:0;font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:#0d6efd;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dh5pf5on1/image/upload/v1772492968/temp/y7wsqa8x8jd9w2mjfbk4.png" alt="Logo" style="width:140px;margin-bottom:10px;" />
              <h2 style="color:#ffffff;margin:0;font-weight:600;">${headline} - ${CONFIG.COMPANY_NAME}</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px;text-align:left;color:#333;font-size:16px;line-height:1.5;">
              <p>Hi ${safeName},</p>
              <p>${message}</p>
              <div style="margin:20px 0;padding:14px 18px;background:#f1f3ff;border-left:4px solid #0d6efd;">
                <p style="margin:0;font-size:14px;color:#333;"><strong>Status:</strong> ${statusLabel}</p>
                ${safeOrderId ? `<p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Order ID:</strong> ${safeOrderId}</p>` : ``}
                ${safeAccountType ? `<p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Account type:</strong> ${safeAccountType}</p>` : ``}
                ${Number.isFinite(safeAmount) ? `<p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Amount:</strong> $${safeAmount}</p>` : ``}
              </div>
              <p style="margin-top:18px;">If you have any questions, reply to this email and we’ll help.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:25px 40px;text-align:left;color:#777;font-size:14px;line-height:1.5;">
              <p style="margin-top:20px;">Best Regards,<br><strong>${CONFIG.COMPANY_NAME} Team</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

module.exports.betPlacedTemplate = ({ name, sport, bet, placedBet, price }) => {
  const safeName = name || 'there';
  const safeSport = sport || 'your selected sport';
  const safeBet = bet || 'your selected bet';
  const safePlacedBetLabel = placedBet?.label || placedBet?.name || '';
  const safePlacedBetValue = placedBet?.value || '';
  const safePrice = typeof price === 'number' ? price : (price ? Number(price) : null);

  return `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bet Placed</title>
</head>
<body style="background:#f4f4f4;margin:0;padding:0;font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:#0d6efd;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dh5pf5on1/image/upload/v1772492968/temp/y7wsqa8x8jd9w2mjfbk4.png" alt="Logo" style="width:140px;margin-bottom:10px;" />
              <h2 style="color:#ffffff;margin:0;font-weight:600;">Bet Placed - ${CONFIG.COMPANY_NAME}</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px;text-align:left;color:#333;font-size:16px;line-height:1.5;">
              <p>Hi ${safeName},</p>
              <p>Your bet has been placed successfully. Here are the details:</p>
              <div style="margin:20px 0;padding:14px 18px;background:#f1f3ff;border-left:4px solid #0d6efd;">
                <p style="margin:0;font-size:14px;color:#333;"><strong>Sport:</strong> ${safeSport}</p>
                <p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Bet:</strong> ${safeBet}</p>
                ${safePlacedBetLabel || safePlacedBetValue ? `<p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Selection:</strong> ${safePlacedBetLabel || safePlacedBetValue}</p>` : ``}
                ${Number.isFinite(safePrice) ? `<p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Stake:</strong> $${safePrice}</p>` : ``}
              </div>
              <p style="margin-top:18px;">We’ll notify you once this bet is settled.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:25px 40px;text-align:left;color:#777;font-size:14px;line-height:1.5;">
              <p style="margin-top:20px;">Best Regards,<br><strong>${CONFIG.COMPANY_NAME} Team</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

module.exports.betResultTemplate = ({ name, sport, bet, placedBet, price, status, pnl }) => {
  const safeName = name || 'there';
  const safeSport = sport || 'your selected sport';
  const safeBet = bet || 'your selected bet';
  const safePlacedBetLabel = placedBet?.label || placedBet?.name || '';
  const safePlacedBetValue = placedBet?.value || '';
  const safePrice = typeof price === 'number' ? price : (price ? Number(price) : null);
  const safePnl = typeof pnl === 'number' ? pnl : (pnl ? Number(pnl) : null);

  const statusLabel = String(status || '').toUpperCase();
  const isWin = statusLabel === 'WIN';

  const headline = isWin ? 'Bet Won' : 'Bet Lost';
  const message = isWin
    ? 'Congratulations! Your bet has won. Here is a summary of the result:'
    : 'Your bet has been settled. Here is a summary of the result:';

  return `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bet Result</title>
</head>
<body style="background:#f4f4f4;margin:0;padding:0;font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:#0d6efd;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dh5pf5on1/image/upload/v1772492968/temp/y7wsqa8x8jd9w2mjfbk4.png" alt="Logo" style="width:140px;margin-bottom:10px;" />
              <h2 style="color:#ffffff;margin:0;font-weight:600;">${headline} - ${CONFIG.COMPANY_NAME}</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px;text-align:left;color:#333;font-size:16px;line-height:1.5;">
              <p>Hi ${safeName},</p>
              <p>${message}</p>
              <div style="margin:20px 0;padding:14px 18px;background:#f1f3ff;border-left:4px solid #0d6efd;">
                <p style="margin:0;font-size:14px;color:#333;"><strong>Status:</strong> ${statusLabel}</p>
                <p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Sport:</strong> ${safeSport}</p>
                <p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Bet:</strong> ${safeBet}</p>
                ${safePlacedBetLabel || safePlacedBetValue ? `<p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Selection:</strong> ${safePlacedBetLabel || safePlacedBetValue}</p>` : ``}
                ${Number.isFinite(safePrice) ? `<p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Stake:</strong> $${safePrice}</p>` : ``}
                ${Number.isFinite(safePnl) ? `<p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>PnL:</strong> $${safePnl}</p>` : ``}
              </div>
              <p style="margin-top:18px;">If you have any questions about this result, just reply to this email.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:25px 40px;text-align:left;color:#777;font-size:14px;line-height:1.5;">
              <p style="margin-top:20px;">Best Regards,<br><strong>${CONFIG.COMPANY_NAME} Team</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

module.exports.supportRequestNotificationTemplate = ({
  name,
  supportId,
  messagePreview,
  status,
  event,
  previousStatus,
}) => {
  const safeName = name || "there";
  const safeId = supportId ? String(supportId) : "";
  const statusLabel = String(status || "").toUpperCase();
  const prevLabel = previousStatus ? String(previousStatus).toUpperCase() : "";

  const isCreated = event === "created";
  const headline = isCreated
    ? "Support request received"
    : "Support request updated";
  const lead = isCreated
    ? `We have received your support request and will get back to you soon.`
    : `Your support request status has been updated.`;

  const statusLine = isCreated
    ? `<p style="margin:0;font-size:14px;color:#333;"><strong>Current status:</strong> ${statusLabel}</p>`
    : `<p style="margin:0;font-size:14px;color:#333;"><strong>Previous status:</strong> ${prevLabel}</p>
       <p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>New status:</strong> ${statusLabel}</p>`;

  const previewBlock =
    messagePreview && isCreated
      ? `<p style="margin:12px 0 0 0;font-size:14px;color:#555;"><strong>Your message:</strong></p>
         <p style="margin:6px 0 0 0;font-size:14px;color:#333;line-height:1.5;">${escapeHtml(messagePreview)}</p>`
      : "";

  return `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Support</title>
</head>
<body style="background:#f4f4f4;margin:0;padding:0;font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:#0d6efd;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dh5pf5on1/image/upload/v1772492968/temp/y7wsqa8x8jd9w2mjfbk4.png" alt="Logo" style="width:140px;margin-bottom:10px;" />
              <h2 style="color:#ffffff;margin:0;font-weight:600;">${headline} - ${CONFIG.COMPANY_NAME}</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px;text-align:left;color:#333;font-size:16px;line-height:1.5;">
              <p>Hi ${escapeHtml(safeName)},</p>
              <p>${lead}</p>
              <div style="margin:20px 0;padding:14px 18px;background:#f1f3ff;border-left:4px solid #0d6efd;">
                ${safeId ? `<p style="margin:0;font-size:14px;color:#333;"><strong>Request ID:</strong> ${escapeHtml(safeId)}</p>` : ``}
                <div style="margin-top:${safeId ? "12px" : "0"};">
                  ${statusLine}
                </div>
              </div>
              ${previewBlock}
              <p style="margin-top:18px;">If you have any questions, reply to this email and we’ll help.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:25px 40px;text-align:left;color:#777;font-size:14px;line-height:1.5;">
              <p style="margin-top:20px;">Best Regards,<br><strong>${CONFIG.COMPANY_NAME} Team</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

module.exports.payoutRequestNotificationTemplate = ({
  name,
  payoutId,
  amount,
  accountType,
  type,
  status,
  event,
  previousStatus,
}) => {
  const safeName = name || "there";
  const safeId = payoutId ? String(payoutId) : "";
  const statusLabel = String(status || "").toUpperCase();
  const prevLabel = previousStatus ? String(previousStatus).toUpperCase() : "";
  const safeAmount = typeof amount === "number" ? amount : amount ? Number(amount) : null;
  const safeAccountType = accountType || "";
  const safeType = type || "";

  const isCreated = event === "created";
  const headline = isCreated
    ? "Payout request received"
    : "Payout request updated";
  const lead = isCreated
    ? `We have received your payout request. We will process it according to our timelines.`
    : `Your payout request status has been updated.`;

  const statusLine = isCreated
    ? `<p style="margin:0;font-size:14px;color:#333;"><strong>Current status:</strong> ${statusLabel}</p>`
    : `<p style="margin:0;font-size:14px;color:#333;"><strong>Previous status:</strong> ${prevLabel}</p>
       <p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>New status:</strong> ${statusLabel}</p>`;

  return `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payout</title>
</head>
<body style="background:#f4f4f4;margin:0;padding:0;font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:#0d6efd;padding:20px;text-align:center;">
              <img src="https://res.cloudinary.com/dh5pf5on1/image/upload/v1772492968/temp/y7wsqa8x8jd9w2mjfbk4.png" alt="Logo" style="width:140px;margin-bottom:10px;" />
              <h2 style="color:#ffffff;margin:0;font-weight:600;">${headline} - ${CONFIG.COMPANY_NAME}</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px;text-align:left;color:#333;font-size:16px;line-height:1.5;">
              <p>Hi ${escapeHtml(safeName)},</p>
              <p>${lead}</p>
              <div style="margin:20px 0;padding:14px 18px;background:#f1f3ff;border-left:4px solid #0d6efd;">
                ${safeId ? `<p style="margin:0;font-size:14px;color:#333;"><strong>Request ID:</strong> ${escapeHtml(safeId)}</p>` : ``}
                ${Number.isFinite(safeAmount) ? `<p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Amount:</strong> $${safeAmount}</p>` : ``}
                ${safeAccountType ? `<p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Account type:</strong> ${escapeHtml(safeAccountType)}</p>` : ``}
                ${safeType ? `<p style="margin:8px 0 0 0;font-size:14px;color:#333;"><strong>Method:</strong> ${escapeHtml(safeType)}</p>` : ``}
                <div style="margin-top:12px;">
                  ${statusLine}
                </div>
              </div>
              <p style="margin-top:18px;">If you have any questions, reply to this email and we’ll help.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:25px 40px;text-align:left;color:#777;font-size:14px;line-height:1.5;">
              <p style="margin-top:20px;">Best Regards,<br><strong>${CONFIG.COMPANY_NAME} Team</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};
