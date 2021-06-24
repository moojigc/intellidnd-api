import { Service } from '@utils/Service';
import sendVerificationEmail from '../_sendVerificationEmail';

export default new Service<{
    code: string;
}>({
    route: '/user/discord/login',
    method: 'post',
    isPublic: true,
    payload: {
        required: {
            code: 'string'
        }
    },
    async callback(data) {

        const { db, headers, payload, err, ext } = data;

        const discordOAuth = new ext.DiscordOAuth();

        (await discordOAuth.authenticate(payload.code, headers.host!)).getProfile();

        const { id, username, email, verified } = discordOAuth.profile;

        const [user, created] = await db.User.findOrCreate({
            where: {
                discordId: id
            }
        });

        // const existingEmail = await db.User.findOne({
        //     where
        // })

        if (created) {

            user.set('username', username);
            user.set('emailAddress', email);
            
            await db.Email.create({
                userId: user.id,
                address: email,
                verifiedAt: verified ? Date.now() : null
            });

            await user.save();

            if (!verified) {
                
                sendVerificationEmail(data, user);
            }
        }
    }
});