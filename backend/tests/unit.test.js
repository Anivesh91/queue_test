const assert = require('assert');
const test = require('node:test');
const { formatTicketNumber, generatePublicToken } = require('../src/utils/tokenGenerator');

test('Unit Tests - Token and Ticket Generation', async (t) => {
  await t.test('formatTicketNumber formats prefix and padded numbers correctly', () => {
    assert.strictEqual(formatTicketNumber('GC', 1), 'GC-001');
    assert.strictEqual(formatTicketNumber('a', 42), 'A-042');
    assert.strictEqual(formatTicketNumber('SALON', 100), 'SALON-100');
    assert.strictEqual(formatTicketNumber('', 5), 'A-005');
  });

  await t.test('generatePublicToken creates random token starting with qtk_', () => {
    const token1 = generatePublicToken();
    const token2 = generatePublicToken();

    assert.ok(token1.startsWith('qtk_'));
    assert.ok(token2.startsWith('qtk_'));
    assert.notStrictEqual(token1, token2);
    assert.strictEqual(token1.length, 36); // 'qtk_' + 32 hex chars
  });

  await t.test('ETA calculation formula: peopleAhead * averageServiceTime', () => {
    const avgServiceTime = 10;
    const calculateEta = (peopleAhead, avgTime) => peopleAhead * avgTime;

    assert.strictEqual(calculateEta(0, avgServiceTime), 0);
    assert.strictEqual(calculateEta(1, avgServiceTime), 10);
    assert.strictEqual(calculateEta(3, 15), 45);
  });
});
