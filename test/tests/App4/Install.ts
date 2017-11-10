import {test} from 'ava';
import * as fs from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';
import * as yo from 'yeoman-test';
import {ConfigKey} from '../../../util/ConfigKey';
import {get4appPrompts} from '../../util/get4appPrompts';
import {instantiateApp4} from '../../util/instantiate-generator';
import {TmpDir} from '../../util/TmpDir';

tmp.setGracefulCleanup();

let tmpdir: TmpDir;

test.before.cb.serial('Creating temp dir', t => {
  tmp.dir({
    discardDescriptor: true,
    unsafeCleanup: true
  },      (err: any, dir: string, clean: Function) => {
    if (err) {
      t.fail(err);
    } else {
      tmpdir = {dir, clean};
      process.chdir(dir);
    }
    t.end();
  });
});

test.before.serial('Setting mock env', () => {
  process.env.ALO_NG_MOCK_INSTALL = '1';
  process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = '1';
});

test.before.cb.serial('Running generator', t => {
  const app = instantiateApp4();
  const prompts = get4appPrompts();
  prompts[ConfigKey.installDeps] = true;
  prompts[ConfigKey.extraLibs] = null;

  yo.mockPrompt(app, prompts);

  app.run(e => {
    if (e) t.fail(e);
    t.end();
  });
});

test.after('Removing temp dir', () => {
  if (tmpdir && tmpdir.clean) {
    tmpdir.clean();
  }
});

test.after('Removing mock env', () => {
  delete process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD;
  delete process.env.ALO_NG_MOCK_INSTALL;
});

test.cb("Package.json shouldn't contain ngrx", t => {
  fs.readFile(path.join(tmpdir.dir, 'package.json'), 'utf8', (e: any, data: string) => {
    if (e) {
      t.fail(e);
    } else {
      const pkg = JSON.parse(data);

      t.false('@ngrx/store' in pkg.peerDependencies, 'store@peer');
      t.false('@ngrx/store' in pkg.devDependencies, 'store@dev');
      t.false('@ngrx/store-devtools' in pkg.peerDependencies, 'store-devtools@peer');
      t.false('@ngrx/store-devtools' in pkg.devDependencies, 'store-devtools@dev');
    }

    t.end();
  });
});

test('Installation dir should contain node_modules', t => {
  t.true(fs.readdirSync(tmpdir.dir, 'utf8').includes('node_modules'));
});

test('Installation dir should contain .git', t => {
  t.true(fs.readdirSync(tmpdir.dir, 'utf8').includes('.git'));
});
