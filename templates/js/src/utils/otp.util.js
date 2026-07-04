const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOTPHtml = (otp) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
                .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .header { text-align: center; color: #333; margin-bottom: 20px; }
                .otp-section { text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; }
                .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <h2 class="header">Verify Your Account</h2>
                <p>Hello,</p>
                <p>Use the following One-Time Password (OTP) to complete your verification:</p>
                <div class="otp-section">
                    <div class="otp-code">${otp}</div>
                </div>
                <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
                <div class="footer"><p>If you didn't request this, please ignore this email.</p></div>
            </div>
        </body>
        </html>
    `;
};

const passwordResetHtml = (otp) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
                .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .header { text-align: center; color: #333; margin-bottom: 20px; }
                .otp-section { text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; }
                .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <h2 class="header">Reset Your Password</h2>
                <p>Hello,</p>
                <p>Use the following One-Time Password (OTP) to reset your password:</p>
                <div class="otp-section">
                    <div class="otp-code">${otp}</div>
                </div>
                <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
                <div class="footer"><p>If you didn't request this, please ignore this email.</p></div>
            </div>
        </body>
        </html>
    `;
}

export {
    generateOTP,
    getOTPHtml,
    passwordResetHtml
}