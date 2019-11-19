import { assert } from 'chai';
import * as colors from '../../src/colors';

suite('colors', function() {
  test('grey', function() {
    assert.equal(colors.grey, '#656c6d');
  });

  test('darkGrey', function() {
    assert.equal(colors.darkGrey, '#7d8384');
  });

  test('white', function() {
    assert.equal(colors.white, '#ffffff');
  });

  test('darkerWhite', function() {
    assert.equal(colors.darkerWhite, '#f4f5f6');
  });

  test('black', function() {
    assert.equal(colors.black, '#121d1f');
  });

  test('cyan', function() {
    assert.equal(colors.cyan, '#7bc3d1');
  });

  test('light', function() {
    assert.equal(colors.light, '#f6f6f6');
  });
});
