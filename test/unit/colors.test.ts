import * as colors from '../../src/colors';

test('grey', () => {
  expect(colors.grey).toEqual('#656c6d');
});

test('darkGrey', () => {
  expect(colors.darkGrey).toEqual('#7d8384');
});

test('white', () => {
  expect(colors.white).toEqual('#ffffff');
});

test('darkerWhite', () => {
  expect(colors.darkerWhite).toEqual('#f4f5f6');
});

test('black', () => {
  expect(colors.black).toEqual('#121d1f');
});

test('cyan', () => {
  expect(colors.cyan).toEqual('#7bc3d1');
});

test('light', () => {
  expect(colors.light).toEqual('#f6f6f6');
});
