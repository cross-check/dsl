import { ValidationBuilder, validates } from '@validations/dsl';

// this namespace provides multi() versions of the key testing validators so it's easy
// to confirm that all of the functionality works with them.
//
// It probably makes sense to convert this into a class-based test harness. TODO.

export const confirmation: ValidationBuilder = validates('confirmation');
export const presence: ValidationBuilder = validates('presence');

export function email(tlds?: string[]) {
  let validation = tlds ? validates('email', { tlds }) : validates('email');
  return present(validation);
}

export function present(validator: ValidationBuilder) {
  return presence.and(validator);
}
