#!/usr/bin/env node

(() => {
  const generator = require.resolve('../generators/app-4/index');
  const yoEnv = require('yeoman-environment');

  const env = yoEnv.createEnv();

  env.register(generator);
  env.run(generator);
})();