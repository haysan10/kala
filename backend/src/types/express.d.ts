import { User as DbUser } from "../db/schema.js";

// Extend Passport User type to use our database User
declare global {
    namespace Express {
        // Override Passport's User type with our database User
        interface User extends DbUser { }

        // Extend Request to include our user
        interface Request {
            user?: User;
        }
    }
}

export { };
