
const tsConfig = require('../tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

tsConfigPaths.register({
    baseUrl: '../',
    paths: tsConfig.compilerOptions.paths
});

require('dotenv').config({ path: '.env.local' });

import { adminAuthService } from '../src/lib/services/admin-auth'

async function run() {
    console.log('Starting MFA Verification...')

    // 0. Mock environment if needed (assuming tsx runs with env)

    try {

        // 1. Get/Create Admin User
        console.log('1. Getting Admin Account...')
        let accountsRes = await adminAuthService.getAllAdminAccounts()

        if (!accountsRes.success) {
            console.error('Failed to get accounts:', accountsRes.error)
            // It might be because the table admin_accounts doesn't exist? (Unlikely)
        }

        let adminUser = accountsRes.accounts?.[0]

        if (!adminUser) {
            console.log('No accounts found. Creating test admin...')
            const createRes = await adminAuthService.createAdminAccount({
                username: 'test_mfa_admin',
                password: 'password123',
                role: 'admin'
            })

            if (!createRes.success) {
                console.error('Failed to create admin:', createRes.error)
                console.warn('NOTE: Usually this fails if the DB schema is not updated.')
                throw new Error('Admin creation failed')
            }
            adminUser = createRes.admin
        }

        if (!adminUser) throw new Error('Could not obtain an admin user')
        console.log(`Using admin: ${adminUser.username} (${adminUser.id})`)

        // 2. Login (Should be successful without MFA initially)
        console.log('2. Testing Initial Login...')
        // Use the obtained admin username, but we might not know password if it was existing.
        // So allow skipping if we reused an existing admin (and don't know password).
        // But for verification we assume we created it or know it.
        // Let's force creation of a NEW unique admin to be sure.

        const timestamp = Date.now()
        const newAdminName = `mfa_tester_${timestamp}`
        const newAdminPass = 'securepass123'

        console.log(`Creating NEW test admin for consistent state: ${newAdminName}`)
        const createResult = await adminAuthService.createAdminAccount({
            username: newAdminName,
            password: newAdminPass,
            role: 'admin'
        })

        if (!createResult.success) {
            console.error('Detailed Create Error:', createResult.error)
            throw new Error('Failed to create new test admin')
        }
        const newAdminId = createResult.admin!.id

        // Login
        const loginRes = await adminAuthService.login(newAdminName, newAdminPass)
        if (!loginRes.success) throw new Error('Initial login failed')
        console.log('Initial login success (No MFA required)')

        // 3. Setup MFA
        console.log('3. Setting up MFA...')
        const setupRes = await adminAuthService.generateMFASetup(newAdminId, 'test@example.com')
        console.log('Secret generated:', setupRes.secret)

        // Generate Token
        const { authenticator } = require('otplib')
        const token = authenticator.generate(setupRes.secret)
        console.log('Generated OTP:', token)

        // Enable MFA
        const enableRes = await adminAuthService.enableMFA(newAdminId, token, setupRes.secret)
        if (!enableRes) throw new Error('MFA Enable failed')
        console.log('MFA Enabled successfully')

        // 4. Login with MFA Challenge
        console.log('4. Testing MFA Login...')
        const mfaLoginRes = await adminAuthService.login(newAdminName, newAdminPass)

        if (mfaLoginRes.success) throw new Error('Should have required MFA but succeeded immediately')
        if (!mfaLoginRes.requireMFA) throw new Error('Did not require MFA')

        console.log('Login required MFA as expected. Temp Token:', mfaLoginRes.tempToken)

        // 5. Verify MFA & Complete Login
        const otp2 = authenticator.generate(setupRes.secret)
        const finalLogin = await adminAuthService.verifyMFAAndLogin(mfaLoginRes.tempToken!, otp2)

        if (!finalLogin.success) throw new Error('Final MFA login failed: ' + finalLogin.error)
        console.log('Final MFA Login Success!')

        // 6. Disable MFA
        console.log('6. Disabling MFA...')
        await adminAuthService.disableMFA(newAdminId)

        const finalCheck = await adminAuthService.login(newAdminName, newAdminPass)
        if (!finalCheck.success || finalCheck.requireMFA) throw new Error('MFA disable check failed')
        console.log('MFA Disable confirmed')

        console.log('ALL TESTS PASSED')

    } catch (e) {
        console.error('Verification Failed:', e)
        process.exit(1)
    }
}

run()
