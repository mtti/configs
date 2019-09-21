/**
 * Return the first item in an array if it only has one item, otherwise throw
 * an error.
 *
 * @param source An item or an awway of items.
 */
export function expectSingle<T>(source: T|T[]): T {
  if (Array.isArray(source)) {
    if (source.length !== 1) {
      throw new Error(`Expected a single value, got ${source.length}`);
    }
    return source[0];
  }
  return source;
}
