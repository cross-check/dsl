import { ValidationDescriptor, ValidatorFactory } from '@validations/core';
import { assert, unknown } from 'ts-std';
import { MapErrorTransform, ValidationDescriptors, and, chain, mapError, or } from './combinators';
import { descriptor } from './internal';

export function build<T, U>(buildable: ValidationBuilder<T, U>): ValidationDescriptor<T> {
  return buildable.build();
}

export function validates<T, U, Options>(factory: ValidatorFactory<T, Options>, options: Options): ValidationBuilder<T, U> {
  return new BaseValidationBuilder(factory, options);
}

export function extend<T, U>({ factory, options, contexts }: ValidationDescriptor<T, unknown>): ValidationBuilder<T, U> {
  if (contexts.length > 0) {
    return new OnBuilder(factory, options as ValidationDescriptors<T>, contexts);
  } else if (factory === and) {
    return new AndBuilder(factory, options as any, contexts);
  } else if (factory === or) {
    return new OrBuilder(factory, options as any, contexts);
  } else if (factory === chain) {
    return new ChainBuilder(factory, options as any, contexts);
  } else {
    return new BaseValidationBuilder(factory, options, contexts);
  }
}

export interface ValidationBuilder<T, U> {
  /** @internal */
  output: U;

  andAlso<U2>(validation: ValidationBuilder<T, U2>): ValidationBuilder<T, U & U2>;
  or<U2>(validation: ValidationBuilder<T, U2>): ValidationBuilder<T, U | U2>;
  andThen<U2>(validation: ValidationBuilder<U, U2>): ValidationBuilder<T, U2>;
  catch(transform: MapErrorTransform): ValidationBuilder<T, U>;
  on(...contexts: string[]): ValidationBuilder<T, U>;

  /** @internal */
  build(): ValidationDescriptor<T>;
}

class BaseValidationBuilder<T, U, Options> implements ValidationBuilder<T, U> {
  /** @internal */
  output: U;

  constructor(protected factory: ValidatorFactory<T, Options>, protected options: Options, protected contexts: ReadonlyArray<string> = []) {
  }

  andAlso<U2>(validation: ValidationBuilder<T, U2>): ValidationBuilder<T, U & U2> {
    return new AndBuilder(and, [build(this), build(validation)], this.contexts);
  }

  or<U2>(validation: ValidationBuilder<T, U2>): ValidationBuilder<T, U | U2> {
    return new OrBuilder(or, [build(this), build(validation)], this.contexts);
  }

  andThen<U2>(validation: ValidationBuilder<U, U2>): ValidationBuilder<T, U2> {
    return new ChainBuilder(chain, [build(this), build(validation)] as any, this.contexts);
  }

  catch(transform: MapErrorTransform): ValidationBuilder<T, U> {
    let options = { descriptor: build(this), transform };

    return new BaseValidationBuilder(mapError as ValidatorFactory<T, typeof options>, options, this.contexts);
  }

  on(...contexts: string[]): ValidationBuilder<T, U> {
    return new OnBuilder(this.factory, this.options, contexts);
  }

  build(): ValidationDescriptor<T> {
    return descriptor(this.factory as ValidatorFactory<T, unknown>, this.options, this.contexts);
  }
}

class AndBuilder<T, U> extends BaseValidationBuilder<T, U, ReadonlyArray<ValidationDescriptor<T>>> {
  andAlso<U2>(validation: ValidationBuilder<T, U2>): ValidationBuilder<T, U & U2> {
    return new AndBuilder(this.factory, [...this.options, build(validation)], this.contexts);
  }
}

class OrBuilder<T, U> extends BaseValidationBuilder<T, U, ReadonlyArray<ValidationDescriptor<T>>> {
  or<U2>(validation: ValidationBuilder<T, U2>): ValidationBuilder<T, U | U2> {
    return new OrBuilder(this.factory, [...this.options, build(validation)], this.contexts);
  }
}

class ChainBuilder<T, U> extends BaseValidationBuilder<T, U, ReadonlyArray<ValidationDescriptor<T>>> {
  andThen<U2>(validation: ValidationBuilder<U, U2>): ValidationBuilder<T, U2> {
    return new ChainBuilder(this.factory, [...this.options, build(validation)] as any, this.contexts);
  }
}

class OnBuilder<T, U, Options> extends BaseValidationBuilder<T, U, Options> {
  constructor(factory: ValidatorFactory<T, Options>, options: Options, contexts: ReadonlyArray<string>) {
    assert(!!contexts.length, 'You must provide at least one validation context');
    super(factory, options, contexts);
  }

  on(...contexts: string[]): ValidationBuilder<T, U> {
    return new OnBuilder(this.factory, this.options, contexts);
  }
}
