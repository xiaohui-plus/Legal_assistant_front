/**
 * Simple test runner for platform utility tests
 * This script runs the platform tests in isolation
 */

const { spawn } = require('child_process');

console.log('Running platform utility tests...\n');

const vitest = spawn('npx', ['vitest', 'run', 'tests/unit/utils/platform.test.ts', '--reporter=verbose'], {
    stdio: 'inherit',
    shell: true
});

vitest.on('close', (code) => {
    console.log(`\nTest process exited with code ${code}`);
    process.exit(code);
});

vitest.on('error', (err) => {
    console.error('Failed to start test process:', err);
    process.exit(1);
});
