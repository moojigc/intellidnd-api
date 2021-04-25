import type { User } from '../../src/models/User';

declare global {
    namespace Express {
        interface Request {
            user: User;
            roles: Record<string, boolean>;
        }
    }
}