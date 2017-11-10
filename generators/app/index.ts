import {Answers} from 'inquirer';
import * as Generator from 'yeoman-generator';

// tslint:disable-next-line:no-magic-numbers
const supportedVersions = [4];

class AppGenerator extends Generator {

  private promptAnswers: Answers = {};

  public constructor(args: string | string[], options: {}) {
    super(args, options);

    this.option('version', {
      alias: 'v',
      description: `Which Angular version to use? Supported versions: ${supportedVersions.join(', ')}`,
      type: Number
    });
  }

  public get _version(): number {
    // tslint:disable-next-line:no-magic-numbers
    return parseInt(this.options['version'] || this.promptAnswers.version, 10);
  }

  public async prompting() {
    this.promptAnswers = await this.prompt({
      choices: [
        '4'
      ],
      message: 'Which version of Angular do you want to use?',
      name: 'version',
      type: 'list',
      when: () => !this._version
    });

    if (!this._version || isNaN(this._version) || !supportedVersions.includes(this._version)) {
      throw new Error(
        `Unsupported Angular version: ${this._version}. Supported versions: ${supportedVersions.join(', ')}`
      );
    }
  }

  public end() {
    this.composeWith(
      require.resolve('../app-4'),
      {}
    );
  }
}

export = AppGenerator;
