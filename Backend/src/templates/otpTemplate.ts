export const otpEmailTemplate = (otp: string) => {
    return `
    <!DOCTYPE html>
    <html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #FFF8E1;
            border-radius: 8px 8px 0 0;
        }
        .logo {
            font-size: 24px;
            color: #DAA520;
            font-weight: bold;
        }
        .content {
            padding: 30px 20px;
            text-align: center;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #DAA520;
            letter-spacing: 5px;
            margin: 20px 0;
            padding: 15px;
            background-color: #FFF8E1;
            border-radius: 8px;
            display: inline-block;
            border: 1px solid rgba(218, 165, 32, 0.3);
        }
        .message {
            margin: 20px 0;
            color: #666666;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #999999;
            border-top: 1px solid #F0E6C0;
        }
        .note {
            font-size: 13px;
            color: #666666;
            font-style: italic;
        }
        h2 {
            color: #B8860B;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Planzo</div>
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p class="message">Thank you for choosing our service! To complete your registration, please use the verification code below:</p>
            <div class="otp-code">${otp}</div>
            <p class="message">This code will expire in 10 minutes.</p>
            <p class="note">If you didn't request this verification code, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Your Brand. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `;
};