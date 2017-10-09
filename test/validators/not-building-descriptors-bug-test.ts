import { ValidationError } from '@validations/core';
import { validators } from '@validations/dsl';
import { run } from '../support';

QUnit.module('Validators bug');

function success(): ValidationError[] {
  return [];
}

QUnit.test('should have to call build on validatorBuilder first', async assert => {
  // how do both of these tests pass????
  // note we are not calling build on this validationBuilder.
  assert.deepEqual(await run(validators.isNumber(), 5), success());
  assert.throws(await run(validators.isNumber(), 5));
});
