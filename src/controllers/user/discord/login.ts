import { Service } from '@utils/Service';
import initSession from '../_initSession';
import sendVerificationEmail from '../_sendVerificationEmail';

export default new Service<{
    code: string;
}>({
    route: '/user/oauth/discord',
    method: 'post',
    isPublic: true,
    payload: {
        required: {
            code: 'string'
        }
    },
    async callback(data) {

        const { db, headers, payload, err, ext, Op } = data;

        const discordOAuth = new ext.DiscordOAuth();

        await discordOAuth.authenticate(payload.code, headers.host!);
        
        const { id, username, email, verified } = await discordOAuth.getProfile();

        let [user, existingEmail] = [
            await db.User.lookup({
                discordId: id
            }),
            await db.Email.findOne({
                where: {
                    address: email
                }
            })
        ];

        if (existingEmail && !user) {

            user = await existingEmail.getUser();

            if (user.discordId) {

                throw data.err('discord_oauth-01', 500, `I don't even know how you would get this error, but it happened.`);
            }

            await user.update({
                discordId: id,
                discordDiscriminator: discordOAuth.discriminator,
                discordUsername: username
            });
        }
        else if (user) {

            await user.update({
                discordDiscriminator: discordOAuth.discriminator,
                discordUsername: username
            });
        }
        else {

            user = await db.User.create({
                username: username,
                discordUsername: username,
                discordId: id,
                discordDiscriminator: discordOAuth.discriminator,
                lastLoginAt: Date.now(),
            });

            await user.createEmail({
                address: email,
                userId: user.id,
                verifiedAt: verified ? Date.now() : null
            });

            await user.update({
                emailAddress: email
            });

            if (!verified) {

                sendVerificationEmail(data, user, email);
            }
        }
        return await initSession(data, user, this, discordOAuth);
    }
});