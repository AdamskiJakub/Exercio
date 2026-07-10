import {
  BookingEmailContent,
  CancellationEmailContent,
  InfoEmailContent,
  PasswordResetEmailContent,
  VerificationEmailContent,
  ReviewInvitationEmailContent,
  BuildInfoDetails,
  EnterpriseLeadDetails,
  EnterpriseLeadNotificationContent,
  EnterpriseAccountActivationContent,
} from './email.types';

const escapeHtml = (text: string | undefined | null): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const buildLayout = (content: string, footer: string): string => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" style="width:100%;">
<tr>
<td align="center" style="padding:40px 20px;">
<table role="presentation" style="max-width:600px;width:100%;background:#1e293b;border-radius:12px;overflow:hidden;">
<tr>
<td style="background:linear-gradient(135deg,#f97316 0%,#dc2626 100%);padding:40px 20px;text-align:center;">
<h1 style="margin:0;color:white;font-size:32px;font-weight:bold;">💪 Trainly</h1>
</td>
</tr>
${content}
<tr>
<td style="padding:30px;background:#0f172a;text-align:center;">
<p style="margin:0;color:#64748b;font-size:12px;">${footer}</p>
<p style="margin-top:10px;color:#475569;font-size:12px;">© 2026 Trainly. All rights reserved.</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`;

export const detailsTable = (rows: string): string => `
<div style="background:#334155;border-radius:8px;padding:20px;margin:20px 0;">
<table role="presentation" style="width:100%;border-collapse:collapse;color:#cbd5e1;font-size:14px;">
${rows}
</table>
</div>
`;

export const priceRow = (label: string, price?: number): string => {
  if (price == null) return '';
  return `
<tr>
<td style="padding:8px 0;color:#94a3b8;font-size:14px;">${label}</td>
<td style="padding:8px 0;color:#f1f5f9;font-size:14px;font-weight:600;text-align:right;">${price} PLN</td>
</tr>
`;
};

export const buildInfoTemplate = (
  content: InfoEmailContent,
  details: BuildInfoDetails,
): string => {
  return buildLayout(
    `
<tr>
<td style="padding:40px 30px;">
<h2 style="color:#f1f5f9;">${content.title}</h2>
<p style="color:#cbd5e1;">${content.subtitle}</p>
${detailsTable(`
${
  details.clientName
    ? `
<tr>
  <td style="padding:6px 0;">${content.clientLabel || 'Klient'}</td>
  <td style="padding:6px 0;color:#f1f5f9;font-weight:600;text-align:right;">${escapeHtml(details.clientName)}</td>
</tr>
`
    : ''
}
${
  details.clientEmail
    ? `
<tr>
  <td style="padding:6px 0;">${content.clientEmailLabel || 'Email klienta'}</td>
  <td style="padding:6px 0;color:#f1f5f9;text-align:right;">${escapeHtml(details.clientEmail)}</td>
</tr>
`
    : ''
}
<tr><td style="padding:6px 0;">${content.dateLabel}</td><td align="right" style="color:#f1f5f9;">${escapeHtml(details.date)}</td></tr>
<tr><td style="padding:6px 0;">${content.timeLabel}</td><td align="right" style="color:#f1f5f9;">${escapeHtml(details.time)}</td></tr>
<tr><td style="padding:6px 0;">${content.durationLabel}</td><td align="right" style="color:#f1f5f9;">${details.duration} ${content.minutes}</td></tr>
${priceRow(content.priceLabel, details.price)}
`)}
${content.info ? `<p style="color:#cbd5e1;">${content.info}</p>` : ''}
</td>
</tr>
`,
    content.footer,
  );
};

export const buildVerificationTemplate = (
  code: string,
  content: VerificationEmailContent,
): string => {
  return buildLayout(
    `
