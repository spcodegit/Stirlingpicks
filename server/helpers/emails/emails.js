const nodemailer = require("nodemailer")
const smtpTransport = require("nodemailer-smtp-transport")
const {CONFIG} = require("../../config/config");
const {
    userEmailVerificationTemplate,
    userForgotPasswordTemplate,
    orderPaymentStatusTemplate,
    betPlacedTemplate,
    betResultTemplate,
    supportRequestNotificationTemplate,
    payoutRequestNotificationTemplate,
} = require("./templates");
const path = require("path");

const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

function getAdminRecipients() {
    if (!CONFIG.ADMIN_EMAIL) return [];
    return String(CONFIG.ADMIN_EMAIL)
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
}

/** Remove admin-only fields before rendering user-facing templates. */
function stripAdminFields(payload) {
    if (!payload || typeof payload !== "object") return payload;
    const { adminContext, ...rest } = payload;
    return rest;
}

function enrichHtmlForAdmin(html, adminContext = {}) {
    const lines = [
        "<strong>Admin notification</strong>",
        adminContext.userName && `Name: ${escapeHtml(adminContext.userName)}`,
        adminContext.userEmail && `Email: ${escapeHtml(adminContext.userEmail)}`,
        adminContext.userId && `User ID: ${escapeHtml(String(adminContext.userId))}`,
    ].filter(Boolean);
    const banner = `<div style="background:#fff3cd;padding:14px 18px;margin:0;font-size:14px;border-bottom:4px solid #ffc107;line-height:1.5;color:#333;">${lines.join("<br/>")}</div>`;
    return html.replace(/<body[^>]*>/i, (m) => `${m}${banner}`);
}

function sendAdminCopies(html, subject, adminContext) {
    const recipients = getAdminRecipients();
    if (!recipients.length) return;

    const htmlAdmin = enrichHtmlForAdmin(html, adminContext);
    const mailOptions = {
        from: CONFIG.MAIL_USERNAME,
        to: recipients.join(", "),
        subject: `[Admin] ${subject}`,
        html: htmlAdmin,
        attachments: [logoAttachment],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log("Admin email sent: " + info.response);
    });
}

const transporter = nodemailer.createTransport(
    smtpTransport({
        host: CONFIG.MAIL_HOST,
        port: CONFIG.MAIL_PORT,
        secure: CONFIG.MAIL_SERVICE === CONFIG.MAIL_SECURE,
        auth: {
            user: CONFIG.MAIL_USERNAME,
            pass: CONFIG.MAIL_PASSWORD,
        },
    }),
)

const logoAttachment = {
    filename: 'logo.png',
    path: path.join(__dirname, '../../../client/public/images/logo.png'),
    cid: 'logo' 
};

// send user verification mail
module.exports.sendUserVerificationEmail = function (email, code) {
    const mailOptions = {
        from: `Verify Your Email - <${CONFIG.MAIL_USERNAME}>`,
        to: email,
        subject: `Verify Your Email - ${CONFIG.COMPANY_NAME}`,
        html: userEmailVerificationTemplate(code),
        attachments: [logoAttachment]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log("Email sent: " + info.response);
    });
};

// send forgot password mail
module.exports.sendForgotPasswordEmail = function (email, password) {
    const mailOptions = {
        from: `Forgot Password - <${CONFIG.MAIL_USERNAME}>`,
        to: email,
        subject: `Forgot Password - ${CONFIG.COMPANY_NAME}`,
        html: userForgotPasswordTemplate(password),
        attachments: [logoAttachment]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log("Email sent: " + info.response);
    });
};

// send order payment status mail (confirmed/finished)
module.exports.sendOrderPaymentStatusEmail = function (email, payload) {
    const data = stripAdminFields(payload);
    const subject = `Payment ${String(data.status || "").toUpperCase()} - ${CONFIG.COMPANY_NAME}`;
    const html = orderPaymentStatusTemplate(data);

    const mailOptions = {
        from: `Payment ${String(data.status || "").toUpperCase()} - <${CONFIG.MAIL_USERNAME}>`,
        to: email,
        subject,
        html,
        attachments: [logoAttachment],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log("Email sent: " + info.response);
    });

    sendAdminCopies(html, subject, payload?.adminContext);
};

// send bet placed mail
module.exports.sendBetPlacedEmail = function (email, payload) {
    const data = stripAdminFields(payload);
    const subject = `Bet Placed - ${CONFIG.COMPANY_NAME}`;
    const html = betPlacedTemplate(data);

    const mailOptions = {
        from: `Bet Placed - <${CONFIG.MAIL_USERNAME}>`,
        to: email,
        subject,
        html,
        attachments: [logoAttachment],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log("Email sent: " + info.response);
    });

    sendAdminCopies(html, subject, payload?.adminContext);
};

// send bet result mail (win/lose)
module.exports.sendBetResultEmail = function (email, payload) {
    const data = stripAdminFields(payload);
    const subject = `Bet ${String(data.status || "").toUpperCase()} - ${CONFIG.COMPANY_NAME}`;
    const html = betResultTemplate(data);

    const mailOptions = {
        from: `Bet ${String(data.status || "").toUpperCase()} - <${CONFIG.MAIL_USERNAME}>`,
        to: email,
        subject,
        html,
        attachments: [logoAttachment],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log("Email sent: " + info.response);
    });

    sendAdminCopies(html, subject, payload?.adminContext);
};

module.exports.sendSupportRequestEmail = function (email, payload) {
    const data = stripAdminFields(payload);
    const { event, status } = data;
    const statusPart = status ? String(status).toUpperCase() : "";
    const subject =
        event === "created"
            ? `Support request received - ${CONFIG.COMPANY_NAME}`
            : `Support request ${statusPart} - ${CONFIG.COMPANY_NAME}`;

    const html = supportRequestNotificationTemplate(data);

    const mailOptions = {
        from: event === "created"
            ? `Support request received - <${CONFIG.MAIL_USERNAME}>`
            : `Support request ${statusPart} - <${CONFIG.MAIL_USERNAME}>`,
        to: email,
        subject,
        html,
        attachments: [logoAttachment],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log("Email sent: " + info.response);
    });

    sendAdminCopies(html, subject, payload?.adminContext);
};

module.exports.sendPayoutRequestEmail = function (email, payload) {
    const data = stripAdminFields(payload);
    const { event, status } = data;
    const statusPart = status ? String(status).toUpperCase() : "";
    const subject =
        event === "created"
            ? `Payout request received - ${CONFIG.COMPANY_NAME}`
            : `Payout request ${statusPart} - ${CONFIG.COMPANY_NAME}`;

    const html = payoutRequestNotificationTemplate(data);

    const mailOptions = {
        from: event === "created"
            ? `Payout request received - <${CONFIG.MAIL_USERNAME}>`
            : `Payout request ${statusPart} - <${CONFIG.MAIL_USERNAME}>`,
        to: email,
        subject,
        html,
        attachments: [logoAttachment],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log("Email sent: " + info.response);
    });

    sendAdminCopies(html, subject, payload?.adminContext);
};
