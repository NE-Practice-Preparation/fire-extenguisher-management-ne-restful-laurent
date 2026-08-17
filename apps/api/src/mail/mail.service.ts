import { Injectable, ServiceUnavailableException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { createTransport } from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"

type SendTemplateEmailInput = {
  to: string
  firstName: string
  subject: string
  previewText: string
  message: string
  actionLabel?: string
  actionUrl?: string
}

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) {}

  async sendTemplateEmail(input: SendTemplateEmailInput) {
    const transportOptions: SMTPTransport.Options & { family?: number } = {
      host: this.required("SMTP_HOST"),
      port: Number(this.read("SMTP_PORT") || "587"),
      secure: this.read("SMTP_SECURE") === "true",
      family: Number(this.read("SMTP_FAMILY") || "4"),
      auth: {
        user: this.required("SMTP_USER"),
        pass: this.required("SMTP_PASS").replace(/\s+/g, ""),
      },
    }

    const transporter = createTransport(transportOptions)

    const from = this.read("SMTP_FROM") || this.required("SMTP_USER")

    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: `${input.message}\n\n${input.actionUrl ?? ""}`.trim(),
      html: renderGenericEmailTemplate(input),
    })

    return { sent: true }
  }

  private read(key: string) {
    return this.config.get<string>(key)?.trim().replace(/^["']|["']$/g, "") ?? ""
  }

  private required(key: string) {
    const value = this.read(key)

    if (!value) {
      throw new ServiceUnavailableException(`${key} is not configured`)
    }

    return value
  }
}

function renderGenericEmailTemplate({
  firstName,
  previewText,
  message,
  actionLabel,
  actionUrl,
}: SendTemplateEmailInput) {
  const safeFirstName = escapeHtml(firstName)
  const safePreviewText = escapeHtml(previewText)
  const safeMessage = escapeHtml(message)
  const safeActionLabel = actionLabel ? escapeHtml(actionLabel) : ""
  const safeActionUrl = actionUrl ? escapeHtml(actionUrl) : ""

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safePreviewText}</title>
  </head>
  <body style="margin:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#101828;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreviewText}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;overflow:hidden;border:1px solid #e4e7ec;border-radius:16px;background:#ffffff;">
            <tr>
              <td style="padding:28px 28px 16px;border-bottom:1px solid #eef2f6;">
                <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#BE123C;">Fire Extinguisher Management</div>
                <h1 style="margin:12px 0 0;font-size:24px;line-height:1.25;color:#101828;">Hello ${safeFirstName},</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 8px;">
                <p style="margin:0;font-size:15px;line-height:1.7;color:#475467;">${safeMessage}</p>
              </td>
            </tr>
            ${
              safeActionLabel && safeActionUrl
                ? `<tr>
              <td style="padding:20px 28px 8px;">
                <a href="${safeActionUrl}" style="display:inline-block;border-radius:10px;background:#BE123C;padding:12px 18px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">${safeActionLabel}</a>
              </td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding:24px 28px 28px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#98a2b3;">This is a generic template message. Configure the copy and sender details for your project before production use.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
