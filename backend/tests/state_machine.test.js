const assert = require('assert');
const test = require('node:test');

/**
 * Valid state transition rules from Master Specification:
 * WAITING -> CALLED
 * WAITING -> CANCELLED
 * CALLED -> SERVING
 * CALLED -> NO_SHOW
 * SERVING -> COMPLETED
 */
const isValidTransition = (from, to) => {
  const validTransitions = {
    WAITING: ['CALLED', 'CANCELLED'],
    CALLED: ['SERVING', 'NO_SHOW'],
    SERVING: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
  };

  return (validTransitions[from] || []).includes(to);
};

test('Business Rules - Ticket State Machine Invariants', async (t) => {
  await t.test('Allowed transitions are valid', () => {
    assert.strictEqual(isValidTransition('WAITING', 'CALLED'), true);
    assert.strictEqual(isValidTransition('WAITING', 'CANCELLED'), true);
    assert.strictEqual(isValidTransition('CALLED', 'SERVING'), true);
    assert.strictEqual(isValidTransition('CALLED', 'NO_SHOW'), true);
    assert.strictEqual(isValidTransition('SERVING', 'COMPLETED'), true);
  });

  await t.test('Invalid transitions are strictly rejected', () => {
    assert.strictEqual(isValidTransition('WAITING', 'SERVING'), false);
    assert.strictEqual(isValidTransition('WAITING', 'COMPLETED'), false);
    assert.strictEqual(isValidTransition('WAITING', 'NO_SHOW'), false);
    assert.strictEqual(isValidTransition('CALLED', 'COMPLETED'), false);
    assert.strictEqual(isValidTransition('CALLED', 'CANCELLED'), false);
    assert.strictEqual(isValidTransition('SERVING', 'CANCELLED'), false);
    assert.strictEqual(isValidTransition('SERVING', 'NO_SHOW'), false);
    assert.strictEqual(isValidTransition('COMPLETED', 'WAITING'), false);
    assert.strictEqual(isValidTransition('CANCELLED', 'WAITING'), false);
  });

  await t.test('Terminal states cannot transition to anything', () => {
    ['COMPLETED', 'CANCELLED', 'NO_SHOW'].forEach((terminalState) => {
      ['WAITING', 'CALLED', 'SERVING', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].forEach((target) => {
        assert.strictEqual(isValidTransition(terminalState, target), false);
      });
    });
  });
});