<tr>
<td style="padding:40px 30px;">
<h2 style="margin:0 0 20px;color:#f1f5f9;font-size:24px;">${content.title}</h2>
<p style="margin:0 0 30px;color:#cbd5e1;font-size:16px;">${content.subtitle}</p>
<div style="background:#334155;border-radius:8px;padding:30px;text-align:center;">
<div style="font-size:48px;font-weight:bold;letter-spacing:12px;color:#f97316;font-family:'Courier New',monospace;">${escapeHtml(code)}</div>
</div>
<p style="margin-top:30px;color:#94a3b8;font-size:14px;text-align:center;">${content.expires}</p>
</td>
</tr>
`,
    content.footer,
  );
};

export const buildPasswordResetTemplate = (
  code: string,
  content: PasswordResetEmailContent,
): string => {
  return buildLayout(
    `
<tr>
<td style="padding:40px 30px;">
<h2 style="color:#f1f5f9;">${content.title}</h2>
<p style="color:#cbd5e1;">${content.subtitle}</p>
<p style="color:#cbd5e1;">${content.codeLabel}</p>
<div style="background:#334155;border-radius:8px;padding:30px;text-align:center;">
<div style="font-size:48px;font-weight:bold;letter-spacing:12px;color:#f97316;font-family:'Courier New',monospace;">${escapeHtml(code)}</div>
</div>
<p style="margin-top:30px;color:#94a3b8;font-size:14px;text-align:center;">${content.expires}</p>
</td>
</tr>
`,
    content.footer,
  );
};

export const buildBookingTemplate = (
  content: BookingEmailContent,
  details: {
    date: string;
    time: string;
    duration: number;
    price?: number;
    instructorName?: string;
  },
  cancelLink?: string,
  locale: string = 'pl',
): string => {
  const hasDashboard = !!content.dashboardUrl;
  const hasCancel = !!cancelLink && !!content.cancelButton;

  let actionHtml = '';

  if (hasDashboard && hasCancel) {
    // Both buttons: blue dashboard + red cancel
    actionHtml = `
      <div style="margin-top:20px;">
        <p style="color:#cbd5e1;font-size:14px;">${content.cancelInfo}</p>
        <table role="presentation" style="margin-top:10px;">
          <tr>
            <td style="padding-right:12px;">
              <a href="${content.dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">${content.cancelButton}</a>
            </td>
            <td>
              <a href="${encodeURI(cancelLink!)}" style="display:inline-block;background:#dc2626;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">${locale === 'pl' ? 'Anuluj sesję' : 'Cancel Session'}</a>
            </td>
          </tr>
        </table>
      </div>`;
  } else if (hasDashboard) {
    actionHtml = `
      <p style="color:#cbd5e1;margin-top:20px;">${content.cancelInfo}</p>
      <a href="${content.dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;margin-top:10px;">${content.cancelButton}</a>`;
  } else if (hasCancel) {
    actionHtml = `
      <p style="color:#cbd5e1;margin-top:20px;">${content.cancelInfo}</p>
      <a href="${encodeURI(cancelLink!)}" style="display:inline-block;background:#dc2626;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;margin-top:10px;">${content.cancelButton}</a>`;
  } else {
    actionHtml = `<p style="color:#cbd5e1;margin-top:20px;">${content.cancelInfo}</p>`;
  }

  const instructorRow = details.instructorName
    ? `<tr><td style="padding:6px 0;">Instruktor / Instructor</td><td align="right" style="color:#f1f5f9;font-weight:600;">${escapeHtml(details.instructorName)}</td></tr>`
    : '';

  return buildLayout(
    `
