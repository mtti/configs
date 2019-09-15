import {
  isItemType,
  toArray,
  validateItems,
} from './utils';
import {
  ItemType,
  ValidItemTypes,
  ValidValueTypes,
  ValueType,
} from './types';

export type ValueContainer = {
  define: (keys: string|string[]) => Value;
};

export class Value {
  private _parent: ValueContainer;

  private _keys: string[];

  private _default?: unknown;

  private _env: string[] = [];

  private _array: boolean = false;

  private _type?: ItemType = String;

  private _transformer?: (value: unknown) => unknown[];

  private _validator?: (value: any) => boolean;

  private _value?: unknown[];

  get value(): unknown {
    if (this._value) {
      if (this._array) {
        return this._value;
      }
      return this._value[0];
    }

    if (this._default) {
      return this._default;
    }
    throw new Error(`Not set: ${this._keys[0]}`);
  }

  constructor(parent: ValueContainer, keys: string|string[]) {
    this._parent = parent;
    this._keys = toArray(keys);
  }

  define(keys: string|string[]): Value {
    return this._parent.define(keys);
  }

  default(value: unknown): this {
    this._default = value;
    return this;
  }

  env(value: string|string[]): this {
    this._env = toArray(value);
    return this;
  }

  /**
   * Set the type of the value.
   *
   * @param valueType One of `Array`, `String` or `Number`.
   * @param itemType `String` or `Number` is `valueType` is `Array`.
   */
  type(valueType: ValueType, itemType?: ItemType): this {
    if (this._type) {
      throw new Error(`Type already set: ${this._keys[0]}`);
    }

    if (!ValidValueTypes.includes(valueType)) {
      throw new Error(`Invalid value type: ${valueType}`);
    }

    if (isItemType(valueType)) {
      if (itemType) {
        throw new Error('Item type not allowed if type is not Array');
      }
      this._array = false;
      this._type = valueType;
    } else {
      if (!itemType) {
        throw new Error('Item type is required when type is Array');
      }
      if (!ValidItemTypes.includes(itemType)) {
        throw new Error(`Invalid item type: ${itemType}`);
      }
      this._array = true;
      this._type = itemType;
    }

    return this;
  }

  /**
   * Set a function to transform the raw value before it's set.
   *
   * @param transformer
   */
  transform(transformer: (value: unknown) => unknown[]): this {
    this._transformer = transformer;
    return this;
  }

  /**
   * Set a function to validate value before it's set.
   *
   * @param validator
   */
  validate(validator: (value: any) => boolean): this {
    this._validator = validator;
    return this;
  }

  set(value: unknown): this {
    let transformedValue: unknown[];
    if (this._transformer) {
      transformedValue = this._transformer(value);
    } else if (Array.isArray(value)) {
      transformedValue = value;
    } else {
      transformedValue = [value];
    }

    if (!this._validate(transformedValue)) {
      throw new Error(`Invalid value given for: ${this._keys[0]}`);
    }

    this._value = transformedValue;
    return this;
  }

  setFromObj(source: Record<string, unknown>): this {
    for (const key of this._keys) {
      if (source[key]) {
        this.set(source[key]);
      }
    }
    return this;
  }

  setFromEnv(env: Record<string, unknown>): this {
    for (const key of this._env) {
      if (env[key]) {
        this.set(env[key]);
      }
    }
    return this;
  }

  private _validate(value: unknown[]): boolean {
    if (!this._type) {
      throw new Error(`Type not set: ${this._keys[0]}`);
    }

    if (!validateItems(this._type, value)) {
      return false;
    }

    if (this._validator) {
      return this._validator(value);
    }

    return true;
  }
}
