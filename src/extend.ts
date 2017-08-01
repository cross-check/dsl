import { ValidationBuilderDSL, ValidationDescriptor, ValidationDescriptors } from './dsl';
import { Dict, Nested, assert, flatten } from './utils';

export default function extend(parent: ValidationDescriptors, extensions: FieldsExtensionsDSL): ValidationDescriptors {
  throw 'not implemented';
}

export type FieldsExtensionsDSL = Dict<Nested<ValidationBuilderDSL> | FieldExtensionDSL>;

export interface FieldExtensionDSL {
  merge(field: string, descriptors: ValidationDescriptor[]): ValidationDescriptor[];
}

export function append(validations: Nested<ValidationBuilderDSL>) {
  return new Append(validations);
}

class Append implements FieldExtensionDSL {
  constructor(private validations: Nested<ValidationBuilderDSL>) {
  }

  merge(field: string, existing: ValidationDescriptor[]): ValidationDescriptor[] {
    throw 'not implemented';
  }
}

export function replace(validations: Nested<ValidationBuilderDSL>) {
  return new Replace(validations);
}

class Replace implements FieldExtensionDSL {
  constructor(private validations: Nested<ValidationBuilderDSL>) {
  }

  merge(field: string, existing: ValidationDescriptor[]): ValidationDescriptor[] {
    throw 'not implemented';
  }
}