<tr>
<td style="padding:40px 30px;">
<h2 style="color:#f1f5f9;">${content.title}</h2>
<p style="color:#cbd5e1;">${content.subtitle}</p>
${detailsTable(`
<tr><td style="padding:6px 0;">${content.dateLabel}</td><td align="right" style="color:#f1f5f9;">${escapeHtml(details.date)}</td></tr>
<tr><td style="padding:6px 0;">${content.timeLabel}</td><td align="right" style="color:#f1f5f9;">${escapeHtml(details.time)}</td></tr>
<tr><td style="padding:6px 0;">${content.durationLabel}</td><td align="right" style="color:#f1f5f9;">${details.duration} ${content.minutes}</td></tr>
${priceRow(content.priceLabel, details.price)}
${instructorRow}
`)}
${actionHtml}
</td>
</tr>
`,
    content.footer,
  );
};

export const buildContactEmailTemplate = (data: {
  name: string;
  email: string;
  category: string;
  message: string;
}): string => {
  const categoryLabels: Record<string, string> = {
    client: 'Klient / Client',
    trainer: 'Trener / Trainer',
    partner: 'Partnerstwo / Partnership',
    other: 'Inne / Other',
  };
  const categoryLabel = categoryLabels[data.category] || data.category;

  return buildLayout(
    `
<tr>
<td style="padding:40px 30px;">
<div style="background:#334155;border-radius:8px;padding:20px;margin-bottom:20px;">
<table role="presentation" style="width:100%;border-collapse:collapse;color:#cbd5e1;font-size:14px;">
<tr>
  <td style="padding:8px 0;color:#94a3b8;width:120px;">Imię / Name</td>
  <td style="padding:8px 0;color:#f1f5f9;font-weight:600;">${escapeHtml(data.name)}</td>
</tr>
<tr>
  <td style="padding:8px 0;color:#94a3b8;">Email</td>
  <td style="padding:8px 0;color:#f1f5f9;"><a href="mailto:${escapeHtml(data.email)}" style="color:#f97316;">${escapeHtml(data.email)}</a></td>
</tr>
<tr>
  <td style="padding:8px 0;color:#94a3b8;">Kategoria</td>
  <td style="padding:8px 0;color:#f1f5f9;">${escapeHtml(categoryLabel)}</td>
</tr>
</table>
</div>
<div style="background:#334155;border-radius:8px;padding:20px;">
<h3 style="margin:0 0 12px;color:#f1f5f9;font-size:16px;">Wiadomość / Message</h3>
<p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
</div>
</td>
</tr>
`,
    'Otrzymano z formularza kontaktowego Trainly',
  );
};

export const buildCancellationTemplate = (
  content: CancellationEmailContent,
  details: { date: string; time: string; reason?: string },
): string => {
  return buildLayout(
    `
<tr>
<td style="padding:40px 30px;">
<h2 style="color:#f1f5f9;">${content.title}</h2>
<p style="color:#cbd5e1;">${content.subtitle}</p>
${detailsTable(`
<tr><td style="padding:6px 0;">${content.dateLabel}</td><td align="right" style="color:#f1f5f9;">${escapeHtml(details.date)}</td></tr>
<tr><td style="padding:6px 0;">${content.timeLabel}</td><td align="right" style="color:#f1f5f9;">${escapeHtml(details.time)}</td></tr>
${details.reason ? `<tr><td style="padding:6px 0;">${content.reasonLabel}</td><td align="right" style="color:#f1f5f9;">${escapeHtml(details.reason)}</td></tr>` : ''}
`)}
</td>
</tr>
`,
    content.footer,
  );
};

/**
 * Review invitation template - used for guest users (no account).
 * Registered users see review prompts in their dashboard instead.
 */
export const buildReviewInvitationTemplate = (
  content: ReviewInvitationEmailContent,
  reviewUrl: string,
): string => {
  return buildLayout(
    `
