import { ValidationBuilderDSL, ValidationDescriptor, ValidationDescriptors } from './dsl';
import { Dict, Nested, assert, flatten } from './utils';

export default function extend(parent: ValidationDescriptors, extensions: FieldsExtensionsDSL): ValidationDescriptors {
  // for each extension field
  // if the field exists on the parent, we should expect append/replace merge , error if not.
  // else it doesn't exist, we should expect to build , error if not.

  return parent;
}

export type FieldsExtensionsDSL = Dict<Nested<ValidationBuilderDSL>>;


export function append(validations: Nested<ValidationBuilderDSL>) {
  return new Append(validations);
}

export class Append implements ValidationBuilderDSL {
  constructor(private validations: Nested<ValidationBuilderDSL>) {
  }

  keys(...keys: string[]): ValidationBuilderDSL {
    throw `not implemented`;
  }

  on(...contexts: string[]): ValidationBuilderDSL {
    throw `not implemented`;
  }

  build(field: string): ValidationDescriptor {
    throw `cannot use \`append()\` when there are no existing validations defined for \`${field}\``;
  }

  merge(field: string, existing: ValidationDescriptor[]): ValidationDescriptor[] {
    // TODO: clone `existing` instead of using directly.
    let validators: ValidationDescriptor[] = existing;

    for (let builder of flatten(this.validations)) {
      validators.push(builder.build(field));
    }

    return validators;
  }
}

export function replace(validations: Nested<ValidationBuilderDSL>) {
  return new Replace(validations);
}

export class Replace implements ValidationBuilderDSL {
  constructor(private validations: Nested<ValidationBuilderDSL>) {
  }

  keys(...keys: string[]): ValidationBuilderDSL {
    throw `not implemented`;
  }

  on(...contexts: string[]): ValidationBuilderDSL {
    throw `not implemented`;
  }

  build(field: string): ValidationDescriptor {
    throw `cannot use \`replace()\` when there are no existing validations defined for \`${field}\``;
  }

  merge(field: string, existing: ValidationDescriptor[]): ValidationDescriptor[] {
    let validators: ValidationDescriptor[] = [];

    for (let builder of flatten(this.validations)) {
      validators.push(builder.build(field));
    }

    return validators;
  }
}
