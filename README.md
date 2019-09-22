[![npm version](https://badge.fury.io/js/%40mtti%2Fconfigs.svg)](https://badge.fury.io/js/%40mtti%2Fconfigs) [![Build Status](https://travis-ci.org/mtti/configs.svg?branch=master)](https://travis-ci.org/mtti/configs)

Simple TypeScript application configuration manager. Not intended to be a fully featured, extensively configurable parser but a lightweight solution for situations that just require mapping string keys to string values.

* Keys are always strings. Each value can be aliased to multiple keys.
* Option values can be strings or arrays of strings.
* Separate key map for setting values from environment variables.

## Usage example

```typescript
import { Configs } from '@mtti/configs';

const configs = new Configs();

configs.define('redisUrl')
  .default('redis://localhost:6379/0')
  .env('REDIS_URL');

```
