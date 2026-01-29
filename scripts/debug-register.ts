import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log('DEBUG: DATABASE_URL is', process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED');
console.log('DEBUG: DATABASE_URL value:', process.env.DATABASE_URL);

import { authService } from '../src/lib/services/auth.service';

async function testRegister() {
    try {
        const email = `test-${Date.now()}@example.com`;
        console.log(`Attempting to register user: ${email}`);
        
        const result = await authService.register({
            email: email,
            password: 'Password123!',
            name: 'Debug User'
        });
        
        console.log('Registration SUCCESS:', result);
    } catch (error: any) {
        console.error('Registration FAILED:', error);
        console.error('Stack:', error.stack);
    }
    process.exit(0);
}

testRegister();
