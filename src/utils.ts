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

/**
 * Construct an object from an array of key-value pairs.
 *
 * @param entries
 */
export function fromEntries<T>(entries: [string, T][]): Record<string, T> {
  return entries
    .reduce((
      result,
      [key, value],
    ) => ({ ...result, [key]: value }),
    ({} as Record<string, T>));
}

export function isStringArray(subject: unknown): subject is string[] {
  if (!Array.isArray(subject)) {
    return false;
  }

  if (subject.some((value) => typeof value !== 'string')) {
    return false;
  }

  return true;
}

export function stringify(source: unknown): string[] {
  return toArray(source).map((value) => {
    const type = typeof value;

    if (type === 'string') {
      return value as string;
    }
    if (type === 'number') {
      return (value as number).toString(10);
    }

    throw new Error(`Expected string or number, got ${type}`);
  });
}

export function cleanEnvEntries(
  subject: [string, string|undefined][],
): [string, string][] {
  const filtered = subject.filter(([, value]) => value !== undefined);

  const nonStringKeys = filtered
    .filter(([, value]) => typeof value !== 'string')
    .map(([key]) => key);
  if (nonStringKeys.length > 0) {
    throw new Error(`Unexpected non-string values in: ${nonStringKeys.join(',')}`);
  }

  return filtered as [string, string][];
}

export function cleanEnv(
  subject: Record<string, string|undefined>,
): Record<string, string> {
  return fromEntries(cleanEnvEntries(Object.entries(subject)));
}
