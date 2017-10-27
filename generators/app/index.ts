import {AloGenerator} from "../../util/AloGenerator";
import {ConfigKey} from "../../util/ConfigKey";
import {Question} from "inquirer";
import {Log} from "../../util/Log";
import * as fs from "fs";
import {crossSpawn} from "../../util/CrossSpawn";

class AloNg4ComponentGenerator extends AloGenerator {

  private githubUsernamePromise: Promise<string | null>;

  initializing() {
    if (!this.cfg.has(ConfigKey.GITHUB_ENABLED) && !this.cfg.has(ConfigKey.GITHUB_USERNAME)) {
      if (this.cfg.has(ConfigKey.GITHUB_DEFAULT_USERNAME)) {
        this.githubUsernamePromise = Promise.resolve(this.cfg.get(ConfigKey.GITHUB_DEFAULT_USERNAME));
      } else {
        this.githubUsernamePromise = this.user.github.username()
          .then(u => {
            if (!u) {
              u = null;
            }

            this.cfg.set(ConfigKey.GITHUB_DEFAULT_USERNAME, u);
            return u;
          })
          .catch(() => null);
      }
    } else {
      this.githubUsernamePromise = Promise.resolve(null);
    }
  }

  end() {
    Log.success("Done!");
  }

  initPackageName() {
    return this.askOnce(
      ConfigKey.PACKAGE_NAME,
      "What's the name of your package?",
      {
        validate(input: string): boolean | string {
          input = input.trim();
          if (!input.length || input.match(/[A-Z]/)) {
            return 'Name must be lowercase';
          }
          return true;
        },
        'default': this.determineAppname()
      }
    );
  }

  initPackageDescription() {
    return this.askOnce(
      ConfigKey.PACKAGE_DESC,
      "Package description:",
      {
        validate(inp: string): boolean | string {
          if (!inp.trim().length) {
            return 'This is required.';
          }
          return true;
        }
      }
    )
  }

  initPackagePrivate() {
    return this.askOnce(
      ConfigKey.PACKAGE_PRIVATE,
      "Should the package be private?",
      {type: 'confirm', 'default': false}
    );
  }

  async initAuthor() {
    await this.askOnce(ConfigKey.PACKAGE_AUTHOR_NAME, "What's your name?");
    await this.askOnce(ConfigKey.PACKAGE_AUTHOR_EMAIL, "What's your email?");
    await this.askOnce(ConfigKey.PACKAGE_AUTHOR_URL, "What's your URL?");
  }

  async initGithub() {
    const isOnGithub: boolean = await this.askOnce<boolean>(
      ConfigKey.GITHUB_ENABLED,
      "Will you be using GitHub?",
      {
        type: 'confirm'
      }
    );

    if (isOnGithub) {
      const usernameDefault: string = await this.githubUsernamePromise;
      const opts: Question = {};

      if (usernameDefault) {
        opts.default = usernameDefault;
      }

      await this.askOnce(ConfigKey.GITHUB_USERNAME, "What's your GitHub username?", opts);
      await this.askOnce(ConfigKey.GITHUB_REPO, "What's your GitHub repository name?");
    }
  }

  initHomepage() {
    const user: string = this.cfg.get(ConfigKey.GITHUB_USERNAME);
    const repo: string = this.cfg.get(ConfigKey.GITHUB_REPO);

    const opts: Question = {};

    if (user && repo) {
      opts.default = `https://github.com/${user}/${repo}`;
    }

    return this.askOnce(
      ConfigKey.HOMEPAGE,
      "What will be the homepage?",
      opts
    );
  }

  initLicense() {
    return this.askOnce(
      ConfigKey.PACKAGE_LICENSE,
      "What license will your project be under?",
      {'default': 'MIT'}
    );
  }

  initLibName() {
    return this.askOnce(
      ConfigKey.LIB_GLOBAL_NAME,
      "What's the UMD global name of your library?",
      {
        validate(i: string) {
          if (!i.trim().length) {
            return 'This field is required';
          }
          return true;
        }
      }
    )
  }

