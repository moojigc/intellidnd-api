import { ServiceData } from '@types';
import nodemailer from 'nodemailer';
import serverError from './Error';

export default async function sendEmail(options: {
    type?: string;
    body?: string;
    params?: Record<string, string>;
    to: string;
    subject?: string;
    headers: ServiceData['headers'];
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

        const host = /api.intellidnd.com/.test(options.headers.host || '')
            ? 'https://new.intellidnd.com'
            : 'http://localhost:5000';

        options.body = options.body.replace(/{host}/g, host);

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