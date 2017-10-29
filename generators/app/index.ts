import * as Generator from 'yeoman-generator';
import {Answers} from "inquirer";

const supportedVersions = [4];

class AppGenerator extends Generator {

  private promptAnswers: Answers = {};

  constructor(args: string | string[], options: {}) {
    super(args, options);

    this.option('version', {
      alias: 'v',
      description: `Which Angular version to use? Supported versions: ${supportedVersions.join(', ')}`,
      type: Number
    });
  }

  get _version(): number {
    return parseInt(this.options['version'] || this.promptAnswers.version);
  }

  async prompting() {
    this.promptAnswers = await this.prompt({
      type: 'list',
      name: 'version',
      message: "Which version of Angular do you want to use?",
      when: () => !this._version,
      choices: [
        '4'
      ]
    });

    if (!this._version || isNaN(this._version) || !supportedVersions.includes(this._version)) {
      throw new Error(`Unsupported Angular version: ${this._version}. Supported versions: ${supportedVersions.join(', ')}`);
    }
  }

  end() {
    this.composeWith(
      require.resolve('../app-4'),
      {}
    )
  }
}

export = AppGenerator;
