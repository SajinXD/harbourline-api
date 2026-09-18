const assert = require('assert');
assert.strictEqual(typeof process.env.PORT === 'string' || process.env.PORT === undefined, true);
assert.ok(require('fs').existsSync('./server.js'), 'server.js must exist');
console.log('All tests passed');
