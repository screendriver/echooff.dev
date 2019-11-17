import { expect } from 'chai';
import * as colors from '../../src/colors';

suite('colors', () => {
  test('grey', () => {
    expect(colors.grey).to.equal('#656c6d');
  });

  test('darkGrey', () => {
    expect(colors.darkGrey).to.equal('#7d8384');
  });

  test('white', () => {
    expect(colors.white, '#ffffff');
  });

  test('darkerWhite', () => {
    expect(colors.darkerWhite).to.equal('#f4f5f6');
  });

  test('black', () => {
    expect(colors.black).to.equal('#121d1f');
  });

  test('cyan', () => {
    expect(colors.cyan).to.equal('#7bc3d1');
  });

  test('light', () => {
    expect(colors.light).to.equal('#f6f6f6');
  });
});
