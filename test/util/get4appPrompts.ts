import {ConfigKey} from '../../util/ConfigKey';

export const libs = [
  '@angular/animations',
  '@angular/cdk',
  '@angular/forms',
  '@angular/material',
  '@angular/router',
  '@ngrx/core',
  '@ngrx/store'
];

export function get4appPrompts(overrides?: any): any {
  const defaults: any = {
    license: 'MIT'
  };

  defaults[ConfigKey.packageName] = 'app-4-generator-unit-test';
  defaults[ConfigKey.packageDescription] = 'app-4-generator-unit-test-desc';
  defaults[ConfigKey.packagePrivate] = false;
  defaults[ConfigKey.packageAuthorName] = 'Alorel';
  defaults[ConfigKey.packageAuthorUrl] = 'http://foo';
  defaults[ConfigKey.packageAuthorEmail] = 'foo@bar.com';
  defaults[ConfigKey.usingGit] = true;
  defaults[ConfigKey.githubEnabled] = true;
  defaults[ConfigKey.githubUsername] = 'Alorel';
  defaults[ConfigKey.githubRepo] = 'foo-bar';
  defaults[ConfigKey.bugsUrl] = 'https://foo.com';
  defaults[ConfigKey.homepage] = 'http://bar.com';
  defaults[ConfigKey.installDeps] = false;
  defaults[ConfigKey.libGlobalName] = 'MyUnitTestLib';
  defaults[ConfigKey.demoPort] = '5555';
  defaults[ConfigKey.extraLibs] = libs;

  return Object.assign(defaults, overrides || {});
}
