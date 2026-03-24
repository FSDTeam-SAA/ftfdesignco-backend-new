import config from '../config'
import { companyName } from '../lib/globalType'

interface CustomerOrderConfirmationParams {
  firstName: string
  location: string
}

const customerOrderConfirmationTemplate = ({
  firstName,
  location,
}: CustomerOrderConfirmationParams): string => {
  const logoUrl = `${config.backendUrl}/image.png`
  const year = new Date().getFullYear()

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.07);">

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

          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 16px;font-size:17px;color:#374151;line-height:1.6;">
                Hi <strong>${firstName}</strong>,
              </p>

              <p style="margin:0 0 12px;font-size:17px;color:#374151;line-height:1.6;">
                Your order is confirmed.
              </p>

              <p style="margin:0 0 12px;font-size:17px;color:#374151;line-height:1.6;">
                You will get an email when the order is ready for pickup.
              </p>

              <p style="margin:0 0 20px;font-size:17px;color:#374151;line-height:1.6;">
                You will pick it up at the following location:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:8px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <span style="font-size:16px;font-weight:600;color:#111827;">${location}</span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

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

export default customerOrderConfirmationTemplate