  initDemoPort() {
    return this.askOnce(
      ConfigKey.DEMO_PORT,
      "What port do you want the demo server to run on?",
      {
        'default': '1111',
        validate(s: string): boolean | string {
          if (!s.trim().length) {
            return "This field is required";
          }

          if (!s.match(/^[0-9]{1,5}$/)) {
            return "This must be numeric";
          }

          const i = parseInt(s, 10);

          if (i < 1) {
            return "Must be >= 1";
          }

          if (i > 65535) {
            return "Must be <= 65535";
          }

          return true;
        }
      }
    );
  }

  private get _authorField(): string | object {
    const name: string = this.cfg.get(ConfigKey.PACKAGE_AUTHOR_NAME);
    const email: string = this.cfg.get(ConfigKey.PACKAGE_AUTHOR_EMAIL);
    const url: string = this.cfg.get(ConfigKey.PACKAGE_AUTHOR_URL);

    if (!name && !email && !url) {
      return '';
    } else if (name && !email && !url) {
      return name;
    } else {
      const ret: any = {};

      if (name) {
        ret.name = name;
      }
      if (email) {
        ret.email = email;
      }
      if (url) {
        ret.url = url;
      }

      return ret;
    }
  }

  private _writePackageJSON() {
    const pkgJsonPath = this.destinationPath('package.json');

    if (!this.fs.exists(pkgJsonPath)) {
      const pkg: any = this.fs.readJSON(this.templatePath('_manual', 'package.json'));

      pkg.name = this.cfg.get(ConfigKey.PACKAGE_NAME);
      pkg.description = this.cfg.get(ConfigKey.PACKAGE_DESC);
      pkg['private'] = !!this.cfg.get(ConfigKey.PACKAGE_PRIVATE);
      pkg.author = this._authorField;

      const ghUsername: string = this.cfg.get(ConfigKey.GITHUB_USERNAME);
      const ghRepo: string = this.cfg.get(ConfigKey.GITHUB_REPO);

      if (ghUsername && ghRepo) {
        pkg.repository = {
          type: 'git',
          url: `git+https://github.com/${ghUsername}/${ghRepo}.git`
        };
      }

      pkg.homepage = this.cfg.get(ConfigKey.HOMEPAGE);
      pkg.license = this.cfg.get(ConfigKey.PACKAGE_LICENSE);

      const json = JSON.stringify(pkg, null, 2);
      this.fs.write(pkgJsonPath, json);
    } else {
      Log.warn('Skipping package.json generation: already exists');
    }
  }

  private _writeManuals() {
    this.fs.copyTpl(
      this.templatePath('_manual', 'README.md'),
      this.destinationPath('README.md'),
      {LIB_NAME: this.cfg.get(ConfigKey.PACKAGE_NAME)}
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
      {GLOBAL_LIB_NAME: this.cfg.get(ConfigKey.LIB_GLOBAL_NAME)}
    );
  }

  async writing() {
    this._writePackageJSON();
    const packageJsonWritePromise = this.commit();

    const shouldWrite: boolean = (await this.prompt({
      name: 'v',
      message: "Do you want to begin writing files? Any existing files will be overridden.",
      type: 'confirm',
      'default': false
    })).v;

    await packageJsonWritePromise;

    if (shouldWrite) {
      this._writeManuals();
      this.fs.copy(this.templatePath('*'), this.destinationPath());
      this.fs.copy(this.templatePath('src', '**', '*'), this.destinationPath('src'));
      this.fs.copy(this.templatePath('build', '**', '*'), this.destinationPath('build'));

      await this.commit();
    } else {
      Log.err('Aborting');
      process.exit(0);
    }
  }

  async install() {
    if (!fs.existsSync(this.destinationPath('node_modules'))) {
      const shouldInstall: boolean = (await this.prompt({
        name: 'v',
        message: 'Would you like to install project dependencies?',
        type: 'confirm',
        'default': true
      })).v;

      if (shouldInstall) {

        Log.info('Installing dependencies...');
        await crossSpawn('npm', ['install'], {
          cwd: this.destinationRoot()
        });
        Log.success('Dependencies installed!');
      } else {
        Log.info('Skipping dependency installation');
      }
    } else {
      Log.warn('Skipping installation: node_modules already exists');
    }
  }
}

export = AloNg4ComponentGenerator;

