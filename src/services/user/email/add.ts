import Service from '@utils/Service';

export default new Service<{
    email: string;
}>({
    route: '/user/phone',
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

        if (user.emailAddress === payload.email) {

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

            throw err('set_phone-01', 500, e.message, e);
        }

        await transaction.commit();

        return;
    }
});