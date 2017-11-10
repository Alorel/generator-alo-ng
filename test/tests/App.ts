import {test} from 'ava';
import {instantiateApp} from '../util/instantiate-generator';

import * as yo from 'yeoman-test';
import App4Generator = require('../../generators/app-4/index');
import AppGenerator = require('../../generators/app/index');

const version = 4;

test('App can instantiate', t => {
  t.true(instantiateApp() instanceof AppGenerator);
});

test('Default version is NaN', t => {
  t.is(instantiateApp()._version, NaN);
});

test('Arged version (short)', t => {
  t.is(instantiateApp({v: version})._version, version);
});

test('Arged version (long)', t => {
  t.is(instantiateApp({version})._version, version);
});

test('Prompted version (valid)', async t => {
  const inst = instantiateApp();
  yo.mockPrompt(inst, {
    version: '4'
  });

  await inst.prompting();

  t.is(inst._version, version);
});

test('Prompted version (invalid)', async t => {
  const inst = instantiateApp();
  yo.mockPrompt(inst, {
    version: 'foo'
  });

  try {
    await inst.prompting();
    t.fail('Error not thrown');
  } catch {
    t.pass();
  }
});

test('ComposeWith works', t => {
  const inst = instantiateApp();

  t.true(inst['_composedWith'] !== undefined, '_composedWith prop exists');
  t.true(Array.isArray(inst['_composedWith']), '_composedWith prop is array');
  t.is(inst['_composedWith'].length, 0, 'Composed with nothing');

  inst.end();

  t.is(inst['_composedWith'].length, 1, 'Composed with 1 item');
  t.true(inst['_composedWith'][0] instanceof App4Generator, 'Composed with AppGenerator');
});
