import { Service } from '@utils/Service';
import { validateRequest } from 'twilio/lib/webhooks/webhooks';
import twilio, { twiml as Twiml } from 'twilio';

interface TwilioPayload {
    AccountSid: string;
    ApiVersion: string;
    Body: string;
    From: string;
    FromCity: string;
    FromCountry: string;
    FromState: string;
    FromZip: string;
    MessageSid: string;
    NumMedia: string;
    NumSegments: string;
    SmsMessageSid: string;
    SmsSid: string;
    SmsStatus: string;
    To: string;
    ToCity: string;
    ToCountry: string;
    ToState: string;
    ToZip: string;
};

export default new Service({
    route: '/twilio/webhook',
    method: 'post',
    isPublic: true,
    payload: {
        optional: null
    },
    async callback(data) {

        const stuff = [
            data.env.TWILIO_TOKEN!,
            data.headers['x-twilio-signature'] as string,
            'https://' + data.headers['host']! + '/' + (data.env.PREFIX || 'v1') + this.route,
            data.payload
        ];
        console.log(stuff)

        const valid = validateRequest(
           stuff[0],
           stuff[1],
           stuff[2],
           // @ts-ignore
           stuff[3]
        );

        if (!valid) {

            throw data.err('twilio_webhook-01', 401);
        }

        const twiml = new Twiml.MessagingResponse();

        // @ts-ignore
        const user = await data.db.User.lookup({ identifier: data.payload.From });

        twiml.message('Whatup, ' + (user ? user.username : 'dude?'));
        return twiml.toString();
    }
});