import {Answers, Question} from 'inquirer';
import * as Generator from 'yeoman-generator';
import {ConfigKey} from '../../util/ConfigKey';

function notEmptyValidator(i: string): string | boolean {
  if (!i) {
    return 'This field is required';
  }

  return true;
}

export async function getPrompts(gen: Generator): Promise<Question[]> {
  let ghName: string | undefined;

  try {
    ghName = await gen.user.github.username();
  } catch {
    ghName = undefined;
  }

  return <any>Object.freeze(<Question[]>[
    {
      default: () => {
        return gen.config.get(ConfigKey.packageName) ||
          gen.determineAppname() ||
          undefined;
      },
      message: "What's your package name?",
      name: ConfigKey.packageName,
      validate: notEmptyValidator
    },
    {
      message: 'Input your package description',
      name: ConfigKey.packageDescription,
      validate: notEmptyValidator
    },
    {
      message: 'Will this package be private?',
      name: ConfigKey.packagePrivate,
      type: 'confirm'
    },
    {
      default: () => {
        if (gen.config.get(ConfigKey.packageAuthorName)) {
          return gen.config.get(ConfigKey.packageAuthorName);
        } else if (gen.user.git.name()) {
          return gen.user.git.name();
        } else if (ghName) {
          return ghName;
        }
      },
      message: "What's the package author's name?",
      name: ConfigKey.packageAuthorName
    },
    {
      default: () => {
        if (gen.config.get(ConfigKey.packageAuthorEmail)) {
          return gen.config.get(ConfigKey.packageAuthorEmail);
        } else if (gen.user.git.email()) {
          return gen.user.git.email();
        }
      },
      message: "What's the package author's email?",
      name: ConfigKey.packageAuthorEmail
    },
    {
      message: 'Will you be using git?',
      name: ConfigKey.usingGit,
      type: 'confirm',
    },
    {
      message: 'Will you be using GitHub?',
      name: ConfigKey.githubEnabled,
      type: 'confirm',
      when: (a: Answers): boolean => !!a[ConfigKey.usingGit]
    },
    {
      default: (a: Answers) => {
        return gen.config.get(ConfigKey.githubUsername) ||
          ghName ||
          a[ConfigKey.packageAuthorName] ||
          gen.user.git.name() ||
          undefined;
      },
      message: "What's your github username?",
      name: ConfigKey.githubUsername,
      when: (a: Answers): boolean => !!a[ConfigKey.githubEnabled]
    },
    {
      default: (a: Answers) => {
        return gen.config.get(ConfigKey.githubRepo) ||
          a[ConfigKey.packageName] ||
          gen.determineAppname() ||
          undefined;
      },
      message: "What's the github repo name for this project?",
      name: ConfigKey.githubRepo,
      when: (a: Answers): boolean => !!a[ConfigKey.githubEnabled],
    },
    {
      default: (a: Answers) => {
        if (gen.config.get(ConfigKey.packageAuthorUrl)) {
          return gen.config.get(ConfigKey.packageAuthorUrl);
        }

        if (a[ConfigKey.githubUsername]) {
          return `https://${a[ConfigKey.githubUsername].toLowerCase()}.github.io`;
        }
      },
      message: "What's the package author's URL?",
      name: ConfigKey.packageAuthorUrl
    },
    {
      default: (a: Answers) => {
        const u: string = a[ConfigKey.githubUsername];
        const r: string = a[ConfigKey.githubRepo];

        if (u && r) {
          return `https://github.com/${u}/${r}/issues`;
        }
      },
      message: "What's the package bugs URL?",
      name: ConfigKey.bugsUrl
    },
    {
      default: (a: Answers) => {
        const u: string = a[ConfigKey.githubUsername];
        const r: string = a[ConfigKey.githubRepo];

        if (u && r) {
          return `https://github.com/${u}/${r}`;
        }
      },
      message: "What's the package's homepage?",
      name: ConfigKey.homepage
    },
    {
      default: (a: Answers) => {
        const u: string = a[ConfigKey.githubUsername];
        const r: string = a[ConfigKey.githubRepo];

        if (u && r) {
          return `https://github.com/${u}/${r}.git`;
        }
      },
      message: "What's the git repo URL of this package?",
      name: ConfigKey.gitRepo,
      when: (a: Answers): boolean => !!a[ConfigKey.usingGit],
      validate(i: string): boolean | string {
        const lc = i.toLowerCase();

        if (!i.endsWith('.git')) {
          return 'Must end with ".git"';
        } else if (!lc.startsWith('http') && !lc.startsWith('ftp')) {
          return 'Must start with "http" or "ftp"';
        }

        return true;
      }
    },
    {
      default: () => gen.config.get(ConfigKey.demoPort) || '1111',
      message: "What's the port your local demo server will run on?",
      name: ConfigKey.demoPort,
      validate(i: string): boolean | string {
        if (!/^[\d]{1,5}$/.test(i)) {
          return 'Must be numeric';
        } else {
          const radix = 1;
          const limit = 65535;

          const n = parseInt(i, radix);

          if (n < 1) {
            return 'Must be >= 1';
          } else if (n > limit) {
            return `Must be <= ${limit}`;
          }
        }

        return true;
      }
    },
    {
      message: "What's the UMD global name of your package?",
      name: ConfigKey.libGlobalName,
      validate(i: string): boolean | string {
        if (!i) {
          return 'This field is required';
        }

        return true;
      }
    },
    {
      choices: [
        '@angular/animations',
        '@angular/cdk',
        '@angular/forms',
        '@angular/http',
        '@angular/material',
        '@angular/router',
        '@ngrx/core',
        '@ngrx/effects',
        '@ngrx/store'
      ],
      message: 'Do you want to have any of these additional libraries as a peer dependency?',
      name: ConfigKey.extraLibs,
      type: 'checkbox'
    },
    {
      message: 'Would you like to install project dependencies?',
      name: ConfigKey.installDeps,
      type: 'confirm'
    }
  ]);
}
