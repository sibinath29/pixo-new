# Email Setup Guide for OTP Verification

This guide will help you configure email sending for OTP verification in your Pixo application.

## Option 1: Gmail (Easiest for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (Custom name)"
3. Enter "Pixo App"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Add to .env.local
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

## Option 2: SMTP (Any Email Provider)

### For Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### For Yahoo:
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

### For Custom SMTP:
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-password
```

## Option 3: Email Service Providers (Recommended for Production)

### Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Update `lib/email.ts` to use Resend API

### SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Update `lib/email.ts` to use SendGrid API

### Mailgun
1. Sign up at [mailgun.com](https://mailgun.com)
2. Get your API key
3. Update `lib/email.ts` to use Mailgun API

## Current Configuration

The current setup uses Nodemailer with Gmail by default. To use a different provider, update `lib/email.ts`.

## Testing Email

After setting up, test by:
1. Going to `/signup`
2. Entering an email
3. Clicking "Verify Email"
4. Checking your inbox (and spam folder)

## Troubleshooting

### "Invalid login" error
- Make sure you're using an App Password (not your regular password) for Gmail
- Check that 2FA is enabled

### "Connection timeout"
- Check your firewall settings
- Verify SMTP port (587 for TLS, 465 for SSL)

### Emails going to spam
- Add SPF and DKIM records to your domain
- Use a professional email service for production

## Production Recommendations

For production, use a professional email service:
- **Resend** - Great for transactional emails, free tier available
- **SendGrid** - Reliable, good free tier
- **AWS SES** - Cost-effective for high volume
- **Mailgun** - Good deliverability

These services provide better deliverability and analytics than SMTP.














