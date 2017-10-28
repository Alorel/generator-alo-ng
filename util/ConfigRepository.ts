import {Storage} from "yeoman-generator";
import {get, set} from 'lodash';
import {ConfigKey} from "./ConfigKey";

export class ConfigRepository {

  /** @internal */
  private readonly store: Storage;

  constructor(store: Storage) {
    this.store = store;
  }

  /** @internal */
  private static formatKeyPath(kp: string | string[]): string[] {
    if (Array.isArray(kp)) {
      return kp;
    }

    return kp.split(/\s*\.\s*/);
  }

  has(key: ConfigPath): boolean {
    return this.get(key) !== undefined;
  }

  set(keyOrPath: ConfigPath, value: any): void {
    if (keyOrPath) {
      const path = ConfigRepository.formatKeyPath(keyOrPath);

      if (path.length) {
        if (path.length === 1) {
          this.store.set(path[0], value);
          this.store.save();
        } else {
          const existingValue = this.store.get(path[0]) || {};

          set(existingValue, path.slice(1), value);

          this.store.set(path[0], existingValue);
          this.store.save();
        }

        return;
      }
    }

    throw new Error('key/path must be provided');
  }

  get<T>(pathOrKey: ConfigPath): T | null {
    if (!pathOrKey) {
      return null;
    }

    const path = ConfigRepository.formatKeyPath(pathOrKey);

    if (!path.length) {
      return null;
    } else if (path.length === 1) {
      return this.store.get(path[0]);
    } else {
      const root: any = this.store.get(path[0]);

      return get(root, path.slice(1));
    }
  }
}

export type ConfigPath = string | string[] | ConfigKey;