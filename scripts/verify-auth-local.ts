
import { authService } from '../src/lib/services/auth.service';

async function verifyAuth() {
    console.log('🚀 Starting Local Auth Verification...');
    const testEmail = `test.local.${Date.now()}@example.com`;
    const testPassword = 'password123';
    const testName = 'Local Tester';

    try {
        // 1. Register
        console.log(`📝 Registering user: ${testEmail}`);
        const regResult = await authService.register({
            email: testEmail,
            password: testPassword,
            name: testName
        });
        console.log('✅ Registration successful. User ID:', regResult.user.id);

        // 2. Login
        console.log('🔑 Attempting login...');
        const loginResult = await authService.login({
            email: testEmail,
            password: testPassword
        });

        if (loginResult.token) {
            console.log('✅ Login successful! Token received.');
            console.log('🎉 Verified: Local Email/Password Auth is WORKING.');
        } else {
            console.error('❌ Login failed: No token received.');
            process.exit(1);
        }

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.message);
        if (error.message.includes('already registered')) {
            console.log('⚠️  User already exists, trying login only...');
            try {
                const loginResult = await authService.login({
                    email: testEmail,
                    password: testPassword
                });
                console.log('✅ Login successful!');
            } catch (loginError) {
                console.error('❌ Login also failed:', loginError);
                process.exit(1);
            }
        } else {
            process.exit(1);
        }
    }
}

verifyAuth();
