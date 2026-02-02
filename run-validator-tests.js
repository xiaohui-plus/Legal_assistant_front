#!/usr/bin/env node

/**
 * Simple test runner for validator tests
 * This script runs the validator tests in a clean environment
 */

const { spawn } = require('child_process');

const child = spawn('npx', ['vitest', 'run', 'tests/unit/utils/validator.test.ts', '--reporter=verbose'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, CI: 'true' }
});

child.on('exit', (code) => {
    process.exit(code);
});
