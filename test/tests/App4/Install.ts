import test from 'ava';
import * as tmp from 'tmp';
import * as yo from 'yeoman-test';
import {instantiateApp4} from "../../util/instantiate-generator";
import {get4appPrompts} from "../../util/get4appPrompts";
import * as path from 'path';
import * as fs from 'fs';
import {TmpDir} from "../../util/TmpDir";
import {ConfigKey} from "../../../util/ConfigKey";

tmp.setGracefulCleanup();


let tmpdir: TmpDir;

test.before.cb.serial("Creating temp dir", t => {
  tmp.dir({
    discardDescriptor: true,
    unsafeCleanup: true
  }, (err: any, dir: string, clean: Function) => {
    if (err) {
      (<any>t).end(err);
    } else {
      tmpdir = {dir, clean};
      process.chdir(dir);
      t.end();
    }
  });
});

test.before.cb.serial("Running generator", t => {
  process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = '1';
  const app = instantiateApp4();
  const prompts = get4appPrompts();
  prompts[ConfigKey.installDeps] = true;
  prompts[ConfigKey.extraLibs] = null;

  yo.mockPrompt(app, prompts);

  app.run(t.end);
});

test.after("Removing temp dir", () => {
  if (tmpdir && tmpdir.clean) {
    tmpdir.clean();
  }
});

test.after("Reset puppeteer env var", () => {
  delete process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD;
});

test.cb("Package.json shouldn't contain ngrx", t => {
  fs.readFile(path.join(tmpdir.dir, 'package.json'), 'utf8', (e: any, data: string) => {
    if (e) {
      (<any>t).end(e);
    } else {
      const pkg = JSON.parse(data);

      t.false('@ngrx/store' in pkg.peerDependencies, 'store@peer');
      t.false('@ngrx/store' in pkg.devDependencies, 'store@dev');
      t.false('@ngrx/store-devtools' in pkg.peerDependencies, 'store-devtools@peer');
      t.false('@ngrx/store-devtools' in pkg.devDependencies, 'store-devtools@dev');

      t.end();
    }
  })
});

test("Installation dir should contain node_modules", t => {
  t.true(fs.readdirSync(tmpdir.dir, 'utf8').includes('node_modules'));
});

test("Installation dir should contain .git", t => {
  t.true(fs.readdirSync(tmpdir.dir, 'utf8').includes('.git'));
});