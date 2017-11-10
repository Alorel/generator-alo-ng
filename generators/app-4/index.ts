import {mkdirSync, writeFileSync} from 'fs';
import {forEach} from 'lodash';
import * as Generator from 'yeoman-generator';
import {ConfigKey} from '../../util/ConfigKey';
import {crossSpawn} from '../../util/CrossSpawn';
import {getPrompts} from './prompts';

class Ng4LibGenerator extends Generator {

  private promptAnswers: any = {};

  public async prompting() {
    this.promptAnswers = await this.prompt(await getPrompts(this));

    forEach(this.promptAnswers, (v: any, k: string) => {
      this.config.set(k, v);
    });
    this.config.save();

    this.composeWith(require.resolve('generator-license'), {
      defaultLicense: 'MIT',
      email: this.promptAnswers[ConfigKey.packageAuthorEmail],
      licensePrompt: 'What license do you want to use?',
      name: this.promptAnswers[ConfigKey.packageAuthorName],
      website: this.promptAnswers[ConfigKey.homepage]
    });
  }

  public get _packageAuthor(): { name: string; url: string; email: string } {
    const name: string = this.promptAnswers[ConfigKey.packageAuthorName];
    const url: string = this.promptAnswers[ConfigKey.packageAuthorUrl];
    const email: string = this.promptAnswers[ConfigKey.packageAuthorEmail];

    return {name, url, email};
  }

  public get _packageJSON() {
    const pkg = this.fs.readJSON(this.templatePath('_manual/package.json'));

    pkg.name = this.promptAnswers[ConfigKey.packageName];
    pkg.description = this.promptAnswers[ConfigKey.packageDescription];
    pkg['private'] = !!this.promptAnswers[ConfigKey.packagePrivate];
    pkg.author = this._packageAuthor;

    pkg.repository = {
      type: 'git',
      url: `git+${this.promptAnswers[ConfigKey.gitRepo]}`
    };

    pkg.homepage = this.promptAnswers[ConfigKey.homepage];

    pkg.bugs = {
      url: this.promptAnswers[ConfigKey.bugsUrl]
    };

    const ANGULAR_STD_VERSION = '^4.4';
    const ANGULAR_MATERIAL_VERSION = '^2.0.0-beta.12';
    const NGRX_STD_VERSION = '^4.1';

    const libs = {
      '@angular/animations': ANGULAR_STD_VERSION,
      '@angular/cdk': ANGULAR_MATERIAL_VERSION,
      '@angular/forms': ANGULAR_STD_VERSION,
      '@angular/http': ANGULAR_STD_VERSION,
      '@angular/material': ANGULAR_MATERIAL_VERSION,
      '@angular/router': ANGULAR_STD_VERSION,
      '@ngrx/core': '^1.2',
      '@ngrx/effects': NGRX_STD_VERSION,
      '@ngrx/store': NGRX_STD_VERSION,
      '@ngrx/store-devtools': '^4.0',
    };

    const extraLibs = (this.promptAnswers[ConfigKey.extraLibs] || [])
      .filter((l: string) => l in libs);

    if (extraLibs.includes('@ngrx/store') && !extraLibs.includes('@ngrx/store-devtools')) {
      extraLibs.push('@ngrx/store-devtools');
    }

    for (const lib of extraLibs) {
      pkg.peerDependencies[lib] = libs[lib];
      pkg.devDependencies[lib] = libs[lib];
    }

    return pkg;
  }

  public async writing() {
    this.fs.writeJSON(
      this.destinationPath('package.json'),
      this._packageJSON,
      null,
      // tslint:disable-next-line:no-magic-numbers
      2
    );

    this.fs.copy(
      this.templatePath('_manual', 'gitignore'),
      this.destinationPath('.gitignore')
    );

    this.fs.copy(
      this.templatePath('_manual', 'npmignore'),
      this.destinationPath('.npmignore')
    );

    this.fs.copyTpl(
      this.templatePath('_manual', 'webpack.config.js'),
      this.destinationPath('webpack.config.js'),
      {GLOBAL_LIB_NAME: this.promptAnswers[ConfigKey.libGlobalName]}
    );

    this.fs.copyTpl(
      this.templatePath('_manual', 'README.md'),
      this.destinationPath('README.md'),
      {LIB_NAME: this.promptAnswers[ConfigKey.packageName]}
    );

    this.fs.copyTpl(
      this.templatePath('_manual', 'demo-server.js'),
      this.destinationPath('build', 'demo-server.js'),
      {DEMO_PORT: this.promptAnswers[ConfigKey.demoPort]}
    );

    this.fs.copy(
      this.templatePath('_manual', '.travis.yml'),
      this.destinationPath('.travis.yml')
    );

    this.fs.copy(
      this.templatePath('root', '*'),
      this.destinationPath()
    );

    this.fs.copy(
      this.templatePath('src', '**', '*'),
      this.destinationPath('src')
    );

    this.fs.copy(
      this.templatePath('build', '**', '*'),
      this.destinationPath('build')
    );
  }

  public async _setupGit() {
    if (this.promptAnswers[ConfigKey.usingGit]) {
      await crossSpawn('git', ['init'], {
        cwd: this.destinationRoot()
      });
      await crossSpawn('git', ['add', '.'], {
        cwd: this.destinationRoot()
      });

      if (this.promptAnswers[ConfigKey.gitRepo]) {
        await crossSpawn('git', [
          'remote',
          'add',
          'origin',
          this.promptAnswers[ConfigKey.gitRepo]
        ],               {
          cwd: this.destinationRoot()
        });
      }
    }
  }

  public async install() {
    await this._setupGit();

    if (this.promptAnswers[ConfigKey.installDeps]) {
      if ('ALO_NG_MOCK_INSTALL' in process.env) {
        mkdirSync(this.destinationPath('node_modules'));
        writeFileSync(this.destinationPath('package-lock.json'), '{}');
      } else {
        await crossSpawn('npm', ['install'], {
          cwd: this.destinationRoot()
        });
      }

      if (this.promptAnswers[ConfigKey.usingGit]) {
        await crossSpawn('git', ['add', '.'], {
          cwd: this.destinationRoot()
        });
      }
    } else {
      this.log('Skipping dependency installation');
    }
  }
}

export = Ng4LibGenerator;
