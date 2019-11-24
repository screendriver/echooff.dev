import { assert } from 'chai';
import * as colors from '../../src/colors';

suite('colors', () => {
  test('grey', () => {
    assert.equal(colors.grey, '#656c6d');
  });

  test('darkGrey', () => {
    assert.equal(colors.darkGrey, '#7d8384');
  });

  test('white', () => {
    assert.equal(colors.white, '#ffffff');
  });

  test('darkerWhite', () => {
    assert.equal(colors.darkerWhite, '#f4f5f6');
  });

  test('black', () => {
    assert.equal(colors.black, '#121d1f');
  });

  test('cyan', () => {
    assert.equal(colors.cyan, '#7bc3d1');
  });

  test('light', () => {
    assert.equal(colors.light, '#f6f6f6');
  });
});
