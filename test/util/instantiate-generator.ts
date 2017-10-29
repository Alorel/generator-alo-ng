import * as Generator from 'yeoman-generator';
import AppGenerator = require('../../generators/app/index');
import App4Generator = require("../../generators/app-4/index");

const TestAdapter = require('yeoman-test/lib/adapter').TestAdapter;

const yoEnv = require('yeoman-environment');

function instantiateGenerator<T extends Generator>(constructor: any, resolved: any, options?: any, setAdapter: boolean = true): T {
  const env = yoEnv.createEnv();

  if (setAdapter) {
    env.adapter = new TestAdapter();
  }

  return new constructor([], Object.assign({
    env,
    resolved
  }, options || {}));
}

export function instantiateApp(options?: any): AppGenerator {
  return instantiateGenerator(AppGenerator, require.resolve('../../generators/app/index'), options)
}

export function instantiateApp4(): App4Generator {
  return instantiateGenerator(
    App4Generator,
    require.resolve("../../generators/app-4/index")
  );
}