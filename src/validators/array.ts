import { Environment, ValidationDescriptor, ValidationError, validate } from '@validations/core';
import normalize, { ValidationBuilder, validates } from '@validations/dsl';
import { Task } from 'no-show';
import { Option, unknown } from 'ts-std';
import { ValidatorInstance, factoryFor } from './abstract';
import { isArray } from './is';

function mapError({ path, message }: ValidationError, index: number): ValidationError {
  return { path: [...path, String(index)], message };
}

export class ItemsValidator<T> implements ValidatorInstance<unknown[]> {
  constructor(protected env: Environment, protected descriptor: ValidationDescriptor<T>) {}

  run(value: T[], context: Option<string>): Task<ValidationError[]> {
    return new Task(async run => {
      let errors: ValidationError[] = [];

      for (let i = 0; i < value.length; i++) {
        let suberrors = await run(validate(this.env, value[i], this.descriptor, context));
        errors.push(...suberrors.map(error => mapError(error, i)));
      }

      return errors;
    });
  }
}

export function items<T, U>(builder: ValidationBuilder<T, U>): ValidationBuilder<T[], U[]> {
  return validates(factoryFor(ItemsValidator), normalize(builder));
}

export function array<T>(builder: ValidationBuilder<unknown, T>): ValidationBuilder<unknown, T[]> {
  return isArray().andThen(items(builder));
}
