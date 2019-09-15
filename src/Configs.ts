import fs from 'fs-extra';
import path from 'path';
import { Value } from './Value';
import yaml from 'js-yaml';

export class Configs {
  private _values: Record<string, Value> = {};

  /**
   * Define a new configuration value.
   *
   * @param keys Key or keys to refer to the value by.
   */
  define(keys: string|string[]): Value {
    const def = new Value(this, keys);

    for (const key of keys) {
      if (this._values[key]) {
        throw new Error(`Already defined: ${key}`);
      }
      this._values[key] = def;
    }

    return def;
  }

  setEnv(env: Record<string, unknown>): void {
    Object.entries(this._values).forEach(([, value]) => {
      value.setFromEnv(env);
    });
  }

  /**
   * Set multiple values at once.
   *
   * @param source Key-value pairs to set.
   */
  setMany(source: Record<string, unknown>): void {
    Object.entries(this._values).forEach(([, value]) => {
      value.setFromObj(source);
    });
  }

  /**
   * Set configuration values from a file.
   *
   * The type of file is determined based on extension. Supported extensions:
   * .json for JSON, .yml, .yaml for YAML.
   *
   * @param source Path to the source file.
   */
  async loadFromFile(source: string): Promise<void> {
    const extension = path.extname(source);

    if (extension === '.json') {
      const values = JSON.parse(await fs.readFile(source, 'utf8'));
      this.setMany(values);
    } else if (extension === '.yml' || extension === '.yaml') {
      const values = yaml.safeLoad(await fs.readFile(source, 'utf8'));
      this.setMany(values);
    } else {
      throw new Error(`Unrecognized file extension: ${extension}`);
    }
  }

  get(key: string): unknown {
    if (!this._values[key]) {
      throw new Error(`Not defined: ${key}`);
    }
    return this._values[key].value;
  }

  getMany(keys: string[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key of keys) {
      result[key] = this.get(key);
    }
    return result;
  }
}
