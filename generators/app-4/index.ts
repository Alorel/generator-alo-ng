import * as Generator from 'yeoman-generator';
import {getPrompts} from "./prompts";
import {ConfigKey} from "../../util/ConfigKey";
import {crossSpawn} from "../../util/CrossSpawn";

class Ng4LibGenerator extends Generator {

  private promptAnswers: any = {};

  async prompting() {
    this.promptAnswers = await this.prompt(await getPrompts(this));

    this.composeWith(require.resolve('generator-license'), {
      name: this.promptAnswers[ConfigKey.packageAuthorName],
      email: this.promptAnswers[ConfigKey.packageAuthorEmail],
      website: this.promptAnswers[ConfigKey.homepage],
      defaultLicense: 'MIT',
      licensePrompt: "What license do you want to use?"
    });
  }

  configuring() {
    this.config.defaults(this.promptAnswers);
  }

  get _packageAuthor(): { name: string, url: string, email: string } {
    const name: string = this.promptAnswers[ConfigKey.packageAuthorName];
    const url: string = this.promptAnswers[ConfigKey.packageAuthorUrl];
    const email: string = this.promptAnswers[ConfigKey.packageAuthorEmail];

    return {name, url, email};
  }

  get _packageJSON() {
    const pkg = this.fs.readJSON(this.templatePath('_manual/package.json'));

    pkg.name = this.promptAnswers[ConfigKey.packageName];
    pkg.description = this.promptAnswers[ConfigKey.packageDescription];
    pkg['private'] = !!this.promptAnswers[ConfigKey.packagePrivate];
    pkg.author = this._packageAuthor;

    if (this.promptAnswers[ConfigKey.gitRepo]) {
      pkg.repository = {
        type: 'git',
        url: `git+${this.promptAnswers[ConfigKey.gitRepo]}`
      };
    }

    if (this.promptAnswers[ConfigKey.homepage]) {
      pkg.homepage = this.promptAnswers[ConfigKey.homepage];
    }

    if (this.promptAnswers[ConfigKey.bugsUrl]) {
      pkg.bugs = {
        url: this.promptAnswers[ConfigKey.bugsUrl]
      };
    }

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

  writing() {
    this.fs.writeJSON(
      this.destinationPath('package.json'),
      this._packageJSON,
      null,
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

  async install() {
    if (this.promptAnswers[ConfigKey.installDeps]) {
      await crossSpawn('npm', ['install'], {
        cwd: this.destinationRoot()
      });
    } else {
      this.log('Skipping dependency installation');
    }
  }
}

export = Ng4LibGenerator;