import Service from '@utils/Service';

export default new Service<{
    email: string;
}>({
    route: '/user/email',
    method: 'post',
    isPublic: false,
    rateLimit: {
        skipFailed: true
    },
    payload: {
        required: {
            email: 'email'
        },
    },
    callback: async ({ user, ext, payload, db, sql, err }) => {

        if (user.emails.filter(e => e.address === payload.email).length) {

            return;
        }

        const transaction = await sql.transaction();
        
        try {

            await db.Email.create({
                address: payload.email,
                userId: user.id
            });
        }
        catch (e) {

            await transaction.rollback();

            throw err('add_email-01', 500, e.message, e);
        }

        await transaction.commit();

        return;
    }
});