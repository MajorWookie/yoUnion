#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n${colors.bright}[Step ${step}]${colors.reset} ${colors.cyan}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
    log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
    log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
    try {
        log(`Running: ${command}`);
        execSync(command, {
            stdio: 'inherit',
            cwd: process.cwd(),
            ...options
        });
        return true;
    } catch (error) {
        logError(`Command failed: ${command}`);
        if (options.continueOnError) {
            return false;
        }
        throw error;
    }
}

function main() {
    const platform = process.argv[2] || 'both';

    try {
        log(`\n${colors.bright}🛠️  Fixing Development Build Issue${colors.reset}`);
        log(`Platform: ${colors.cyan}${platform}${colors.reset}\n`);

        // Check if expo-dev-client is installed
        logStep(1, 'Checking prerequisites...');
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!packageJson.dependencies?.['expo-dev-client']) {
            throw new Error('expo-dev-client is not installed. Run: npx expo install expo-dev-client');
        }
        logSuccess('Prerequisites check passed');

        // Clean project
        logStep(2, 'Cleaning project...');
        execCommand('npx expo start --clear --reset-cache', { continueOnError: true });
        logSuccess('Project cleaned');

        // Prebuild if needed
        logStep(3, 'Ensuring native folders exist...');
        if (!fs.existsSync('ios') && !fs.existsSync('android')) {
            execCommand('npx expo prebuild');
        }
        logSuccess('Native folders ready');

        // Build for specific platform
        if (platform === 'ios' || platform === 'both') {
            logStep(4, 'Building for iOS...');
            if (fs.existsSync('ios')) {
                execCommand('cd ios && pod install', { continueOnError: true });
            }
            execCommand('npx expo run:ios');
            logSuccess('iOS development client installed');
        }

        if (platform === 'android' || platform === 'both') {
            logStep(4, 'Building for Android...');
            execCommand('npx expo run:android');
            logSuccess('Android development client installed');
        }

        logStep(5, 'Setup complete!');
        log(`\n${colors.bright}Next steps:${colors.reset}`);
        log(`1. Run ${colors.green}npm run dev${colors.reset} to start the development server`);
        log(`2. The development client should automatically connect`);

    } catch (error) {
        logError(`Script failed: ${error.message}`);
        log(`\n${colors.bright}Quick fix commands:${colors.reset}`);
        log(`• ${colors.green}npx expo prebuild --clean${colors.reset}`);
        log(`• ${colors.green}npx expo run:ios${colors.reset} (for iOS)`);
        log(`• ${colors.green}npx expo run:android${colors.reset} (for Android)`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
