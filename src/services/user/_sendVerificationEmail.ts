import type User from '@models/User';
import type { ServiceData } from '@types';

import sendEmail from '@utils/sendEmail';

export default async function sendVerificationEmail(
	{ db, headers, err }: ServiceData,
	user: User
) {

    if (!user.emailAddress) {

        throw err('verification-01', 403);
    }

	const token = await db.Token.generate({
		expires: 'verification',
		userId: user.id,
		roles: ['unverified'],
	});

	await sendEmail({
		headers: headers,
		template: 'verification',
		to: user.emailAddress!,
        params: {
            token: token.authToken
        }
	});
}
