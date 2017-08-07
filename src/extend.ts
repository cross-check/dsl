import { ValidationBuilderDSL, ValidationDescriptor, ValidationDescriptors } from './dsl';
import { Dict, Nested, assert, flatten } from './utils';
import { cloneDeep } from 'lodash';

export default function extend(parent: ValidationDescriptors, extensions: FieldsExtensionsDSL): ValidationDescriptors {
  let existingDescriptors: ValidationDescriptors = cloneDeep(parent);

  for (let extensionField of Object.keys(extensions)) {
    if (parent[extensionField]) {
      existingDescriptors = mergeExtensions(extensionField, existingDescriptors, extensions);
    } else {
      existingDescriptors[extensionField] = buildValidators(extensionField, existingDescriptors, extensions);
    }
  }

  return existingDescriptors;
}

export type FieldsExtensionsDSL = Dict<Nested<ValidationBuilderDSL>>;

function mergeExtensions(extensionField: string, existingDescriptors: ValidationDescriptors, extensions: FieldsExtensionsDSL): ValidationDescriptors {
  for (let merger of flatten(extensions[extensionField])) {
    existingDescriptors[extensionField] = merger.merge(extensionField, existingDescriptors[extensionField]);
  }
  return existingDescriptors;
}

function buildValidators(extensionField: string, existingDescriptors: ValidationDescriptors, extensions: FieldsExtensionsDSL): ValidationDescriptor[] {
  let validators: ValidationDescriptor[] = existingDescriptors[extensionField] = [];

  for (let builder of flatten(extensions[extensionField])) {
    validators.push(builder.build(extensionField));
  }
  return validators;
}

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
    throw new Error(`cannot use \`append()\` when there are no existing validations defined for \`${field}\``);
  }

  merge(field: string, existing: ValidationDescriptor[]): ValidationDescriptor[] {
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
    throw new Error(`cannot use \`replace()\` when there are no existing validations defined for \`${field}\``);
  }

  merge(field: string, existing: ValidationDescriptor[]): ValidationDescriptor[] {
    let validators: ValidationDescriptor[] = [];

    for (let builder of flatten(this.validations)) {
      validators.push(builder.build(field));
    }

    return validators;
  }
}