<tr>
<td style="padding:40px 30px;">
<h2 style="color:#f1f5f9;">${content.title}</h2>
<p style="color:#cbd5e1;">${content.subtitle}</p>
<div style="background:#334155;border-radius:8px;padding:20px;margin:20px 0;">
<table role="presentation" style="width:100%;border-collapse:collapse;color:#cbd5e1;font-size:14px;">
<tr><td style="padding:6px 0;color:#94a3b8;">Instruktor</td><td align="right" style="color:#f1f5f9;font-weight:600;">${escapeHtml(content.instructorName)}</td></tr>
</table>
</div>
<p style="color:#cbd5e1;font-size:14px;margin-bottom:20px;">${content.reviewButton}</p>
<a href="${reviewUrl}" style="display:inline-block;background:linear-gradient(135deg,#f97316 0%,#dc2626 100%);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">${content.reviewButton}</a>
</td>
</tr>
`,
    content.footer,
  );
};

export const buildEnterpriseLeadNotificationTemplate = (
  content: EnterpriseLeadNotificationContent,
  details: EnterpriseLeadDetails,
): string => {
  const phoneRow = details.phone
    ? `<tr><td style="padding:6px 0;color:#94a3b8;">${content.phoneLabel}</td><td align="right" style="color:#f1f5f9;">${escapeHtml(details.phone)}</td></tr>`
    : '';
  const websiteRow = details.website
    ? `<tr><td style="padding:6px 0;color:#94a3b8;">${content.websiteLabel}</td><td align="right" style="color:#f1f5f9;">${escapeHtml(details.website)}</td></tr>`
    : '';
  const cityRow = details.city
    ? `<tr><td style="padding:6px 0;color:#94a3b8;">${content.cityLabel}</td><td align="right" style="color:#f1f5f9;">${escapeHtml(details.city)}</td></tr>`
    : '';
  const messageRow = details.message
    ? `<tr><td style="padding:6px 0;color:#94a3b8;" colspan="2">${content.messageLabel}</td></tr><tr><td style="padding:6px 0;color:#cbd5e1;font-size:14px;line-height:1.6;" colspan="2">${escapeHtml(details.message)}</td></tr>`
    : '';

  return buildLayout(
    `
<tr>
<td style="padding:40px 30px;">
<h2 style="color:#f1f5f9;">${content.title}</h2>
<p style="color:#cbd5e1;">${content.subtitle}</p>
${detailsTable(`
<tr><td style="padding:6px 0;color:#94a3b8;">${content.companyLabel}</td><td align="right" style="color:#f1f5f9;font-weight:600;">${escapeHtml(details.companyName)}</td></tr>
<tr><td style="padding:6px 0;color:#94a3b8;">${content.emailLabel}</td><td align="right" style="color:#f1f5f9;"><a href="mailto:${escapeHtml(details.email)}" style="color:#f97316;">${escapeHtml(details.email)}</a></td></tr>
${phoneRow}
${websiteRow}
${cityRow}
${messageRow}
<tr><td style="padding:6px 0;color:#94a3b8;">${content.leadIdLabel}</td><td align="right" style="color:#10b981;font-family:monospace;font-weight:600;">${escapeHtml(details.id)}</td></tr>
`)}
<div style="margin-top:24px;padding:16px;background:#1e293b;border-radius:8px;border:1px solid #334155;">
<p style="margin:0;color:#cbd5e1;font-size:14px;">${content.approveHint} <code style="display:inline-block;margin-top:8px;padding:8px 12px;background:#0f172a;border-radius:4px;color:#10b981;font-family:monospace;font-size:13px;">npm run enterprise:approve ${escapeHtml(details.id)}</code></p>
</div>
</td>
</tr>
`,
    content.footer,
  );
};

export const buildEnterpriseAccountActivationTemplate = (
  content: EnterpriseAccountActivationContent,
  activationUrl: string,
): string => {
  return buildLayout(
    `
<tr>
<td style="padding:40px 30px;">
<h2 style="color:#f1f5f9;">${content.title}</h2>
<p style="color:#cbd5e1;font-size:16px;line-height:1.6;">${content.subtitle}</p>
<div style="text-align:center;margin-top:30px;">
<a href="${activationUrl}" style="display:inline-block;background:linear-gradient(135deg,#10b981 0%,#0d9488 100%);color:white;text-decoration:none;padding:16px 36px;border-radius:8px;font-weight:600;font-size:16px;">${content.activateButton}</a>
</div>
</td>
</tr>
`,
    content.footer,
  );
};
