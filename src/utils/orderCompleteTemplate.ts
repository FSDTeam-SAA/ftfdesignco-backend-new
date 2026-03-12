import config from '../config'
import { companyName } from '../lib/globalType'

interface OrderCompleteParams {
  firstName: string
  region: string
}

const orderCompleteTemplate = ({
  firstName,
  region,
}: OrderCompleteParams): string => {
  const logoUrl = `${config.backendUrl}/image.png`
  const year = new Date().getFullYear()

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Complete</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.07);">

          <!-- ───── HEADER / LOGO ───── -->
          <tr>
            <td align="center" style="background-color:#ffffff;padding:36px 32px 24px;">
              <img
                src="${logoUrl}"
                alt="${companyName} Logo"
                width="140"
                style="display:block;max-width:140px;height:auto;border:0;"
              />
            </td>
          </tr>

          <!-- ───── DIVIDER ───── -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- ───── BODY ───── -->
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 16px;font-size:17px;color:#374151;line-height:1.6;">
                Hi <strong>${firstName}</strong>,
              </p>

              <p style="margin:0 0 28px;font-size:17px;color:#374151;line-height:1.6;">
                Great news! Your order is now <strong style="color:#16a34a;">shipped / complete</strong> and is ready for pickup. 🎉
              </p>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">

                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #bbf7d0;">
                          <span style="font-size:13px;color:#6b7280;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px;">Your Location</span>
                          <span style="font-size:16px;font-weight:600;color:#111827;">${region}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;">
                          <span style="font-size:13px;color:#6b7280;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px;">Pick-Up Regional Office</span>
                          <span style="font-size:16px;font-weight:600;color:#111827;">${region} Regional Office</span>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:15px;color:#6b7280;line-height:1.6;">
                Please visit your regional office to collect your order. If you have any questions, feel free to reply to this email.
              </p>

            </td>
          </tr>

          <!-- ───── FOOTER ───── -->
          <tr>
            <td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#9ca3af;">
                &copy; ${year} <strong>${companyName}</strong>. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}

export default orderCompleteTemplate
