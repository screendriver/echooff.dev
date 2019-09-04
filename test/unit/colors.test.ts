import test from 'ava';
import * as colors from '../../src/colors';

test('grey', t => {
  t.is(colors.grey, '#656c6d');
});

test('darkGrey', t => {
  t.is(colors.darkGrey, '#7d8384');
});

test('white', t => {
  t.is(colors.white, '#ffffff');
});

test('darkerWhite', t => {
  t.is(colors.darkerWhite, '#f4f5f6');
});

test('black', t => {
  t.is(colors.black, '#121d1f');
});

test('cyan', t => {
  t.is(colors.cyan, '#7bc3d1');
});

test('light', t => {
  t.is(colors.light, '#f6f6f6');
});
