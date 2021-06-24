import { Service } from '@utils/Service';
import { validateRequest } from 'twilio/lib/webhooks/webhooks';
import { twiml as Twiml } from 'twilio';

export default new Service<{}, {
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
}>({
    route: '/twilio/webhook',
    method: 'post',
    isPublic: true,
    payload: {},
    async callback(data) {

        const valid = validateRequest(
            data.env.TWILIO_SECRET!,
            data.headers['x-twilio-signature'] as string,
            data.headers['host']! + data.env.PREFIX + this.route,
            data.payload
        );

        if (!valid) {

            throw data.err('twilio_webhook-01', 401);
        }

        const twiml = new Twiml.MessagingResponse();

        const user = await data.db.User.lookup({ identifier: data.payload.To });

        twiml.message('Whatup, ' + (user ? user.id : 'dude?'));
    }
});