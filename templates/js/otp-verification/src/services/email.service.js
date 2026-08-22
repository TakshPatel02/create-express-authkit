import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_APP_PASSWORD
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error(error);
    } else {
        console.error('Email server is ready to send emails');
    }
});

const sendEmail = async (to, subject, text, html) => {
    try{
        const info = await transporter.sendMail({
            from: process.env.GOOGLE_USER,
            to,
            subject,
            text,
            html
        });

        console.log('Email sent: ' + info.response);
        console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    } catch(err){
        console.error('Error sending email:', err);
    }
}

export default sendEmail;