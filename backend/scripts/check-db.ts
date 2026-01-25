import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function check() {
    const result = await client.execute('PRAGMA table_info(folders)');
    console.log('Folders columns:', result.rows.map((r: any) => r.name));

    const files = await client.execute('SELECT id, name, user_id FROM files');
    console.log('Files in DB:', files.rows);
}

check();
