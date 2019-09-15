import { ItemType, ValueType } from './types';

/**
 * Return `value` if it's an array, or an array with just `value` if it's not.
 *
 * @param value
 */
export function toArray<T>(value: T|T[]): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

export function isValidItem(type: ValueType, item: unknown): boolean {
  if (type === Array) {
    return false;
  }

  if (type === String && typeof item !== 'string') {
    return false;
  }

  if (type === Number && typeof item !== 'number') {
    return false;
  }

  return true;
}

export function validateItems(type: ValueType, items: unknown[]): boolean {
  for (const item of items) {
    if (!isValidItem(type, item)) {
      return false;
    }
  }
  return true;
}

export function isItemType(type: ValueType): type is ItemType {
  return type !== Array;
}
