import chalk from 'chalk';
import * as moment from 'moment';

const pad = require("pad");

const timestamp = (): string => {
  const now = moment();
  const h = pad(2, now.get('hours'), '0');
  const m = pad(2, now.get('minutes'), '0');
  const s = pad(2, now.get('seconds'), '0');
  const ms = pad(3, now.get('ms'), '0');

  return chalk.bold(`[${h}:${m}:${s}.${ms}] `);
};

export const Log = Object.freeze({
  info(msg: string): void {
    console.log(timestamp() + msg);
  },
  success(msg: string): void {
    console.log(timestamp() + chalk.green(msg));
  },
  debug(msg: string): void {
    console.log(chalk.gray(timestamp() + msg));
  },
  warn(msg: string): void {
    console.log(timestamp() + chalk.yellow(msg));
  },
  err(msg: string): void {
    console.log(timestamp() + chalk.red(msg));
  },
});