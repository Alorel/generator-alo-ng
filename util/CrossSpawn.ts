import {spawn, SpawnOptions} from "child_process";
import {merge} from 'lodash';

const xSpawn: typeof spawn = require('cross-spawn');

export function crossSpawn(command: string, args: string[] = [], options: SpawnOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    let errored: boolean = false;

    xSpawn(command, args, merge({
      cwd: process.cwd(),
      stdio: 'inherit'
    }, options))
      .once('error', err => {
        errored = true;
        reject(err);
      })
      .once('exit', (code: number) => {
        if (!errored) {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Exited with code ${code}`));
          }
        }
      });
  });
}
