import type User from '@models/User';
import type { ServiceData } from '@types';

import sendEmail from '@utils/sendEmail';

export default async function sendVerificationEmail(
	{ db, headers, err }: ServiceData,
	user: User,
	email: string
) {

    if (!user.emailAddress) {

        throw err('verification-01', 403);
    }

	const code = await db.Code.createVerificationCode(user.id, {
		parentId: email,
		parentEntity: 'email'
	});

	await sendEmail({
		headers: headers,
		template: 'verification',
		to: user.emailAddress!,
        params: {
            token: code.data
        }
	});
}
