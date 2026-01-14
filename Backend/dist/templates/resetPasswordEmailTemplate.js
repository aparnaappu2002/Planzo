"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordEmailTemplate = void 0;
const resetPasswordEmailTemplate = (resetToken, resetUrl) => {
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
        .reset-button {
            display: inline-block;
            padding: 15px 30px;
            background-color: #DAA520;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.3s ease;
        }
        .reset-button:hover {
            background-color: #B8860B;
        }
        .reset-code {
            font-size: 18px;
            font-weight: bold;
            color: #DAA520;
            letter-spacing: 2px;
            margin: 20px 0;
            padding: 15px;
            background-color: #FFF8E1;
            border-radius: 8px;
            display: inline-block;
            border: 1px solid rgba(218, 165, 32, 0.3);
            word-break: break-all;
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
        .warning {
            background-color: #FFF3CD;
            border: 1px solid #FFEAA7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
        }
        h2 {
            color: #B8860B;
        }
        .alternative-link {
            font-size: 12px;
            color: #999999;
            margin-top: 15px;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Planzo</div>
        </div>
        <div class="content">
            <h2>Reset Your Password</h2>
            <p class="message">We received a request to reset your password. Click the button below to create a new password:</p>
            
            <a href="${resetUrl}" class="reset-button">Reset Password</a>
            
           
            
            
            <div class="warning">
                <strong>Security Notice:</strong> This reset link will expire in 1 hour for your security.
            </div>
            
            <p class="note">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            
            <div class="alternative-link">
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>${resetUrl}</p>
            </div>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Planzo. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
            <p>If you need help, contact our support team.</p>
        </div>
    </div>
</body>
</html>
    `;
};
exports.resetPasswordEmailTemplate = resetPasswordEmailTemplate;
