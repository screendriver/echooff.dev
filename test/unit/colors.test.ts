import assert from 'assert';
import * as colors from '../../src/colors';

suite('colors', function () {
  test('grey', function () {
    assert.strictEqual(colors.grey, '#656c6d');
  });

  test('darkGrey', function () {
    assert.strictEqual(colors.darkGrey, '#7d8384');
  });

  test('white', function () {
    assert.strictEqual(colors.white, '#ffffff');
  });

  test('darkerWhite', function () {
    assert.strictEqual(colors.darkerWhite, '#f4f5f6');
  });

  test('black', function () {
    assert.strictEqual(colors.black, '#121d1f');
  });

  test('cyan', function () {
    assert.strictEqual(colors.cyan, '#7bc3d1');
  });

  test('light', function () {
    assert.strictEqual(colors.light, '#f6f6f6');
  });
});
