import { Configs } from './Configs';
import { injectFunction } from '@mtti/deps';

export function getConfig(key: string): (config: Configs) => Promise<unknown> {
  const result = async (config: Configs): Promise<unknown> => config.get(key);
  injectFunction([Configs], result);
  return result;
}

export function getConfigs(
  keys: string[],
): (config: Configs) => Promise<Record<string, unknown>> {
  const result = async (configs: Configs): Promise<Record<string, unknown>> => (
    configs.getMany(keys)
  );
  injectFunction([Configs], result);
  return result;
}
