/**
 * The functions in this file should not be re-exported from index.ts
 */

import { ValidationDescriptor, ValidatorFactory } from '@validations/core';

/** @internal */
export function descriptor<T, Options>(
  factory: ValidatorFactory<T, Options>,
  options: Options,
  contexts: ReadonlyArray<string>
): ValidationDescriptor<T, Options> {
  return { factory, options, contexts };
}
