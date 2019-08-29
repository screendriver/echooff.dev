import * as colors from '../../src/colors';

test('grey', () => {
  expect(colors.grey).toBe('#656c6d');
});

test('darkGrey', () => {
  expect(colors.darkGrey).toBe('#7d8384');
});

test('white', () => {
  expect(colors.white).toBe('#ffffff');
});

test('darkerWhite', () => {
  expect(colors.darkerWhite).toBe('#f4f5f6');
});

test('black', () => {
  expect(colors.black).toBe('#121d1f');
});

test('cyan', () => {
  expect(colors.cyan).toBe('#7bc3d1');
});

test('light', () => {
  expect(colors.light).toBe('#f6f6f6');
});
