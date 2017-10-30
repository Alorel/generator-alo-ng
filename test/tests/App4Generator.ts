import test from 'ava';
import * as tmp from 'tmp';
import * as yo from 'yeoman-test';
import {instantiateApp4} from "../util/instantiate-generator";
import {get4appPrompts, libs} from "../util/get4appPrompts";
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import {TmpDir} from "../util/TmpDir";
import {get} from 'lodash';

tmp.setGracefulCleanup();


let tmpdir: TmpDir;
let pkg: any;

const templateRoot = path.resolve(__dirname, '../../generators/app-4/templates');

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
  const app = instantiateApp4();
  yo.mockPrompt(app, get4appPrompts());

  app.run(t.end);
});

test.before.cb.serial(t => {
  fs.readFile(path.join(tmpdir.dir, 'package.json'), 'utf8', (e: any, data: string) => {
    if (e) {
      (<any>t).end(e);
    } else {
      pkg = JSON.parse(data);
      t.end();
    }
  });
});

test.after("Removing temp dir", () => {
  if (tmpdir && tmpdir.clean) {
    tmpdir.clean();
  }
});

const rootFiles = glob.sync(path.join(templateRoot, '*.*'))
  .map(f => path.relative(templateRoot, f))
  .concat(
    'LICENSE',
    'package.json',
    '.git',
    '.travis.yml',
    '.gitignore',
    '.npmignore',
    'README.md',
    '.yo-rc.json',
    'webpack.config.js'
  );

const srcFiles = glob.sync(path.join(templateRoot, 'src', '**', '*'))
  .map(f => path.relative(templateRoot, f));

const buildFiles = glob.sync(path.join(templateRoot, 'build', '**', '*'))
  .map(f => path.relative(templateRoot, f))
  .concat(path.join('build', 'demo-server.js'));

rootFiles.concat(...srcFiles, ...buildFiles)
  .forEach(f => {
    test.cb(`${f} exists`, t => {
      fs.access(path.join(tmpdir.dir, f), fs.constants.F_OK, (e: any) => {
        if (e) {
          t.fail();
        } else {
          t.pass();
        }

        t.end();
      });
    });
  });

test.cb("node_modules doesn't exist", t => {
  fs.access(path.join(tmpdir.dir, 'node_modules'), fs.constants.F_OK, (e: any) => {
    if (e) {
      t.pass();
    } else {
      t.fail();
    }

    t.end();
  });
});

test("package.json name", t => t.is(pkg.name, 'app-4-generator-unit-test'));
test("package.json desc", t => t.is(pkg.description, 'app-4-generator-unit-test-desc'));
test("package.json private", t => t.false(pkg.private));
test('package.json author: name', t => t.is(get(pkg, 'author.name'), 'Alorel'));
test('package.json author: url', t => t.is(get(pkg, 'author.url'), 'http://foo'));
test('package.json author: email', t => t.is(get(pkg, 'author.email'), 'foo@bar.com'));

test('package.json repo', t => {
  t.is(get(pkg, 'repository.url'), 'git+https://github.com/Alorel/foo-bar.git')
});

test('package.json homepage', t => t.is(pkg.homepage, 'http://bar.com'));
test('package.json bugs', t => t.is(get(pkg, 'bugs.url'), 'https://foo.com'));

for (const lib of libs.concat('@ngrx/store-devtools')) {
  test(`package.json dev dependencies include ${lib}`, t => {
    t.true(lib in pkg.devDependencies);
  });

  test(`package.json peer dependencies include ${lib}`, t => {
    t.true(lib in pkg.peerDependencies);
  });
}

test.cb('README', t => {
  fs.readFile(path.join(tmpdir.dir, 'README.md'), 'utf8', (e: any, data: string) => {
    if (e) {
      (<any>t).end(e);
    } else {
      t.true(data.includes('app-4-generator-unit-test'));
      t.end()
    }
  });
});

test.cb('webpack.config.js', t => {
  fs.readFile(path.join(tmpdir.dir, 'webpack.config.js'), 'utf8', (e: any, data: string) => {
    if (e) {
      (<any>t).end(e);
    } else {
      t.true(data.includes('MyUnitTestLib'));
      t.end()
    }
  });
});

test.cb('demo-server.js', t => {
  fs.readFile(path.join(tmpdir.dir, 'build', 'demo-server.js'), 'utf8', (e: any, data: string) => {
    if (e) {
      (<any>t).end(e);
    } else {
      t.true(data.includes('5555'));
      t.end()
    }
  });
});