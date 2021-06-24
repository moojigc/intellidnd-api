import type User from '@models/User';
import type { ServiceData } from '@types';
import type Service from '@utils/Service';
import DiscordOAuth from 'externalServices/DiscordOAuth';

export default async function initSession(
	{ db }: ServiceData,
	user: User,
	service: Omit<Service<any, any>, 'roles'>,
    discordOAuth?: DiscordOAuth
) {
	const token = await db.Token.generate({
		expires: 'session',
		userId: user.id,
		roles: (await user.getRoles()).map((r) => r.roleKey),
        discordOAuth
	});

	service.setInHeader = {
		cookie: {
			value: token.refreshToken,
			maxAge: token.sessionExpiresAt,
		},
	};

	return {
		token: token.authToken,
		expiresAt: token.expiresAt ? token.expiresAt : null,
		name: user.name,
		email: user.email,
	};
}
