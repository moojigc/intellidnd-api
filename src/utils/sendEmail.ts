import { ServiceData } from '@types';
import nodemailer from 'nodemailer';
import serverError from './Error';
import templates from './messageTemplates.json';

export default async function sendEmail(options: {
    body?: string;
    template?: string;
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

    if (options.body) {

        if (!('params' in options)) {

            throw new TypeError('Missing options.params');
        }
    }
    else {
        
        if (options.template) {

            options.body = templates[options.template]?.email;

            if (!options.body) {

                throw new Error(`Missing email template ${options.template}`);
            }
        }
        
        if (!options.body) {
            
            throw new TypeError('Missing options.body');
        }

        const host = /api.intellidnd.com/.test(options.headers.host || '')
            ? 'https://new.intellidnd.com'
            : 'http://localhost:5000';

        console.log(options.body)

        options.body = options.body!.replace(/{host}/g, host);

        if (options.params) {

            for (const param in options.params) {
    
                const regex = new RegExp('{' + param + '}');
                options.body = options.body!.replace(regex, options.params[param]);
                options.subject = options.subject?.replace(regex, options.params[param]);
            }
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
            
            throw serverError('email-01', 500, 'Error sending email');
        }
    }
}