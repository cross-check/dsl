import dsl, { on, validates, ValidationDescriptor } from '../src';

QUnit.module('DSL');

QUnit.test('basic DSL', assert => {
  let validations = dsl({
    name: validates('presence'),
    email: [
      validates('presence'),
      validates('email', { tlds: ['.com', '.net', '.org', '.edu', '.gov'] }),
    ]
  });

  let expected: ValidationDescriptor[] = [
    {
      field: 'name',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: null
    },
    {
      field: 'email',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: null
    },
    {
      field: 'email',
      validator: { name: 'email', args: [
        { tlds: ['.com', '.net', '.org', '.edu', '.gov'] }
      ] },
      keys: null,
      contexts: null
    }
  ];

  assert.deepEqual(validations, expected);
});

QUnit.test('dependent keys', assert => {
  assert.throws(
    () => validates('foo').keys(),
    /must provide at least one dependent key/
  );

  let validations = dsl({
    name: validates('presence').keys('firstName', 'lastName'),
    email: [
      validates('presence'),
      validates('email'),
    ],
    emailConfirmation: validates('confirmation').keys('email')
  });

  let expected: ValidationDescriptor[] = [
    {
      field: 'name',
      validator: { name: 'presence', args: [] },
      keys: ['firstName', 'lastName'],
      contexts: null
    },
    {
      field: 'email',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: null
    },
    {
      field: 'email',
      validator: { name: 'email', args: [] },
      keys: null,
      contexts: null
    },
    {
      field: 'emailConfirmation',
      validator: { name: 'confirmation', args: [] },
      keys: ['email'],
      contexts: null
    }
  ];

  assert.deepEqual(validations, expected);
});

QUnit.test('validation contexts', assert => {
  assert.throws(
    () => validates('foo').on(),
    /must provide at least one validation context/
  );

  let validations = dsl({
    name: validates('presence').on('create', 'update'),
    email: on('create').do([
      validates('presence'),
      validates('email'),
    ]),
  });

  let expected: ValidationDescriptor[] = [
    {
      field: 'name',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: ['create', 'update']
    },
    {
      field: 'email',
      validator: { name: 'presence', args: [] },
      keys: null,
      contexts: ['create']
    },
    {
      field: 'email',
      validator: { name: 'email', args: [] },
      keys: null,
      contexts: ['create']
    }
  ];

  assert.deepEqual(validations, expected);
});


QUnit.test('does not mutate previously defined validations', assert => {
  let originalValidation = validates('presence');
  let anotherValidation = originalValidation.keys('firstName', 'lastName');
  console.log(originalValidation, anotherValidation);

  assert.deepEqual(originalValidation, anotherValidation);
});