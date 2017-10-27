import * as Generator from 'yeoman-generator';

export = class extends Generator {
  initializing() {
    this.composeWith(require.resolve('./PackageJSONGenerator'), {});
  }
};
