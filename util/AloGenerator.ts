import * as Generator from 'yeoman-generator';
import {ConfigRepository} from "./ConfigRepository";
import {Question} from "inquirer";
import {ConfigKey} from "./ConfigKey";
import {Log} from "./Log";
import chalk from "chalk";

export class AloGenerator extends Generator {

  protected readonly cfg: ConfigRepository;

  constructor(args: string | string[], options: {}) {
    super(args, options);
    this.cfg = new ConfigRepository(this.config);
  }

  protected commit(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fs.commit((e: any) => {
        if (e) {
          if (!(e instanceof Error)) {
            e = new Error(e.toString());
          }

          reject(e);
        } else {
          resolve();
        }
      });
    });
  }

  protected async askOnce<T>(key: ConfigKey, question: string, opts: Question = {}): Promise<T> {
    if (this.cfg.has(key)) {
      const val: any = this.cfg.get(key);

      Log.debug(`${chalk.bold(question)}: ${chalk.underline(typeof val === 'string' ? val : JSON.stringify(val))}`);
      return val;
    }

    const p = await this.prompt(Object.assign(
      {
        name: 'v',
        message: question,
      },
      opts
    ));

    this.cfg.set(key, p.v);
    return p.v;
  }
}