import { Service } from '@utils/Service';
import initSession from '../_initSession';

export default new Service({
    route: '/user/email/:param1/verify',
    payload: {},
    method: 'patch',
    isPublic: false,
    roles: ['unverified'],
    async callback(data) {

        const { user, db, err, param1 } = data;

        const [email] = user.emails.filter(e => e.address === param1); 
        
        if (!email) {
            err('email_verify-01', 403);
        }

        if (!email.verifiedAt) {

            await email.update({
                verifiedAt: Date.now()
            });

            await user.removeRole('unverified');
        }

        return await initSession(data, user, this);
    }
});;