import nodemailer from 'nodemailer';
import type { SentMessageInfo } from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    }
});

transporter.verify((error : Error | null, success: boolean) => {
    if (error) {
        console.error(error);
    } else {
        console.error('Email server is ready to send emails');
    }
});

const sendEmail = async (
    to: string,
    subject: string,
    text: string,
    html: string
) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.GOOGLE_USER,
            to,
            subject,
            text,
            html
        });

        console.log('Email sent: ' + info.response);
        
    } catch (err) {
        console.error('Error sending email:', err);
    }
}

export default sendEmail;