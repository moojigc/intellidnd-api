import nodemailer from 'nodemailer';
import serverError from './Error';

const _originMap = {
    'localhost:4000': 'http://localhost:5000',
    'api.intellidnd.com': 'http://intellidnd.com'
};

export default async function sendEmail(options: {
    type?: string;
    body?: string;
    params?: Record<string, string>;
    to: string;
    subject?: string;
    host?: string;
}) {

    console.log(options.host)

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

        options.body = options.body.replace(/{host}/g, _originMap[options.host || 'api.intellidnd.com']);

        try {

            await transporter.sendMail({
                to: options.to,
                html: options.body,
                text: options.body
            });
        }
        catch (e) {

            console.log(e);
            
            throw serverError('email-01', 500, 'Error sending email');
        }
    }
}