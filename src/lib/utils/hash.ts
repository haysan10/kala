import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10; // bcryptjs is slower, 10 is better for serverless

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

