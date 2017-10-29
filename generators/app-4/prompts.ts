import {Answers, Question} from "inquirer";
import {ConfigKey} from "../../util/ConfigKey";
import * as Generator from 'yeoman-generator';

function notEmptyValidator(i: string): string | boolean {
  if (!i) {
    return "This field is required";
  }

  return true;
}

export type Prompt = Question & { save?: boolean };

export async function getPrompts(gen: Generator): Promise<Prompt[]> {
  let ghName: string | undefined;

  try {
    ghName = await gen.user.github.username();
  } catch {
    ghName = undefined;
  }

  return <any>Object.freeze(<Prompt[]>[
    {
      name: ConfigKey.packageName,
      message: "What's your package name?",
      validate: notEmptyValidator,
      save: true,
      'default': () => {
        return gen.config.get(ConfigKey.packageName) ||
          gen.determineAppname() ||
          undefined;
      }
    },
    {
      name: ConfigKey.packageDescription,
      save: true,
      message: "Input your package description",
      validate: notEmptyValidator
    },
    {
      name: ConfigKey.packagePrivate,
      type: 'confirm',
      save: true,
      message: "Will this package be private?"
    },
    {
      name: ConfigKey.packageAuthorName,
      message: "What's the package author's name?",
      save: true,
      'default': () => {
        if (gen.config.get(ConfigKey.packageAuthorName)) {
          return gen.config.get(ConfigKey.packageAuthorName);
        } else if (gen.user.git.name()) {
          return gen.user.git.name();
        } else if (ghName) {
          return ghName;
        }
      }
    },
    {
      name: ConfigKey.packageAuthorEmail,
      save: true,
      message: "What's the package author's email?",
      'default': () => {
        if (gen.config.get(ConfigKey.packageAuthorEmail)) {
          return gen.config.get(ConfigKey.packageAuthorEmail);
        } else if (gen.user.git.email()) {
          return gen.user.git.email();
        }
      }
    },
    {
      name: ConfigKey.usingGit,
      save: true,
      message: "Will you be using git?",
      type: 'confirm',
    },
    {
      name: ConfigKey.githubEnabled,
      save: true,
      message: "Will you be using GitHub?",
      type: 'confirm',
      when: (a: Answers): boolean => !!a[ConfigKey.usingGit]
    },
    {
      name: ConfigKey.githubUsername,
      save: true,
      message: "What's your github username?",
      when: (a: Answers): boolean => !!a[ConfigKey.githubEnabled],
      'default': (a: Answers) => {
        return gen.config.get(ConfigKey.githubUsername) ||
          ghName ||
          a[ConfigKey.packageAuthorName] ||
          gen.user.git.name() ||
          undefined;
      }
    },
    {
      name: ConfigKey.githubRepo,
      save: true,
      message: "What's the github repo name for this project?",
      when: (a: Answers): boolean => !!a[ConfigKey.githubEnabled],
      'default': (a: Answers) => {
        return gen.config.get(ConfigKey.githubRepo) ||
          a[ConfigKey.packageName] ||
          gen.determineAppname() ||
          undefined;
      }
    },
    {
      name: ConfigKey.packageAuthorUrl,
      save: true,
      message: "What's the package author's URL?",
      'default': (a: Answers) => {
        if (gen.config.get(ConfigKey.packageAuthorUrl)) {
          return gen.config.get(ConfigKey.packageAuthorUrl);
        }

        if (a[ConfigKey.githubUsername]) {
          return `https://${a[ConfigKey.githubUsername].toLowerCase()}.github.io`;
        }
      }
    },
    {
      name: ConfigKey.bugsUrl,
      save: true,
      message: "What's the package bugs URL?",
      'default': (a: Answers) => {
        const u: string = a[ConfigKey.githubUsername];
        const r: string = a[ConfigKey.githubRepo];

        if (u && r) {
          return `https://github.com/${u}/${r}/issues`;
        }
      }
    },
    {
      name: ConfigKey.homepage,
      save: true,
      message: "What's the package's homepage?",
      'default': (a: Answers) => {
        const u: string = a[ConfigKey.githubUsername];
        const r: string = a[ConfigKey.githubRepo];

        if (u && r) {
          return `https://github.com/${u}/${r}`;
        }
      }
    },
    {
      name: ConfigKey.gitRepo,
      save: true,
      message: "What's the git repo URL of this package?",
      when: (a: Answers): boolean => !!a[ConfigKey.usingGit],
      'default': (a: Answers) => {
        const u: string = a[ConfigKey.githubUsername];
        const r: string = a[ConfigKey.githubRepo];

        if (u && r) {
          return `https://github.com/${u}/${r}.git`;
        }
      },
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
      name: ConfigKey.demoPort,
      save: true,
      message: "What's the port your local demo server will run on?",
      'default': () => gen.config.get(ConfigKey.demoPort) || '1111',
      validate(i: string): boolean | string {
        if (!/^[\d]{1,5}$/.test(i)) {
          return "Must be numeric";
        } else {
          const n = parseInt(i, 10);

          if (n < 1) {
            return "Must be >= 1";
          } else if (n > 65535) {
            return "Must be <= 65535";
          }
        }
        return true;
      }
    },
    {
      name: ConfigKey.libGlobalName,
      save: true,
      message: "What's the UMD global name of your package?",
      validate(i: string): boolean | string {
        if (!i) {
          return "This field is required";
        }

        return true;
      }
    },
    {
      type: 'checkbox',
      name: ConfigKey.extraLibs,
      save: true,
      message: 'Do you want to have any of these additional libraries as a peer dependency?',
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
      ]
    },
    {
      type: 'confirm',
      name: ConfigKey.installDeps,
      save: true,
      message: "Would you like to install project dependencies?"
    }
  ]);
}
