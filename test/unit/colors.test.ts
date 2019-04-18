import test from 'tape';
import * as colors from '../../src/colors';

test('grey', t => {
  t.plan(1);
  t.equal(colors.grey, '#656c6d');
});

test('darkGrey', t => {
  t.plan(1);
  t.equal(colors.darkGrey, '#7d8384');
});

test('white', t => {
  t.plan(1);
  t.equal(colors.white, '#ffffff');
});

test('darkerWhite', t => {
  t.plan(1);
  t.equal(colors.darkerWhite, '#f4f5f6');
});

test('black', t => {
  t.plan(1);
  t.equal(colors.black, '#121d1f');
});

test('cyan', t => {
  t.plan(1);
  t.equal(colors.cyan, '#7bc3d1');
});

test('light', t => {
  t.plan(1);
  t.equal(colors.light, '#f6f6f6');
});
