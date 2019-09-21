import { expectSingle } from './expectSingle';
import fs from 'fs-extra';
import path from 'path';
import { Value } from './Value';
import yaml from 'js-yaml';
import { cleanEnv, fromEntries, toArray } from './utils';

export class Configs {
  private _values: Record<string, Value> = {};

  /**
   * Define a new configuration value.
   *
   * @param keys Key or keys to refer to the value by.
   */
  define(keys: string|string[]): Value {
    const keyArray = toArray(keys);
    const def = new Value(this, keyArray);

    for (const key of keyArray) {
      if (this._values[key]) {
        throw new Error(`Already defined: ${key}`);
      }
      this._values[key] = def;
    }

    return def;
  }

  setEnv(env: Record<string, string|undefined>): void {
    const cleaned = cleanEnv(env);
    Object.entries(this._values).forEach(([, value]) => {
      value.setFromEnv(cleaned);
    });
  }

  /**
   * Set multiple values at once.
   *
   * @param source Key-value pairs to set.
   */
  setMany(source: Record<string, string>): void {
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

  /**
   * Load configuration options from a file. If the file does not exist,
   * `false` is returned without throwing an error.
   *
   * @param source Path to the source file.
   */
  async tryFile(source: string): Promise<boolean> {
    try {
      await this.loadFromFile(source);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the value of a configuration option, expecting a single value. If
   * the option is undefined, has no value or has multiple values, an error
   * is thrown.
   *
   * @param key Name of the value to get
   */
  get(key: string): string {
    if (!this._values[key]) {
      throw new Error(`Not defined: ${key}`);
    }
    return expectSingle(this._values[key].value);
  }

  /**
   * Get the value of an option as an array regardless of how many values it
   * has. If the option is undefined or has no value, an error is thrown.
   *
   * @param key Name of the option to retrieve.
   */
  getArray(key: string): string[] {
    if (!this._values[key]) {
      throw new Error(`Not defined: ${key}`);
    }
    return this._values[key].value;
  }

  /**
   * Check if a configuration option has been set.
   *
   * @param key Name of the option of check
   */
  has(key: string): boolean {
    if (!this._values[key]) {
      return false;
    }
    return this._values[key].hasValue;
  }

  /**
   * Get many options at once, expecting all to be single values. If any option
   * is undefined or contains multiple values, an error is throw.
   *
   * @param keys Options keys to retrieve.
   */
  getMany(keys: string[]): Record<string, string> {
    return fromEntries(keys.map(
      (key): [string, string] => [key, this.get(key)],
    ));
  }
}
