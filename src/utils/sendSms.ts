import type User from '@models/User';
import type { Twilio } from 'twilio';
import messageTemplate from './messageTemplates.json';
import * as dotenv from 'dotenv';
dotenv.config();

export default async function sendSms({
    twilio,
    template,
    user,
    message,
    params
}: {
    twilio: Twilio;
    template?: string;
    message?: string;
    user: User;
    params: Record<string, string>;
}) {

    if (!message) {

        if (!template) {

            throw new Error('SMS: message or template name required.');
        }

        if (!messageTemplate[template]) {

            throw new Error('SMS: ' + template + ' not found!');
        }

        message = messageTemplate[template].phone;
    }

    if (params) {

        for (const p in params) {

            message = message!.replace(new RegExp('{' + p + '}'), params[p]);
        }
    }

    if (!user.phoneNumber) {

        throw new Error('SMS: No phone number found.');
    }

    try {

        await twilio.messages.create({
            to: user.phoneNumber,
            body: message,
            from: process.env.TWILIO_FROM
        });
    }
    catch (e) {

        console.log(JSON.stringify(e, null, 2));
        throw new Error('SMS: unknown error sending message.');
    }
}