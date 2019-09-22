import { toArray } from '@mtti/funcs';
import NodeVault from 'node-vault';
import {
  stringify,
  stringifyArray,
} from './utils';

export type ValueContainer = {
  define: (keys: string|string[]) => Value;
};

export class Value {
  private _parent: ValueContainer;

  private _keys: string[];

  private _default?: string[];

  private _env: string[] = [];

  private _arg: string[] = [];

  private _vaultPath?: string;

  private _vaultKey?: string;

  private _values: string[]|null = null;

  private _mutable: boolean = true;

  /**
   * The main key of the configuration option.
   */
  get key(): string {
    return this._keys[0];
  }

  /**
   * Get the value as an array.
   */
  get value(): string[] {
    this._mutable = false;

    if (this._values) {
      return [...this._values];
    }
    if (this._default) {
      return [...this._default];
    }
    throw new Error(`Not set: ${this.key}`);
  }

  /**
   * A boolean indicating if any value has been set.
   */
  get hasValue(): boolean {
    return (!!this._values || !!this._default);
  }

  constructor(parent: ValueContainer, keys: string|string[]) {
    this._parent = parent;
    this._keys = toArray(keys);
  }

  define(keys: string|string[]): Value {
    return this._parent.define(keys);
  }

  default(value: string|string[]): this {
    this._default = stringifyArray(toArray(value));
    return this;
  }

  env(value: string|string[]): this {
    this._env = toArray(value);
    return this;
  }

  arg(value: string|string[]): this {
    this._arg = toArray(value);
    return this;
  }

  /**
   * Define HashiCorp Vault secret path and key to fetch value from.
   *
   * @param path Path to the secret.
   * @param key Key under the `data` object in the Vault response.
   */
  vault(path: string, key: string): this {
    this._vaultPath = path;
    this._vaultKey = key;
    return this;
  }

  set(value: string|string[]): this {
    if (!this._mutable) {
      throw new Error(`${this.key} is immutable`);
    }
    this._values = stringifyArray(toArray(value));
    return this;
  }

  setRaw(value: string): this {
    if (typeof value !== 'string') {
      throw new Error('setRaw requires a string');
    }
    this.set(value.split(','));
    return this;
  }

  setFromObj(source: Record<string, string|string[]>): this {
    for (const key of this._keys) {
      if (source[key]) {
        this.set(source[key]);
      }
    }
    return this;
  }

  setFromEnv(env: Record<string, string>): this {
    for (const key of this._env) {
      if (env[key]) {
        this.setRaw(env[key]);
      }
    }
    return this;
  }

  setFromArgs(args: Record<string, unknown>): this {
    for (const key of this._arg) {
      if (args[key]) {
        this.setRaw(stringify(args[key]));
      }
    }
    return this;
  }

  async setFromVault(vaultClient: NodeVault.Client): Promise<boolean> {
    if (!this._vaultPath || !this._vaultKey) {
      return false;
    }
    const response = await vaultClient.read(this._vaultPath);

    if (!response.data) {
      return false;
    }
    if (!response.data[this._vaultKey]) {
      return false;
    }

    this.setRaw(stringify(response.data[this._vaultKey]));
    return true;
  }
}
