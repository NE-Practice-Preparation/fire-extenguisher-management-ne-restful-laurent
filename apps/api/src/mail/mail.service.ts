import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from "@nestjs/common"
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
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name)

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    try {
      await this.createTransport().verify()
      this.logger.log(`SMTP ready via ${this.required("SMTP_HOST")} as ${this.required("SMTP_USER")}`)
    } catch (error) {
      this.logger.error(`SMTP is not working: ${this.errorMessage(error)}`)
    }
  }

  async sendTemplateEmail(input: SendTemplateEmailInput) {
    const transporter = this.createTransport()
    const from = this.read("SMTP_FROM") || this.required("SMTP_USER")

    try {
      const info = await transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        text: `${input.message}\n\n${input.actionUrl ?? ""}`.trim(),
        html: renderGenericEmailTemplate(input),
      })

      this.logger.log(`Email sent to ${input.to} (${info.messageId ?? "no-id"})`)
      return { sent: true }
    } catch (error) {
      this.logger.error(`Email to ${input.to} failed: ${this.errorMessage(error)}`)
      throw new ServiceUnavailableException(`Email was not sent: ${this.errorMessage(error)}`)
    }
  }

  private createTransport() {
    const host = this.required("SMTP_HOST")
    const user = this.required("SMTP_USER")
    const pass = this.required("SMTP_PASS").replace(/\s+/g, "")
    const port = Number(this.read("SMTP_PORT") || "587")
    const secure = this.read("SMTP_SECURE") === "true"

    const options: SMTPTransport.Options = host.includes("gmail.com")
      ? {
          service: "gmail",
          auth: { user, pass },
        }
      : {
          host,
          port,
          secure,
          auth: { user, pass },
          requireTLS: !secure,
        }

    return createTransport(options)
  }

  private read(key: string) {
    return (this.config.get<string>(key) ?? process.env[key] ?? "")
      .trim()
      .replace(/^["']|["']$/g, "")
  }

  private required(key: string) {
    const value = this.read(key)

    if (!value) {
      throw new ServiceUnavailableException(`${key} is not configured`)
    }

    return value
  }

  private errorMessage(error: unknown) {
    if (error && typeof error === "object") {
      const smtpError = error as { message?: string; response?: string; code?: string }
      return [smtpError.code, smtpError.response, smtpError.message].filter(Boolean).join(" | ")
    }
    return String(error)
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
                <p style="margin:0;font-size:12px;line-height:1.6;color:#98a2b3;">If you did not expect this email, you can ignore it.</p>
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
