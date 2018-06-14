import {
  Environment,
  ValidationDescriptor,
  ValidationError,
  validate
} from "@cross-check/core";
import normalize, { ValidationBuilder, validates } from "@cross-check/dsl";
import { Task } from "no-show";
import { Dict, Indexable, Option, dict, entries, unknown } from "ts-std";
import { ValidatorClass, ValidatorInstance, factoryFor } from "./abstract";
import { isObject } from "./is";

function mapError(
  { path, message }: ValidationError,
  key: string
): ValidationError {
  return { path: [key, ...path], message };
}

/**
 * @api primitive
 *
 * The class that powers the `fields()` validator function.
 *
 * Use this if you want to refine this validator and implement your own
 * custom `fields()`.
 */
export class FieldsValidator<T> implements ValidatorInstance<Indexable<T>> {
  static validatorName = "fields";

  constructor(
    protected env: Environment,
    protected descriptors: Dict<ValidationDescriptor<T>>
  ) {}

  run(value: Indexable<T>, context: Option<string>): Task<ValidationError[]> {
    return new Task(async run => {
      let errors: ValidationError[] = [];

      for (let [key, descriptor] of entries(this.descriptors)) {
        let suberrors = await run(
          validate(
            this.env.get(value, key) as T,
            descriptor!,
            context,
            this.env
          )
        );
        errors.push(...suberrors.map(error => mapError(error, key)));
      }

      return errors;
    });
  }
}

/**
 * @api primitive
 *
 * The class that powers the `allFieldsPresent()` validator function.
 */
export class AllFieldsPresentValidator<T> implements ValidatorInstance<Indexable<T>> {
  static validatorName = "all-fields-present";

  constructor(
    protected env: Environment,
    protected descriptors: Dict<ValidationDescriptor<T>>
  ) { }

  run(value: Indexable<T>): Task<ValidationError[]> {
    return new Task(async () => {
      let errors: ValidationError[] = [];
      let valueKeys = Object.keys(value);

      for (let [key] of entries(this.descriptors)) {
        let index = valueKeys.indexOf(key.toString());
        if (index === -1) {
          // descriptor field is not present in the value
          errors.push({ path: [key.toString()], message: { name: "present", details: null } });
        }
      }

      return errors;
    });
  }
}

/**
 * @api primitive
 *
 * The class that powers the `noFieldsExtra()` validator function.
 */
export class NoFieldsExtraValidator<T> implements ValidatorInstance<Indexable<T>> {
  static validatorName = "no-fields-extra";

  constructor(
    protected env: Environment,
    protected descriptors: Dict<ValidationDescriptor<T>>
  ) { }

  run(value: Indexable<T>): Task<ValidationError[]> {
    return new Task(async () => {
      let errors: ValidationError[] = [];
      let valueKeys = Object.keys(value);

      for (let [key] of entries(this.descriptors)) {
        let index = valueKeys.indexOf(key.toString());
        if (index > -1) {
          valueKeys.splice(index, 1);
        }
      }

      // these fields were not present in the descriptors
      errors.push(...valueKeys.map(key => ({ path: [key], message: { name: "absent", details: null } })));

      return errors;
    });
  }
}

export function fields<T>(
  builders: Dict<ValidationBuilder<T>>
): ValidationBuilder<Indexable<T>> {
  return validates(
    "fields",
    factoryFor(FieldsValidator as ValidatorClass<
      Indexable<T>,
      Dict<ValidationDescriptor<T>>
    >),
    normalizeFields(builders)
  );
}

export function allFieldsPresent<T>(
  builders: Dict<ValidationBuilder<T>>
): ValidationBuilder<Indexable<T>> {
  return validates(
    "all-fields-present",
    factoryFor(AllFieldsPresentValidator as ValidatorClass<
      Indexable<T>,
      Dict<ValidationDescriptor<T>>
    >),
    normalizeFields(builders)
  );
}

export function noFieldsExtra<T>(
  builders: Dict<ValidationBuilder<T>>
): ValidationBuilder<Indexable<T>> {
  return validates(
    "no-fields-extra",
    factoryFor(NoFieldsExtraValidator as ValidatorClass<
      Indexable<T>,
      Dict<ValidationDescriptor<T>>
    >),
    normalizeFields(builders)
  );
}

/**
 * @api public
 */
export function object(
  builders: Dict<ValidationBuilder<unknown>>
): ValidationBuilder<unknown> {
  return isObject().andThen(fields(builders));
}

/**
 * @api public
 */
export function strictObject(
  builders: Dict<ValidationBuilder<unknown>>
): ValidationBuilder<unknown> {
  return isObject()
    .andThen(allFieldsPresent(builders).andAlso(noFieldsExtra(builders)))
    .andThen(fields(builders));
}

function normalizeFields<T>(
  builders: Dict<ValidationBuilder<T>>
): Dict<ValidationDescriptor<T>> {
  let out = dict<ValidationDescriptor<T>>();

  for (let [key, value] of entries(builders)) {
    out[key] = normalize(value!);
  }

  return out;
}
