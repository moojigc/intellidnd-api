import nodemailer from 'nodemailer';
import ServerError from './Error';

export default async function sendEmail(options: {
    type?: string;
    body?: string;
    params?: Record<string, string>;
    to: string;
    subject?: string;
}) {

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        auth: {
            pass: process.env.SMTP_PASS,
            user: process.env.SMTP_USER
        }
    });

    if (options.type) {

        if (!options.params) {

            throw new TypeError('Missing options.params');
        }
    }
    else {

        if (!options.body) {

            throw new TypeError('Missing options.body');
        }

        try {

            await transporter.sendMail({
                to: options.to,
                html: options.body,
                text: options.body
            });
        }
        catch (e) {

            console.log(e);
            
            throw new ServerError('email-01', 500, 'Error sending email');
        }
    }
}